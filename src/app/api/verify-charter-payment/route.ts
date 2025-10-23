
'use server';

import { getFirebaseAdmin } from '@/lib/firebase/admin';
import type { Booking } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { adminDb } = getFirebaseAdmin();
    const { reference, bookingId } = await request.json();
    
    if (!bookingId) {
        return NextResponse.json({ message: "Booking ID is required." }, { status: 400 });
    }

    try {
        const bookingRef = adminDb.collection("bookings").doc(bookingId);
        
        await adminDb.runTransaction(async (transaction) => {
            const bookingDoc = await transaction.get(bookingRef);
            if (!bookingDoc.exists) {
                throw new Error(`Booking with ID ${bookingId} not found.`);
            }
            const bookingData = bookingDoc.data() as Booking;

            if (bookingData.status !== 'Pending') {
                console.log(`Charter booking ${bookingId} already processed with status: ${bookingData.status}`);
                return;
            }

            // Simple status update for charters
            transaction.update(bookingRef, { status: 'Confirmed' });
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
            bookingType: finalBookingData.bookingType
        };

        return NextResponse.json({ success: true, bookingDetails: bookingDetailsForClient });

    } catch (error: any) {
        console.error("Error finalizing charter booking:", error);
        return NextResponse.json({ message: error.message || "An internal server error occurred during charter booking finalization." }, { status: 500 });
    }
}
