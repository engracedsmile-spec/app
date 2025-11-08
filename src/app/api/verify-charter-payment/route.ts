
'use server';

import { getFirebaseAdmin } from '@/lib/firebase/admin';
import type { Booking } from '@/lib/data';
import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getPaymentSettings } from '@/lib/settings';

export async function POST(request: Request) {
    const { adminDb } = getFirebaseAdmin();
    const { reference, bookingId } = await request.json();
    
    if (!bookingId) {
        return NextResponse.json({ message: "Booking ID is required." }, { status: 400 });
    }

    try {
        if (!reference) {
            return NextResponse.json({ message: "Payment reference is required." }, { status: 400 });
        }

        const paymentSettings = await getPaymentSettings();
        if (!paymentSettings?.paystackLiveSecretKey) {
            console.error('verify-charter-payment: Paystack secret key missing in settings');
            return NextResponse.json({ message: "Payment gateway is not configured. Please contact support." }, { status: 500 });
        }

        const verificationResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${paymentSettings.paystackLiveSecretKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!verificationResponse.ok) {
            console.error('verify-charter-payment: Paystack verification failed with status', verificationResponse.status);
            return NextResponse.json({ message: "Unable to verify payment at this time." }, { status: 502 });
        }

        const verification = await verificationResponse.json();
        if (!verification?.status || verification.data?.status !== 'success') {
            console.error('verify-charter-payment: Paystack returned unsuccessful status', verification?.data?.status);
            return NextResponse.json({ message: "Payment verification failed." }, { status: 402 });
        }

        const transactionData = verification.data;
        const amountInNaira = (transactionData.amount || 0) / 100;
        const paymentRef = adminDb.collection('payments').doc(reference);

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

            transaction.update(bookingRef, { 
                status: 'Confirmed',
                paymentReference: reference,
                paymentDate: FieldValue.serverTimestamp(),
            });
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
