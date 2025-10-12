
import { NextResponse } from 'next/server';
import { getFirebaseAdmin, checkPermissions } from '@/lib/firebase/admin';
import type { User } from '@/lib/data';
import type { Role } from '@/lib/permissions';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization token provided' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    
    await checkPermissions(idToken, 'manageUsers');
    
    const userId = params.id;
    if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error: any) {
    console.error(`API Error in /api/admin/users/${params.id} (GET):`, error);
    if (error.message.includes("Firebase Admin SDK is not initialized")) {
        return NextResponse.json({ message: "Server Error: Firebase Admin SDK not initialized." }, { status: 500 });
    }
    const status = error.message.includes("Permission Denied") ? 403 : 500;
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status });
  }
}

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
    const data = await request.json();
    
    const isNowAdmin = ['Manager', 'Support', 'Finance', 'Marketing'].includes(data.role);
    const isNowDriver = data.role === 'driver';

    const updatedData: { [key: string]: any } = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        userType: isNowAdmin ? 'admin' : (data.role as 'customer' | 'driver'),
        role: isNowAdmin ? (data.role as Role) : FieldValue.delete(),
        vehicle: isNowDriver ? data.vehicle : FieldValue.delete(),
        licensePlate: isNowDriver ? data.licensePlate : FieldValue.delete(),
        terminalId: isNowDriver ? data.terminalId : FieldValue.delete(),
    };

    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update(updatedData);

    const updatedDoc = await userRef.get();
    
    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error: any) {
    console.error(`API Error in /api/admin/users/${params.id} (PUT):`, error);
    if (error.message.includes("Firebase Admin SDK is not initialized")) {
        return NextResponse.json({ message: "Server Error: Firebase Admin SDK not initialized." }, { status: 500 });
    }
    const status = error.message.includes("Permission Denied") ? 403 : 500;
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { adminAuth, adminDb } = getFirebaseAdmin();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization token provided' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];

    await checkPermissions(idToken, 'manageUsers');
    
    const userId = params.id;
    
    // Delete from Firestore
    await adminDb.collection('users').doc(userId).delete();
    
    // Delete from Firebase Authentication
    // Wrap in a try-catch in case the auth user was already deleted or never existed.
    try {
        await adminAuth.deleteUser(userId);
    } catch (authError: any) {
        if (authError.code !== 'auth/user-not-found') {
            console.warn(`Could not delete Firebase Auth user ${userId}:`, authError.message);
        }
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully.' });

  } catch (error: any) {
    console.error(`API Error in /api/admin/users/${params.id} (DELETE):`, error);
    if (error.message.includes("Firebase Admin SDK is not initialized")) {
        return NextResponse.json({ message: "Server Error: Firebase Admin SDK not initialized." }, { status: 500 });
    }
    const status = error.message.includes("Permission Denied") ? 403 : 500;
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status });
  }
}
