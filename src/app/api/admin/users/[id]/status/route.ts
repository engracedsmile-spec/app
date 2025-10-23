import { NextResponse } from 'next/server';
import { getFirebaseAdmin, checkPermissions } from '@/lib/firebase/admin';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization token provided' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    
    await checkPermissions(idToken, 'manageUsers');
    
    const userId = params.id;
    const { status } = await request.json();

    if (!userId || !status) {
        return NextResponse.json({ message: 'User ID and status are required' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({ status });
    
    return NextResponse.json({ success: true, message: 'User status updated.' });
  } catch (error: any) {
    console.error(`API Error in /api/admin/users/${params.id}/status (PUT):`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
