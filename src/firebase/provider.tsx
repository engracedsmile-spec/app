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
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { useFirebaseContext } from './client-provider';

type FirebaseContextValue = {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
};

// This context is now primarily for client-provider to expose the services.
// Other components should use useFirebaseContext directly.
// Think of this as the main stage, while client-provider is the backstage manager.
const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const contextValue = useFirebaseContext();

  return (
    <FirebaseContext.Provider value={contextValue}>
        {children}
    </FirebaseContext.Provider>
  );
}


// A simple hook to get the whole gang: app, firestore, and auth.
export const useFirebase = () => {
  return useFirebaseContext();
};

// For when you just need the app instance. Like needing just the lead singer's autograph.
export const useFirebaseApp = () => useFirebaseContext().app;
// For when you just need to talk to the database.
export const useFirestore = () => useFirebaseContext().firestore;
// For when you just need to check IDs at the door (authentication).
export const useAuthContext = () => useFirebaseContext().auth;

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
