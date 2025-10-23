
import { NextResponse } from 'next/server';
import { getFirebaseAdmin, verifyIdToken } from '@/lib/firebase/admin';
import type { User } from '@/lib/data';

export async function GET(request: Request) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization token provided' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    
    const userSnapshot = await adminDb.doc(`users/${decodedToken.uid}`).get();
    
    if (!userSnapshot.exists) {
        return NextResponse.json({ message: 'User profile not found.' }, { status: 404 });
    }

    const userProfile = { id: userSnapshot.id, ...userSnapshot.data() } as User;

    return NextResponse.json(userProfile);

  } catch (error: any) {
    console.error("API Error fetching user profile:", error.message);
    let message = error.message || 'An internal server error occurred.';
    let status = 500;
    
    if (error.code === 'auth/id-token-expired') {
        message = 'Your session has expired. Please sign in again.';
        status = 401;
    } else if (error.code === 'auth/argument-error') {
       message = 'Invalid authentication token.';
       status = 401;
    }
    
    return NextResponse.json({ message }, { status });
  }
}
