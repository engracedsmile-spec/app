/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

import { NextResponse } from 'next/server';
import { getFirebaseAdmin, checkPermissions } from '@/lib/firebase/admin';
import type { User } from '@/lib/data';
import { FieldValue } from 'firebase-admin/firestore';
import type { Role } from '@/lib/permissions';

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
    if (error.message.includes("Firebase Admin SDK is not initialized")) {
        return NextResponse.json({ message: "Server Error: Firebase Admin SDK not initialized." }, { status: 500 });
    }
    const status = error.message.includes("Permission Denied") ? 403 : 500;
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status });
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
    
    await checkPermissions(idToken, 'manageUsers');
    
    const body = await request.json();
    const { email, password, name, phone, userType, role } = body;
    
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
      userId: userRecord.uid,
      name,
      email,
      phone: phone || '',
      userType,
      status: 'Active',
      dateJoined: new Date().toISOString().split('T')[0],
      walletBalance: 0,
      walletPin: '',
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      referralCount: 0,
      referredBy: '',
      fcmToken: '',
      profilePictureUrl: '',
      ...(userType === 'admin' && { role: role || 'Support' }),
    };

    await adminDb.collection('users').doc(userRecord.uid).set(newUser);

    return NextResponse.json({ success: true, user: { id: userRecord.uid, ...newUser } }, { status: 201 });

  } catch (error: any) {
      console.error("API Error creating user:", error);
      if (error.message.includes("Firebase Admin SDK is not initialized")) {
        return NextResponse.json({ message: "Server Error: Firebase Admin SDK not initialized." }, { status: 500 });
      }
      if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
      }
      if (error.code === 'auth/phone-number-already-exists') {
        return NextResponse.json({ message: 'A user with this phone number already exists.' }, { status: 409 });
      }
      if (error.code === 'auth/invalid-phone-number') {
        return NextResponse.json({ success: false, message: 'The phone number must be a valid E.164 string (e.g., +11234567890).' }, { status: 400 });
      }
      return NextResponse.json({ message: error.message || `Internal Server Error: ${error.code}` }, { status: 500 });
  }
}
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
