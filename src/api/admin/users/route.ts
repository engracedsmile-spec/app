
import { NextResponse } from 'next/server';
import { getFirebaseAdmin, checkPermissions } from '@/lib/firebase/admin';
import type { User } from '@/lib/data';

export async function GET(request: Request) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization token provided' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    
    await checkPermissions(idToken, 'manageUsers');

    const usersSnap = await adminDb.collection('users').get();
    const users: User[] = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("API Error in /api/admin/users (GET):", error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: error.status || 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { adminAuth, adminDb } = getFirebaseAdmin();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization token provided' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    
    // Any admin can add a user, but creating another admin might be restricted.
    // We'll stick with manageUsers for broad user creation.
    await checkPermissions(idToken, 'manageUsers');
    
    const body = await request.json();
    const { email, password, name, phone, userType, role } = body;

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone,
    });
    
    const newUser: User = {
      id: userRecord.uid,
      userId: userRecord.uid,
      name,
      email,
      phone,
      userType,
      status: 'Active',
      dateJoined: new Date().toISOString().split('T')[0],
      walletBalance: 0,
      ...(userType === 'admin' && { role: role || 'Support' }),
    };

    await adminDb.collection('users').doc(userRecord.uid).set(newUser);

    return NextResponse.json({ success: true, user: { id: userRecord.uid, ...newUser } }, { status: 201 });
  } catch (error: any) {
    console.error("API Error in /api/admin/users (POST):", error);
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 409 });
    }
     if (error.code === 'auth/invalid-phone-number') {
      return NextResponse.json({ success: false, message: 'The phone number must be a valid E.164 string (e.g., +11234567890).' }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
