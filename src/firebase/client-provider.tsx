/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 *
 * So, you're looking at my code, huh? That's cool. Just don't copy it without asking.
 * I poured my heart, soul, and a questionable amount of caffeine into this.
 * Find me on socials @mdtbmw if you want to geek out over code.
 */

'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getClientApp } from './config';
import { Preloader } from '@/components/preloader';

type FirebaseContextValue = {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
};

// This is our secret clubhouse for all things Firebase.
// Only components wrapped in the provider get the secret handshake.
const FirebaseClientContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

// This little guy makes sure we don't try to initialize Firestore a million times.
// Fast refresh can be a bit... enthusiastic. This keeps it in check.
const getOrCreateFirestore = (app: FirebaseApp): Firestore => {
  try {
    // Try to get the existing instance. Easy peasy.
    return getFirestore(app);
  } catch (error) {
    // If it throws an error, it's probably because of a hot reload.
    // So we initialize it, but only if we absolutely have to.
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  }
};

export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    // This is where the magic happens. We get the app, auth, and firestore.
    // It's like assembling the Avengers, but for a web app.
    const app = getClientApp();
    const auth = getAuth(app);
    const firestore = getOrCreateFirestore(app);

    setServices({ app, auth, firestore });
  }, []); // We only do this once. No need to overdo it.

  // If the services aren't ready, we show a preloader.
  // It's like telling the audience the show is about to start.
  if (!services) {
    return <Preloader />;
  }

  // Once everything's ready, we let the children play with the Firebase toys.
  return (
    <FirebaseClientContext.Provider value={services}>
      {children}
    </FirebaseClientContext.Provider>
  );
}

// This is the hook for our components to get their hands on the Firebase services.
// It's like a VIP pass to the Firebase clubhouse.
export const useFirebaseContext = () => {
  const context = useContext(FirebaseClientContext);
  if (context === undefined) {
    // If you try to use this outside the provider, you're gonna have a bad time.
    throw new Error('useFirebaseContext must be used within a FirebaseClientProvider. No exceptions!');
  }
  return context;
};

/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * TL;DR: Don't steal my stuff. I worked hard on this.
 *
 * @see https://github.com/mdtbmw
 */
