/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, type User as FirebaseUser, GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { doc, onSnapshot, getDoc, getFirestore } from "firebase/firestore";
import { PERMISSIONS, type Role } from '@/lib/permissions';
import { useFirebaseContext } from '@/firebase/client-provider';
import { getModuleSettings, type ModuleSettings } from '@/lib/settings';
import type { User } from '@/lib/data';
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  role: Role | null;
  moduleSettings: ModuleSettings | null;
  auth: ReturnType<typeof getAuth>;
  firestore: ReturnType<typeof getFirestore>;
  setUser: (user: User | null) => void;
  signUp: (name: string, email: string, pass: string, userType: UserType, phone: string, referralCode?: string) => Promise<{ user: User }>;
  signIn: (email: string, pass: string) => Promise<{ user: User }>;
  signInWithGoogle: () => Promise<{ user: User } | null>;
  signOut: () => void;
}

type UserType = 'customer' | 'driver' | 'admin';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, firestore } = useFirebaseContext();
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [moduleSettings, setModuleSettings] = useState<ModuleSettings | null>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = { id: docSnap.id, ...docSnap.data() } as User;
            setUser(userData);
            setRole(userData.role || null);
          } else {
            setUser(null);
            setRole(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user profile:", error);
          firebaseSignOut(auth);
          setUser(null);
          setRole(null);
          setLoading(false);
        });

        return () => unsubscribeProfile();

      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, firestore]);

  useEffect(() => {
    getModuleSettings().then(setModuleSettings);
  }, []);

  const fetchUserProfile = useCallback(async (fbUser: FirebaseUser): Promise<User> => {
    const userDocRef = doc(firestore, 'users', fbUser.uid);
    let docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        docSnap = await getDoc(userDocRef);
    }
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    
    throw new Error("Your user profile could not be found in our database after authentication. Please contact support.");
  }, [firestore]);


  const signUp = async (name: string, email: string, pass: string, userType: UserType = 'customer', phone: string = '', referralCode?: string): Promise<{ user: User }> => {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: pass, phone, userType, referralCode })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'An error occurred during sign-up.');
        }
        
        await signInWithEmailAndPassword(auth, email, pass);
        
        const userProfile = await fetchUserProfile(auth.currentUser!);
        return { user: userProfile };
  };

  const signIn = async (email: string, pass: string): Promise<{ user: User }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const userProfile = await fetchUserProfile(userCredential.user);
      return { user: userProfile };
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            throw new Error("Login Failed: The email or password you entered is incorrect.");
        }
        throw error;
    }
  };
  
  const signInWithGoogle = async (): Promise<{ user: User } | null> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();
        
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
            await firebaseSignOut(auth);
            throw new Error(data.message || 'Google sign-in failed on the server.');
        }
        
        const userProfile = await fetchUserProfile(result.user);
        return { user: userProfile };
    } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') {
            console.log("Google sign-in popup closed by user.");
            return null;
        }
        throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    firebaseUser,
    loading,
    role,
    moduleSettings,
    auth,
    firestore,
    setUser,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
