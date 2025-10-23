
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import type { User } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, userType, role } = body;

    // Validate input
    if (!email || !password || !name || !userType) {
        return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone,
    });
    
    const newUser: User = {
      id: userRecord.uid,
      userId: userRecord.uid, // Ensure userId is set for rules
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
    console.error("API Error creating user:", error);
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }
     if (error.code === 'auth/phone-number-already-exists') {
      return NextResponse.json({ message: 'A user with this phone number already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}
