
'use server';

import { getFirebaseAdmin, verifyIdToken } from '@/lib/firebase/admin';
import type { User, Booking, ScheduledTrip, Promotion, Vehicle, CharterPackage } from '@/lib/data';
import { FieldValue } from 'firebase-admin/firestore';

const applyDiscount = (price: number, promotion: Promotion) => {
    let discountAmount = 0;
    if (promotion.discountType === 'fixed') {
        discountAmount = promotion.discountValue;
    } else if (promotion.discountType === 'percentage') {
        discountAmount = price * (promotion.discountValue / 100);
    }
    const discountedPrice = Math.max(0, price - discountAmount);
    return { discountedPrice, discountAmount };
}

export async function POST(request: Request) {
    const { adminDb } = getFirebaseAdmin();
    const body = await request.json();
    const { formData, user, scheduledTripId } = body;
    
    const authHeader = request.headers.get('Authorization');
    let userId = user?.id || null;
    if (!userId && authHeader) {
        const idToken = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await verifyIdToken(idToken);
            userId = decodedToken.uid;
        } catch (e) {
            // non-fatal, user might be a guest
        }
    }


    if (formData.bookingType === 'charter') {
        // This is now handled by /api/charter-bookings
        return new Response(JSON.stringify({ message: "Invalid endpoint for charter booking." }), { status: 400 });
    } else {
        return createPassengerBooking(formData, userId, scheduledTripId);
    }

    async function createPassengerBooking(formData: any, userId: string | null, scheduledTripId: string) {
        const bookingsRef = adminDb.collection("bookings");

        try {
            const bookingRef = bookingsRef.doc();
            let finalPrice = (formData.price || 0);
            let discountInfo: { code: string; amount: number } | undefined = undefined;

            if (formData.couponCode) {
                const promoQuery = await adminDb.collection('promotions').where('code', '==', formData.couponCode.toUpperCase()).where('status', '==', 'active').limit(1).get();
                if (!promoQuery.empty) {
                    const promoData = promoQuery.docs[0].data() as Promotion;
                    if (promoData.applicableTo === 'all' || promoData.applicableTo === 'seat_booking') {
                        const { discountedPrice, discountAmount } = applyDiscount(finalPrice, promoData);
                        finalPrice = discountedPrice;
                        discountInfo = { code: promoData.code!, amount: discountAmount };
                    } else {
                        throw new Error("This coupon code is not valid for this booking type.");
                    }
                } else {
                    return new Response(JSON.stringify({ message: "The coupon code is invalid or has expired." }), { status: 400 });
                }
            }
            
            const allPassengerNames = [formData.passengerName, ...(formData.passengers?.map((p: any) => p.name) || [])].filter(Boolean);

            const bookingData: Omit<Booking, 'price' | 'discount'> & { price: number; discount?: { code: string; amount: number; } } = {
                id: bookingRef.id,
                userId: userId,
                type: 'passenger',
                bookingType: 'seat_booking',
                status: 'Pending',
                createdAt: FieldValue.serverTimestamp(),
                passengerName: formData.passengerName,
                passengers: allPassengerNames,
                passengerPhone: formData.passengerPhone,
                travelDate: formData.travelDate,
                scheduledTripId: scheduledTripId,
                pickupAddress: formData.pickupAddress,
                destinationAddress: formData.destinationAddress,
                itemDescription: `Seat(s) ${formData.seats.join(', ')}`,
                seats: formData.seats,
                title: `Trip to ${formData.destinationAddress.split(',')[0]}`,
                price: finalPrice,
                ...(discountInfo && { discount: discountInfo }),
            };
            await bookingRef.set(bookingData);

            return new Response(JSON.stringify({ bookingId: bookingRef.id, finalPrice: finalPrice }), { status: 200 });

        } catch (error: any) {
            console.error("Error creating passenger booking:", error);
            return new Response(JSON.stringify({ message: error.message || "Failed to create your booking due to a server error." }), { status: 500 });
        }
    }
}
