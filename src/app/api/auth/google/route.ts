
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
    let userDoc = await userDocRef.get();

    let appUser: User;

    if (!userDoc.exists) {
        let authUser;
        try {
            // Check if a user exists with the email from the Google token
            authUser = await adminAuth.getUserByEmail(email!);
            
            // If they do, their UID might be different if they first signed up with email/pass
            const existingUserDocRef = adminDb.collection('users').doc(authUser.uid);
            userDoc = await existingUserDocRef.get();

            if (userDoc.exists) {
                 // User exists, return their profile
                 appUser = { id: userDoc.id, ...userDoc.data() } as User;
                 return NextResponse.json({ success: true, user: appUser });
            } else {
                 // Auth user exists but no DB record, create one for them
                 const newUser: User = {
                    id: authUser.uid,
                    userId: authUser.uid,
                    name: name || authUser.displayName || 'User',
                    email: email!,
                    phone: authUser.phoneNumber || '',
                    userType: 'customer',
                    status: 'Active',
                    dateJoined: new Date().toISOString().split('T')[0],
                    walletBalance: 0,
                    profilePictureUrl: picture || authUser.photoURL || '',
                    referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    referralCount: 0,
                    referredBy: '',
                    fcmToken: '',
                    walletPin: '',
                };
                await existingUserDocRef.set(newUser);
                appUser = newUser;
                return NextResponse.json({ success: true, user: appUser });
            }

        } catch (error: any) {
            // This error means no user exists with this email at all.
            if (error.code === 'auth/user-not-found') {
                 // We can now safely create a new user with the UID from the Google token
                 try {
                    await adminAuth.getUser(uid);
                } catch (uidError: any) {
                     // This is a safety check in case the UID is somehow not yet in Auth
                     if (uidError.code === 'auth/user-not-found') {
                         await adminAuth.createUser({
                            uid: uid,
                            email: email,
                            displayName: name,
                            photoURL: picture,
                            emailVerified: true,
                        });
                     } else {
                         throw uidError; // Re-throw other auth errors
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
                  referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                  referralCount: 0,
                  referredBy: '',
                  fcmToken: '',
                  walletPin: '',
                };
                await userDocRef.set(newUser);
                appUser = newUser;
            } else {
                throw error; // Re-throw other unexpected auth errors
            }
        }
    } else {
        appUser = { id: userDoc.id, ...userDoc.data() } as User;
    }
    
    return NextResponse.json({ success: true, user: appUser });

  } catch (error: any) {
    console.error("API Google Sign-In Error:", error);
    if (error.message.includes("Firebase Admin SDK is not initialized")) {
        return NextResponse.json({ message: "Server Error: Firebase Admin SDK not initialized." }, { status: 500 });
    }
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
