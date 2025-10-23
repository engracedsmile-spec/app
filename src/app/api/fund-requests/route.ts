
import { NextResponse } from 'next/server';
import { getFirebaseAdmin, verifyIdToken } from '@/lib/firebase/admin';
import { sendAdminNotification } from '@/lib/firebase/notifications';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ message: 'Authorization required.' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const userName = decodedToken.name || 'A Driver';

    const body = await request.json();
    const { amount, reason } = body;
    
    if (!amount || !reason) {
        return NextResponse.json({ message: 'Missing required fields for fund request.' }, { status: 400 });
    }

    const requestData = {
        amount,
        reason,
        driverId: userId,
        driverName: userName,
        requestedAt: FieldValue.serverTimestamp(),
        status: 'pending',
    };
    
    await adminDb.collection('fundRequests').add(requestData);

    await sendAdminNotification({
      title: "New Fund Request",
      description: `${userName} has requested ₦${amount} for "${reason}".`,
      type: 'wallet',
      href: '/admin/dashboard/payouts'
    });

    return NextResponse.json({ success: true, message: "Fund request submitted successfully." }, { status: 201 });

  } catch (error: any) {
    console.error("API Error creating fund request:", error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

