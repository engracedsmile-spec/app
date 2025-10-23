
import { getAuth } from 'firebase/auth';
import { getFirestore as getWebFirestore } from 'firebase/firestore';

import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { getClientApp } from './config';
import {
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuthContext,
} from './provider';
import { useUser } from './auth/use-user';
import { useCollection, useDoc } from './firestore/use-collection';


function initializeFirebase() {
  const app = getClientApp();
  const auth = getAuth(app);
  const firestore = getWebFirestore(app);
  return { app, auth, firestore };
}

export {
  initializeFirebase,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useUser,
  useAuth,
  AuthProvider,
  useAuthContext,
  useCollection,
  useDoc,
};
