
import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import type { User } from '@/lib/data';
import { getOperationsSettings } from '@/lib/settings';
import { FieldValue } from 'firebase-admin/firestore';
import { sendAdminNotification } from '@/lib/firebase/notifications';

export async function POST(request: Request) {
  try {
    const { adminAuth, adminDb } = getFirebaseAdmin();
    const body = await request.json();
    const { email, password, name, phone, userType, role, referralCode } = body;

    if (!email || !password || !name || !userType) {
        return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const opsSettings = await getOperationsSettings();

    // Only include phoneNumber if it's provided and in E.164 format
    const createUserData: any = {
      email,
      password,
      displayName: name,
    };
    
    // Only add phone if it's provided and starts with '+'
    if (phone && phone.startsWith('+')) {
      createUserData.phoneNumber = phone;
    }

    const userRecord = await adminAuth.createUser(createUserData);
    
    const ownReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser: User = {
      id: userRecord.uid,
      userId: userRecord.uid,
      name,
      email,
      phone: phone || '',
      userType,
      status: 'Active',
      dateJoined: new Date().toISOString().split('T')[0],
      walletBalance: 0,
      walletPin: '',
      referralCode: ownReferralCode,
      referralCount: 0,
      referredBy: referralCode || '',
      fcmToken: '',
      profilePictureUrl: '',
      ...(userType === 'admin' && { role: role || 'Support' }),
    };
    
    // Use a transaction to ensure atomicity
    await adminDb.runTransaction(async (transaction) => {
        const userRef = adminDb.collection('users').doc(userRecord.uid);
        transaction.set(userRef, newUser);

        if (opsSettings.referralSystemEnabled && referralCode) {
            const referrerQuery = await adminDb.collection('users').where('referralCode', '==', referralCode.toUpperCase()).limit(1).get();
            if (!referrerQuery.empty) {
                const referrerDoc = referrerQuery.docs[0];
                const referrerRef = referrerDoc.ref;

                transaction.update(referrerRef, { 
                    walletBalance: FieldValue.increment(opsSettings.referralBonus),
                    referralCount: FieldValue.increment(1)
                });

                const transactionRef = adminDb.collection(`users/${referrerDoc.id}/transactions`).doc();
                transaction.set(transactionRef, {
                    id: transactionRef.id,
                    userId: referrerDoc.id,
                    type: 'credit',
                    amount: opsSettings.referralBonus,
                    description: `Referral bonus for signing up ${name}`,
                    date: FieldValue.serverTimestamp(),
                    status: 'completed',
                });
            }
        }
    });

    await sendAdminNotification({
      title: 'New User Joined!',
      description: `${name} has just signed up as a ${userType}.`,
      type: 'user',
      href: `/admin/dashboard/users/${userRecord.uid}`
    })

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });

  } catch (error: any) {
      console.error("API Error creating user:", error);
      if (error.message.includes("Firebase Admin SDK is not initialized")) {
        return NextResponse.json({ message: "Server Error: Firebase Admin SDK not initialized." }, { status: 500 });
      }
      if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
      }
      if (error.code === 'auth/phone-number-already-exists') {
        return NextResponse.json({ message: 'A user with this phone number already exists.' }, { status: 409 });
      }
       if (error.code === 'auth/invalid-phone-number') {
        return NextResponse.json({ success: false, message: 'The phone number must be a valid E.164 string (e.g., +11234567890).' }, { status: 400 });
      }
      return NextResponse.json({ message: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}
