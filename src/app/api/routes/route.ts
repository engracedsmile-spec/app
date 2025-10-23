
import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import type { Route, Terminal } from '@/lib/data';

// This endpoint fetches all active routes and terminals.
// It's designed to be called from the client-side booking flow.
export async function GET(request: Request) {
  try {
    const { adminDb } = getFirebaseAdmin();

    const routesSnap = await adminDb.collection('routes').get();
    const terminalsSnap = await adminDb.collection('terminals').where('status', '==', 'active').get();
    
    const routes = routesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route));
    const terminals = terminalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Terminal));
    
    const response = NextResponse.json({ routes, terminals });
    
    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;

  } catch (error: any) {
    console.error("API Error in /api/routes:", error);
    if (error.message.includes("Firebase Admin SDK is not initialized")) {
        return NextResponse.json({ message: "Server Error: Firebase Admin SDK not initialized." }, { status: 500 });
    }
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
