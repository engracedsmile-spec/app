
import { NextResponse } from 'next/server';
import { getFirebaseAdmin, checkPermissions, verifyIdToken } from '@/lib/firebase/admin';
import type { Booking, User, FundRequest, ScheduledTrip, Expense, DriverApplication, Vehicle } from '@/lib/data';
import { getPricingSettings, getPaymentSettings, type PricingSettings } from '@/lib/settings';
import { PERMISSIONS, type Role } from '@/lib/permissions';

export async function GET(request: Request) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization token provided' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    await checkPermissions(idToken, 'viewDashboard');

    const decodedToken = await verifyIdToken(idToken);
    const userSnapshot = await adminDb.doc(`users/${decodedToken.uid}`).get();
    const userData = userSnapshot.data()
    if (!userData) {
      throw new Error(`User with UID ${decodedToken.uid} not found in Firestore.`);
    }

    const userRole = userData.role as Role;
    const userPermissions = PERMISSIONS[userRole] || [];

    const fetchData = async (permission: string, query: FirebaseFirestore.Query) => {
        if (!userPermissions.includes(permission)) return { docs: [] };
        return query.get();
    }
    
    const fetchDoc = async (permission: string, docRef: FirebaseFirestore.DocumentReference) => {
        if (!userPermissions.includes(permission)) return null;
        return docRef.get();
    }

    // Fetch payments directly from Paystack instead of Firestore
    const fetchPaystackPayments = async (): Promise<any[]> => {
        if (!userPermissions.includes('managePayouts')) return [];
        
        try {
            const paymentSettings = await getPaymentSettings();
            const secretKey = paymentSettings?.paystackLiveSecretKey;
            
            if (!secretKey) {
                console.warn('Paystack secret key not configured, returning empty payments array');
                return [];
            }

            // Fetch last 500 transactions from Paystack (last 120 days)
            const today = new Date();
            const startDate = new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000);
            const startDateString = startDate.toISOString().split('T')[0];
            const endDateString = today.toISOString().split('T')[0];

            const allTransactions: any[] = [];
            let page = 1;
            const perPage = 100;

            while (allTransactions.length < 500) {
                const params = new URLSearchParams({
                    perPage: perPage.toString(),
                    page: page.toString(),
                });
                params.append('from', startDateString);
                params.append('to', endDateString);

                const url = `https://api.paystack.co/transaction?${params.toString()}`;
                
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
                    },
                });

                if (!response.ok) {
                    console.error(`Paystack API error: ${response.status}`);
                    break;
                }

                const data = await response.json();
                
                if (!data.status || !data.data || data.data.length === 0) {
                    break;
                }

                // Transform Paystack transactions to match the expected format
                const transformed = data.data.map((tx: any) => ({
                    id: tx.reference,
                    reference: tx.reference,
                    amount: tx.amount / 100, // Convert from kobo to naira
                    status: tx.status === 'success' ? 'success' : tx.status,
                    customerEmail: tx.customer?.email,
                    customerName: tx.customer ? `${tx.customer.first_name || ''} ${tx.customer.last_name || ''}`.trim() : '',
                    paymentMethod: 'paystack',
                    type: 'payment',
                    description: tx.metadata?.description || 'Payment via Paystack',
                    date: tx.paid_at ? new Date(tx.paid_at) : tx.created_at ? new Date(tx.created_at) : new Date(),
                    originalDate: tx.paid_at ? new Date(tx.paid_at) : tx.created_at ? new Date(tx.created_at) : new Date(),
                    metadata: tx.metadata || {},
                }));

                allTransactions.push(...transformed);
                
                if (data.data.length < perPage || allTransactions.length >= 500) {
                    break;
                }
                
                page++;
            }

            // Sort by date descending (most recent first)
            return allTransactions
                .sort((a, b) => {
                    const dateA = a.originalDate || a.date || new Date(0);
                    const dateB = b.originalDate || b.date || new Date(0);
                    return dateB.getTime() - dateA.getTime();
                })
                .slice(0, 500);
        } catch (error) {
            console.error('Error fetching Paystack payments:', error);
            return [];
        }
    };

    const [bookingsSnap, usersSnap, fundRequestsSnap, scheduledTripsSnap, expensesSnap, driverApplicationsSnap, pricingSettingsDoc, vehiclesSnap, transfersSnap] = await Promise.all([
      fetchData('manageShipments', adminDb.collection('bookings').orderBy('createdAt', 'desc').limit(500)),
      fetchData('manageUsers', adminDb.collection('users').limit(500)),
      fetchData('managePayouts', adminDb.collection('fundRequests').where('status', '==', 'pending').limit(200)),
      fetchData('manageShipments', adminDb.collection('scheduledTrips').orderBy('departureDate', 'desc').limit(300)),
      fetchData('managePayouts', adminDb.collection('expenses').orderBy('date', 'desc').limit(300)),
      fetchData('manageDrivers', adminDb.collection('driverApplications').limit(200)),
      fetchDoc('manageSettings', adminDb.doc('settings/pricing')),
      fetchData('manageSettings', adminDb.collection('vehicles').limit(300)),
      fetchData('managePayouts', adminDb.collection('transfers').orderBy('date', 'desc').limit(500)),
    ]);

    // Fetch payments directly from Paystack (no Firestore index needed!)
    const payments = await fetchPaystackPayments();
    
    const bookings: Booking[] = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    const users: User[] = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    const fundRequests: FundRequest[] = fundRequestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FundRequest));
    const scheduledTrips: ScheduledTrip[] = scheduledTripsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduledTrip));
    const expenses: Expense[] = expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
    const driverApplications: DriverApplication[] = driverApplicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DriverApplication));
    const vehicles: Vehicle[] = vehiclesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
    const transfers: any[] = transfersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const pricingSettings = pricingSettingsDoc?.data() as PricingSettings || null;

    return NextResponse.json({ bookings, users, fundRequests, scheduledTrips, expenses, pricingSettings, driverApplications, vehicles, payments, transfers });
  } catch (error: any) {
    console.error("API Error in /api/admin/data:", error);
    if (error.message.includes("Firebase Admin SDK is not initialized")) {
        return NextResponse.json({ message: "Server Error: Firebase Admin SDK not initialized." }, { status: 500 });
    }
    const status = error.message.includes("Permission Denied") ? 403 : 500;
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status });
  }
}
