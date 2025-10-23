
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getClientApp } from '@/firebase/config';
import type { CharterPackage, Route, Promotion } from './data';


export type PricingSettings = {
  routes: Route[];
  charterPackages: CharterPackage[];
};

export type OperationsSettings = {
  driverRegistrationOpen: boolean;
  driverRegistrationLimit: number;
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

export type PaymentSettings = {
    paystackPublicKey: string;
    paystackSecretKey: string;
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
    paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    paystackSecretKey: ""
}

export const defaultModuleSettings: ModuleSettings = {
    passenger: 'live',
    logistics: 'off',
}

// Getter functions to fetch settings from Firestore.

let cachedPricingSettings: PricingSettings | null = null;
export const getPricingSettings = async (): Promise<PricingSettings> => {
    const firebaseApp = getClientApp();
    // For client-side, we bypass cache to get realtime updates if needed,
    // or rely on a proper data fetching library that handles caching.
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
            // Document doesn't exist or is incomplete, create/update it
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
    // A simple server-side cache.
    // NOTE: In a real-world scenario with frequent changes, you'd want a more robust caching strategy (e.g., with TTL).
    // For this app, this prevents re-fetching from Firestore on every server-side render.
    if (cachedOperationsSettings && typeof window === 'undefined') return cachedOperationsSettings;
    
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, 'settings', 'operations');
    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Merge fetched settings with defaults to ensure all keys are present
            const settings = { ...defaultOperationsSettings, ...docSnap.data() } as OperationsSettings;
            if(typeof window === 'undefined') cachedOperationsSettings = settings; // Cache on server
            return settings;
        } else {
             // If on the client and the doc doesn't exist, create it with defaults.
             // On the server, we just return defaults without writing to avoid multiple writes on startup.
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

let cachedPaymentSettings: PaymentSettings | null = null;
export async function getPaymentSettings(): Promise<PaymentSettings> {
    const firebaseApp = getClientApp();
    if (cachedPaymentSettings) return cachedPaymentSettings;

    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "settings", "payment");
    
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            cachedPaymentSettings = docSnap.data() as PaymentSettings;
            return cachedPaymentSettings;
        } else {
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
