/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

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
    
    if (uid !== userId) {
        await checkPermissions(idToken, 'manageUsers');
    }

    const shipmentsSnap = await adminDb.collection('shipments').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    const shipments = shipmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json(shipments);

  } catch (error: any) {
    console.error(`API Error fetching shipments for user ${params.id}:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
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
