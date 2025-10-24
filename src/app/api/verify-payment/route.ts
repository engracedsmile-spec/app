
'use server';

import { getFirebaseAdmin } from '@/lib/firebase/admin';
import type { Booking, ScheduledTrip, Vehicle, ScheduledTripPassenger } from '@/lib/data';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    const { adminDb } = getFirebaseAdmin();
    const { reference, bookingId } = await request.json();
    
    console.log('Payment verification request:', { reference, bookingId });
    
    if (!bookingId) {
        return new Response(JSON.stringify({ message: "Booking ID is required." }), { status: 400 });
    }

    try {
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
            if (vehicleDoc && vehicleDoc.exists) {
                finalWifiPassword = vehicleDoc.data()?.wifiPassword || null;
                finalWifiSSID = vehicleDoc.data()?.wifiId || null;
            }

            const newStatus = bookingData.type === 'charter' ? 'Confirmed' : 'On Progress';
            transaction.update(bookingRef, { status: newStatus, wifiPassword: finalWifiPassword, wifiSSID: finalWifiSSID });

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
