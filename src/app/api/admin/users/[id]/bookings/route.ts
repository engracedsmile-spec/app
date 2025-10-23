import { NextResponse } from 'next/server';
import { getFirebaseAdmin, checkPermissions, verifyIdToken } from '@/lib/firebase/admin';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization token provided' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    
    const { uid } = await verifyIdToken(idToken);
    
    const userId = params.id;
    if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }
    
    // A user should always be able to fetch their own bookings.
    // An admin with 'manageUsers' can fetch anyone's.
    if (uid !== userId) {
        await checkPermissions(idToken, 'manageUsers');
    }

    const bookingsSnap = await adminDb.collection('bookings').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    const bookings = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json(bookings);

  } catch (error: any) {
    console.error(`API Error fetching bookings for user ${params.id}:`, error);
    const status = error.message.includes("Permission Denied") ? 403 : 500;
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status });
  }
}
