/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

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
    let status = 500;
    let message = error.message || 'An internal server error occurred.';
    
    if (error.message.includes("Firebase Admin SDK is not initialized")) {
        message = "Server Error: Firebase Admin SDK not initialized.";
        status = 500;
    } else if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        message = 'Your session is invalid. Please sign in again.';
        status = 401;
    } else if (error.message.includes("Permission Denied")) {
        status = 403;
    }
    
    return NextResponse.json({ message }, { status });
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
