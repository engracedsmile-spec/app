
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getClientApp } from '@/firebase/config';
import type { CharterPackage, Route, Promotion, PaymentSettings } from './data';


export type PricingSettings = {
  routes: Route[];
  charterPackages: CharterPackage[];
};

export type OperationsSettings = {
  driverRegistrationOpen: boolean;
  driverRegistrationLimit: number;
  seatHoldDuration: number;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  seatBookingEnabled: boolean;
  charterBookingEnabled: boolean;
  referralSystemEnabled: boolean;
  referralBonus: number;
  authMethods: {
    email: boolean;
    google: boolean;
  }
}

export type ModuleSettings = {
    passenger: 'live' | 'coming_soon' | 'off';
    logistics: 'live' | 'coming_soon' | 'off';
}

// Default values in case Firestore document doesn't exist
export const defaultPricingSettings: PricingSettings = {
  routes: [],
  charterPackages: [],
};

export const defaultOperationsSettings: OperationsSettings = {
  driverRegistrationOpen: true,
  driverRegistrationLimit: 100,
  seatHoldDuration: 5,
  requireEmailVerification: false,
  requirePhoneVerification: true,
  seatBookingEnabled: true,
  charterBookingEnabled: true,
  referralSystemEnabled: true,
  referralBonus: 500,
  authMethods: {
    email: true,
    google: true,
  }
}

export const defaultPaymentSettings: PaymentSettings = {
    paystackLivePublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    paystackLiveSecretKey: "",
}

export const defaultModuleSettings: ModuleSettings = {
    passenger: 'live',
    logistics: 'off',
}

// Getter functions to fetch settings from Firestore.

let cachedPricingSettings: PricingSettings | null = null;
export const getPricingSettings = async (): Promise<PricingSettings> => {
    const firebaseApp = getClientApp();
    if (typeof window === 'undefined' && cachedPricingSettings) return cachedPricingSettings;

    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "settings", "pricing");
    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().routes && docSnap.data().charterPackages) {
            const settings = docSnap.data() as PricingSettings;
             if (typeof window === 'undefined') {
                cachedPricingSettings = settings;
            }
            return settings;
        } else {
            if (typeof window !== 'undefined') {
                 await setDoc(docRef, defaultPricingSettings, { merge: true });
            }
            return defaultPricingSettings;
        }
    } catch (e) {
        console.error("Failed to fetch or set pricing settings", e);
        return defaultPricingSettings;
    }
};


let cachedOperationsSettings: OperationsSettings | null = null;
export const getOperationsSettings = async (): Promise<OperationsSettings> => {
    const firebaseApp = getClientApp();
    if (cachedOperationsSettings && typeof window === 'undefined') return cachedOperationsSettings;
    
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, 'settings', 'operations');
    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const settings = { ...defaultOperationsSettings, ...docSnap.data() } as OperationsSettings;
            if(typeof window === 'undefined') cachedOperationsSettings = settings;
            return settings;
        } else {
             if (typeof window !== 'undefined') {
                 await setDoc(docRef, defaultOperationsSettings);
            }
            return defaultOperationsSettings;
        }
    } catch (e) {
         console.error("Failed to fetch or set operations settings", e);
        return defaultOperationsSettings;
    }
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
    const firebaseApp = getClientApp();
    
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "settings", "payment");
    
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const settings = { ...defaultPaymentSettings, ...docSnap.data() } as PaymentSettings;
            return settings;
        } else {
             if (typeof window !== 'undefined') {
                await setDoc(docRef, defaultPaymentSettings, { merge: true });
            }
            return defaultPaymentSettings;
        }
    } catch (e) {
         console.error("Failed to fetch payment settings", e);
        return defaultPaymentSettings;
    }
}

let cachedModuleSettings: ModuleSettings | null = null;
export const getModuleSettings = async (): Promise<ModuleSettings> => {
    const firebaseApp = getClientApp();
    if (cachedModuleSettings) return cachedModuleSettings;
    
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, 'settings', 'modules');
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            cachedModuleSettings = docSnap.data() as ModuleSettings;
            return cachedModuleSettings;
        } else {
             if (typeof window !== 'undefined') {
                await setDoc(docRef, defaultModuleSettings);
            }
            return defaultModuleSettings;
        }
    } catch (e) {
        console.error("Failed to fetch or set module settings", e);
        return defaultModuleSettings;
    }
};
