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

import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import { getClientApp } from '@/firebase/config';
import type { Route } from './data';
import { nigeriaData } from './nigeria-data';

// This function is like the station master, it knows all the routes.
// Call this when you need to know all the places the buses can go.
export const getAvailableRoutes = async (): Promise<Route[]> => {
    const firebaseApp = getClientApp();
    const db = getFirestore(firebaseApp);
    const q = query(collection(db, 'routes'));
    
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            // Mapping over the docs and pretending we're adding IDs. The docs already have 'em, but TypeScript is pedantic.
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route));
        }
        // No routes? Well, that's a quiet station. Return an empty array.
        return [];
    } catch (error) {
        // If the database is on fire or something, log it and return nothing.
        // The user doesn't need to know the world is ending.
        console.error("Catastrophic failure fetching routes. Maybe check the Firestore console?", error);
         return [];
    }
};

// Just a simple function to get all the Nigerian states.
// Because who has time to type them all out? Not me.
export const getStates = (): string[] => {
    return nigeriaData.map(s => s.state).sort();
}

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
