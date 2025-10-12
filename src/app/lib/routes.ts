import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import type { Route } from './data';
import { nigeriaData } from './nigeria-data';

export const getAvailableRoutes = async (): Promise<Route[]> => {
    const db = getFirestore(firebaseApp);
    const q = query(collection(db, 'routes'));
    
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route));
        }
        return [];
    } catch (error) {
        console.error("Error fetching routes:", error);
         return [];
    }
};

export const getStates = (): string[] => {
    return nigeriaData.map(s => s.state).sort();
}
