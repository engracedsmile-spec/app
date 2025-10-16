
import admin from 'firebase-admin';
import { getApps, type App } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';
import { PERMISSIONS, type Role } from '@/lib/permissions';

// This will hold our initialized services as a singleton
let adminServices: {
  adminApp: App;
  adminDb: admin.firestore.Firestore;
  adminAuth: admin.auth.Auth;
} | null = null;

function initializeFirebaseAdmin() {
  // This function should only ever be called on the server.
  if (typeof window !== 'undefined') {
    throw new Error("Firebase Admin SDK can only be initialized on the server.");
  }
  
  // If already initialized, no need to do anything
  if (adminServices) {
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    
  // Enhanced error logging for Vercel debugging
  if (!serviceAccountKey || !projectId || !clientEmail) {
      console.error("CRITICAL ERROR: Firebase Admin credentials are not fully set in environment variables.");
      console.error("Missing credentials:", {
        hasPrivateKey: !!serviceAccountKey,
        hasProjectId: !!projectId,
        hasClientEmail: !!clientEmail,
        privateKeyLength: serviceAccountKey?.length || 0,
        environment: process.env.VERCEL ? 'Vercel' : 'Local'
      });
      return;
  }

  console.log("Initializing Firebase Admin SDK...", {
    projectId,
    clientEmail,
    privateKeyLength: serviceAccountKey.length,
    environment: process.env.VERCEL ? 'Vercel' : 'Local'
  });

  // Process the private key - handle both formats
  let processedKey = serviceAccountKey;
  
  // If the key starts with quotes, remove them
  if (processedKey.startsWith('"') && processedKey.endsWith('"')) {
    processedKey = processedKey.slice(1, -1);
  }
  
  // Replace escaped newlines with actual newlines
  processedKey = processedKey.replace(/\\n/g, '\n');

  console.log("Private key processed:", {
    originalLength: serviceAccountKey.length,
    processedLength: processedKey.length,
    startsWithBegin: processedKey.startsWith('-----BEGIN'),
    endsWithEnd: processedKey.endsWith('-----')
  });

  const serviceAccount: ServiceAccount = {
      projectId,
      clientEmail,
      privateKey: processedKey,
  };

  try {
     const app = getApps().length
      ? getApps()[0]!
      : admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
        });
    
    adminServices = {
      adminApp: app,
      adminDb: admin.firestore(app),
      adminAuth: admin.auth(app),
    };
    console.log("Firebase Admin SDK initialized successfully.");
  } catch(error: any) {
    console.error("Firebase Admin SDK initialization error:", error.message);
    // Don't throw here, as it can crash the server on startup. 
    // getFirebaseAdmin will throw if initialization failed.
  }
}

// Initialize on module load (server-side only)
initializeFirebaseAdmin();

// The single, safe entry point to get Firebase Admin services.
export function getFirebaseAdmin() {
  if (!adminServices) {
    // This will now only be thrown if the initial server-side initialization failed.
    throw new Error("Firebase Admin SDK is not initialized. Check server logs and environment variables.");
  }
  return adminServices;
}

export const verifyIdToken = (token: string) => {
  const { adminAuth } = getFirebaseAdmin();
  return adminAuth.verifyIdToken(token);
};

export const checkPermissions = async (idToken: string, requiredPermission: string): Promise<boolean> => {
    const { adminDb } = getFirebaseAdmin();
    const decodedToken = await verifyIdToken(idToken);
    const userSnapshot = await adminDb.doc(`users/${decodedToken.uid}`).get();
    const userData = userSnapshot.data();
    
    if (!userData) {
        throw new Error(`Permission Denied: User with UID ${decodedToken.uid} not found in Firestore.`);
    }
    
    const userRole = userData.role as Role | undefined;

    if (!userRole || !PERMISSIONS[userRole]) {
         throw new Error(`Permission Denied: User role '${userRole}' is not defined or has no permissions.`);
    }
    
    if (!PERMISSIONS[userRole]?.includes(requiredPermission)) {
        throw new Error(`Permission Denied: User with role '${userRole}' does not have the required '${requiredPermission}' permission.`);
    }
    return true;
};

    