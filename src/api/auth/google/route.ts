
import { NextResponse } from 'next/server';
import { getFirebaseAdmin, verifyIdToken } from '@/lib/firebase/admin';
import type { User } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const { adminAuth, adminDb } = getFirebaseAdmin();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization token provided' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    
    const { uid, email, name, picture } = decodedToken;
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    let appUser: User;

    if (!userDoc.exists) {
        try {
            await adminAuth.getUser(uid);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                await adminAuth.createUser({
                    uid: uid,
                    email: email,
                    displayName: name,
                    photoURL: picture,
                    emailVerified: true,
                });
            } else {
                throw error;
            }
        }
        
        const newUser: User = {
          id: uid,
          userId: uid,
          name: name || 'Google User',
          email: email!,
          phone: '',
          userType: 'customer',
          status: 'Active',
          dateJoined: new Date().toISOString().split('T')[0],
          walletBalance: 0,
          profilePictureUrl: picture || '',
        };
        await userDocRef.set(newUser);
        appUser = newUser;
    } else {
        appUser = { id: userDoc.id, ...userDoc.data() } as User;
    }
    
    return NextResponse.json({ success: true, user: appUser });

  } catch (error: any) {
    console.error("API Google Sign-In Error:", error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
