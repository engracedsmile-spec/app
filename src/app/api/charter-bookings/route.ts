
'use server';

import { getFirebaseAdmin, verifyIdToken } from '@/lib/firebase/admin';
import type { User, Booking, CharterPackage, Promotion } from '@/lib/data';
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
    const { formData, user } = body;
    
    let userId = user?.id || null;
    if (!userId) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader) {
            const idToken = authHeader.split('Bearer ')[1];
            try {
                const decodedToken = await verifyIdToken(idToken);
                userId = decodedToken.uid;
            } catch (e) {
                // non-fatal, user might be a guest
            }
        }
    }
    
    const bookingRef = adminDb.collection("bookings").doc();

    const charterSettingsDoc = await adminDb.doc('settings/charter').get();
    if(!charterSettingsDoc.exists) throw new Error("Charter settings not found.");
    const packages = charterSettingsDoc.data()?.packages as CharterPackage[];
    const pkg = packages.find(p => p.id === formData.charterPackageId);
    if(!pkg) throw new Error("Selected charter package not found.");
    
    const basePrice = pkg.basePrice || 0;
    const dailyRate = pkg.dailyRate || 0;
    const days = formData.charterDays || 1;
    
    let finalPrice = basePrice + (dailyRate * (days - 1));
    let discountInfo: { code: string; amount: number } | undefined = undefined;

    if (formData.couponCode) {
        const promoQuery = await adminDb.collection('promotions').where('code', '==', formData.couponCode.toUpperCase()).where('status', '==', 'active').limit(1).get();
        if (!promoQuery.empty) {
            const promoDoc = promoQuery.docs[0];
            const promoData = promoDoc.data() as Promotion;
            
            const isApplicable = promoData.applicableTo === 'all' || 
                                 promoData.applicableTo === 'charter' || 
                                 (promoData.applicableTo === 'specific_package' && promoData.applicablePackageId === formData.charterPackageId);

            if (isApplicable) {
                const { discountedPrice, discountAmount } = applyDiscount(finalPrice, promoData);
                finalPrice = discountedPrice;
                discountInfo = { code: promoData.code!, amount: discountAmount };
            } else {
                 return new Response(JSON.stringify({ message: "This coupon code is not valid for this booking type." }), { status: 400 });
            }
        } else {
           return new Response(JSON.stringify({ message: "The coupon code is invalid or has expired." }), { status: 400 });
        }
    }

    const bookingData: Partial<Booking> = {
        id: bookingRef.id,
        userId: userId,
        type: 'charter',
        bookingType: 'charter',
        status: 'Pending',
        createdAt: FieldValue.serverTimestamp(),
        passengerName: formData.passengerName,
        passengers: [formData.passengerName],
        passengerPhone: formData.passengerPhone,
        travelDate: formData.travelDate,
        charterPackageId: formData.charterPackageId,
        charterPackageName: formData.charterPackageName,
        charterDays: formData.charterDays,
        pickupAddress: "Charter Service",
        destinationAddress: "Charter Service",
        itemDescription: `${formData.charterPackageName} for ${formData.charterDays} day(s)`,
        price: finalPrice,
        title: `${formData.charterPackageName} Charter`,
        ...(discountInfo && { discount: discountInfo }),
    };

    try {
        await bookingRef.set(bookingData);
         return new Response(JSON.stringify({ bookingId: bookingRef.id, finalPrice: finalPrice }), { status: 200 });
    } catch (error) {
        console.error("Error creating charter booking:", error);
        return new Response(JSON.stringify({ message: "Could not create your charter booking at this time." }), { status: 500 });
    }
}
