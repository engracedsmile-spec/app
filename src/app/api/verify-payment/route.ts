
'use server';

import { getFirebaseAdmin } from '@/lib/firebase/admin';
import type { Booking, ScheduledTripPassenger } from '@/lib/data';
import { FieldValue } from 'firebase-admin/firestore';
import { getPaymentSettings } from '@/lib/settings';

export async function POST(request: Request) {
    const { adminDb } = getFirebaseAdmin();
    const { reference, bookingId } = await request.json();
    
    console.log('Payment verification request:', { reference, bookingId });
    
    if (!bookingId) {
        return new Response(JSON.stringify({ message: "Booking ID is required." }), { status: 400 });
    }

    try {
        if (!reference) {
            return new Response(JSON.stringify({ message: "Payment reference is required." }), { status: 400 });
        }

        const paymentSettings = await getPaymentSettings();
        if (!paymentSettings?.paystackLiveSecretKey) {
            console.error('verify-payment: Paystack secret key missing in settings');
            return new Response(JSON.stringify({ message: "Payment gateway is not configured. Please contact support." }), { status: 500 });
        }

        const verificationResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${paymentSettings.paystackLiveSecretKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!verificationResponse.ok) {
            console.error('verify-payment: Paystack verification failed with status', verificationResponse.status);
            return new Response(JSON.stringify({ message: "Unable to verify payment at this time." }), { status: 502 });
        }

        const verification = await verificationResponse.json();

        if (!verification?.status || verification.data?.status !== 'success') {
            console.error('verify-payment: Paystack returned unsuccessful status', verification?.data?.status);
            return new Response(JSON.stringify({ message: "Payment verification failed." }), { status: 402 });
        }

        const transactionData = verification.data;
        const amountInNaira = (transactionData.amount || 0) / 100;
        const paymentRef = adminDb.collection('payments').doc(reference);

        const bookingRef = adminDb.collection("bookings").doc(bookingId);
        let finalWifiPassword: string | null = null;
        let finalWifiSSID: string | null = null;
        
        await adminDb.runTransaction(async (transaction) => {
            // --- READ PHASE ---
            const bookingDoc = await transaction.get(bookingRef);
            if (!bookingDoc.exists) {
                throw new Error(`Booking with ID ${bookingId} not found.`);
            }
            const bookingData = bookingDoc.data() as Booking;

            if (bookingData.status !== 'Pending') {
                console.log(`Booking ${bookingId} already processed with status: ${bookingData.status}`);
                return;
            }
            
            console.log(`Processing payment verification for booking ${bookingId}`);

            let tripDoc: FirebaseFirestore.DocumentSnapshot | null = null;
            let vehicleDoc: FirebaseFirestore.DocumentSnapshot | null = null;

            if (bookingData.type === 'passenger' && bookingData.scheduledTripId) {
                const tripRef = adminDb.collection('scheduledTrips').doc(bookingData.scheduledTripId);
                tripDoc = await transaction.get(tripRef);

                if (tripDoc.exists) {
                    const vehicleId = tripDoc.data()?.vehicleId;
                    if (vehicleId) {
                        const vehicleRef = adminDb.collection('vehicles').doc(vehicleId);
                        vehicleDoc = await transaction.get(vehicleRef);
                    }
                } else {
                    throw new Error("Scheduled trip for this booking could not be found.");
                }
            }
            
            // --- ALL READS ARE DONE. NOW PERFORM WRITES. ---

            const existingPayment = await transaction.get(paymentRef);
            if (!existingPayment.exists) {
                transaction.set(paymentRef, {
                    id: reference,
                    reference,
                    amount: amountInNaira,
                    status: 'success',
                    customerEmail: transactionData?.customer?.email,
                    customerName: [transactionData?.customer?.first_name, transactionData?.customer?.last_name].filter(Boolean).join(' ') || null,
                    paymentMethod: 'paystack',
                    type: 'payment',
                    description: transactionData?.metadata?.description || 'Payment via Paystack',
                    date: FieldValue.serverTimestamp(),
                    originalDate: transactionData?.paid_at ? new Date(transactionData.paid_at) : transactionData?.created_at ? new Date(transactionData.created_at) : FieldValue.serverTimestamp(),
                    metadata: transactionData?.metadata || {},
                    rawData: transactionData,
                    syncedAt: FieldValue.serverTimestamp(),
                });
            } else {
                transaction.update(paymentRef, {
                    status: 'success',
                    amount: amountInNaira,
                    metadata: transactionData?.metadata || {},
                    rawData: transactionData,
                    customerEmail: transactionData?.customer?.email,
                    customerName: [transactionData?.customer?.first_name, transactionData?.customer?.last_name].filter(Boolean).join(' ') || existingPayment.data()?.customerName || null,
                });
            }

            if (vehicleDoc && vehicleDoc.exists) {
                finalWifiPassword = vehicleDoc.data()?.wifiPassword || null;
                finalWifiSSID = vehicleDoc.data()?.wifiId || null;
            }

            const newStatus = bookingData.type === 'charter' ? 'Confirmed' : 'On Progress';
            transaction.update(bookingRef, { 
                status: newStatus, 
                wifiPassword: finalWifiPassword, 
                wifiSSID: finalWifiSSID,
                paymentReference: reference,
                paymentDate: FieldValue.serverTimestamp(),
            });

            if (tripDoc && tripDoc.exists) {
                 const allPassengerNames = [bookingData.passengerName, ...(bookingData.passengers || [])].filter(Boolean);
                 const newPassengers: ScheduledTripPassenger[] = (bookingData.seats || []).map((seat, index) => ({
                    name: allPassengerNames[index] || `Passenger ${index + 1}`,
                    seat: seat,
                }));

                const seatUpdates: { [key: string]: any } = {
                    bookedSeats: FieldValue.arrayUnion(...(bookingData.seats || [])),
                    passengers: FieldValue.arrayUnion(...newPassengers)
                };

                (bookingData.seats || []).forEach(seat => {
                    seatUpdates[`seatHolds.${seat}`] = FieldValue.delete();
                });
                
                transaction.update(tripDoc.ref, seatUpdates);
            }
        });
        
        const finalBookingDoc = await bookingRef.get();
        const finalBookingData = finalBookingDoc.data() as Booking;
        
        const bookingDetailsForClient = {
            code: finalBookingData.id,
            passengerName: finalBookingData.passengerName,
            passengers: finalBookingData.passengers,
            pickupAddress: finalBookingData.pickupAddress,
            destinationAddress: finalBookingData.destinationAddress,
            itemDescription: finalBookingData.itemDescription,
            travelDate: finalBookingData.travelDate,
            title: finalBookingData.title,
            wifiPassword: finalBookingData.wifiPassword,
            wifiSSID: finalBookingData.wifiSSID,
        };

        return new Response(JSON.stringify({ success: true, bookingDetails: bookingDetailsForClient }), { status: 200 });

    } catch (error: any) {
        console.error("Error finalizing booking:", error);
        return new Response(JSON.stringify({ message: error.message || "An internal server error occurred during booking finalization." }), { status: 500 });
    }
}
