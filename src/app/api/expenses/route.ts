
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
    const { type, amount, description } = body;
    
    if (!type || !amount || !description) {
        return NextResponse.json({ message: 'Missing required fields for expense.' }, { status: 400 });
    }

    const expenseData = {
        type,
        amount,
        description,
        driverId: userId,
        driverName: userName,
        date: FieldValue.serverTimestamp(),
        status: 'pending',
        paymentMethod: 'Unpaid'
    };
    
    await adminDb.collection('expenses').add(expenseData);

    await sendAdminNotification({
      title: "New Expense Logged",
      description: `${userName} logged an expense of ₦${amount} for ${type}.`,
      type: 'wallet',
      href: '/admin/dashboard/payouts'
    });

    return NextResponse.json({ success: true, message: "Expense submitted successfully." }, { status: 201 });

  } catch (error: any) {
    console.error("API Error creating expense:", error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

