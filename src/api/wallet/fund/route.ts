
import { NextResponse } from 'next/server';
import { getFirebaseAdmin, verifyIdToken } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

async function verifyPaystackTransaction(reference: string) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
        console.error("PAYSTACK_SECRET_KEY is not set. Cannot verify transaction.");
        throw new Error("Server configuration error: Paystack secret key is missing.");
    }
    
    try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${secretKey}`,
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error verifying Paystack transaction:", error);
        throw new Error("Could not verify payment with Paystack.");
    }
}


export async function POST(request: Request) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization token provided' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    const { amount, reference } = await request.json();

    if (!amount || !reference || amount <= 0) {
        return NextResponse.json({ message: 'Invalid funding request.' }, { status: 400 });
    }

    const verification = await verifyPaystackTransaction(reference);

    if (verification.status !== true || verification.data.status !== 'success') {
        return NextResponse.json({ message: 'Payment verification failed.' }, { status: 402 });
    }

    const userRef = adminDb.collection('users').doc(userId);
    const transactionRef = adminDb.collection(`users/${userId}/transactions`).doc(reference); // Use reference as ID for idempotency

    // Check if this transaction has already been processed
    const existingTransaction = await transactionRef.get();
    if (existingTransaction.exists) {
        return NextResponse.json({ success: true, message: 'Transaction already processed.' });
    }

    const batch = adminDb.batch();
    
    batch.update(userRef, {
        walletBalance: FieldValue.increment(amount)
    });

    batch.set(transactionRef, {
        id: transactionRef.id,
        userId: userId,
        type: 'credit',
        amount: amount,
        description: `Wallet funding via Paystack`,
        date: FieldValue.serverTimestamp(),
        status: 'completed',
        reference: reference,
    });

    await batch.commit();
    
    return NextResponse.json({ success: true, message: 'Wallet funded successfully.' });
  } catch (error: any) {
    console.error("API Error in /api/wallet/fund:", error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
