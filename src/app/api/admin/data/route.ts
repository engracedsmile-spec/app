
import { NextResponse } from 'next/server';
import { getFirebaseAdmin, checkPermissions, verifyIdToken } from '@/lib/firebase/admin';
import type { Booking, User, FundRequest, ScheduledTrip, Expense, DriverApplication, Vehicle } from '@/lib/data';
import { getPricingSettings, type PricingSettings } from '@/lib/settings';
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

    const [bookingsSnap, usersSnap, fundRequestsSnap, scheduledTripsSnap, expensesSnap, driverApplicationsSnap, pricingSettingsDoc, vehiclesSnap, paymentsSnap, transfersSnap] = await Promise.all([
      fetchData('manageShipments', adminDb.collection('bookings').orderBy('createdAt', 'desc')),
      fetchData('manageUsers', adminDb.collection('users')),
      fetchData('managePayouts', adminDb.collection('fundRequests').where('status', '==', 'pending')),
      fetchData('manageShipments', adminDb.collection('scheduledTrips').orderBy('departureDate', 'desc')),
      fetchData('managePayouts', adminDb.collection('expenses').orderBy('date', 'desc')),
      fetchData('manageDrivers', adminDb.collection('driverApplications')),
      fetchDoc('manageSettings', adminDb.doc('settings/pricing')),
      fetchData('manageSettings', adminDb.collection('vehicles')),
      fetchData('managePayouts', adminDb.collection('payments').orderBy('date', 'desc')),
      fetchData('managePayouts', adminDb.collection('transfers').orderBy('date', 'desc')),
    ]);
    
    const bookings: Booking[] = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    const users: User[] = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    const fundRequests: FundRequest[] = fundRequestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FundRequest));
    const scheduledTrips: ScheduledTrip[] = scheduledTripsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduledTrip));
    const expenses: Expense[] = expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
    const driverApplications: DriverApplication[] = driverApplicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DriverApplication));
    const vehicles: Vehicle[] = vehiclesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
    const payments: any[] = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
