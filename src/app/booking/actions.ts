/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

'use server';

import admin from 'firebase-admin';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import type { ScheduledTrip } from '@/lib/data';

// Helper function to convert Firestore Timestamps to strings
const serializeObject = (obj: any): any => {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof admin.firestore.Timestamp) {
        return obj.toDate().toISOString();
    }
    
    if (Array.isArray(obj)) {
        return obj.map(serializeObject);
    }
    
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
             newObj[key] = serializeObject(obj[key]);
        }
    }
    return newObj;
};

export async function findAvailableDepartures(routeId: string, dateString: string): Promise<ScheduledTrip[]> {
    const { adminDb } = getFirebaseAdmin();
    
    try {
        console.log(`🔍 Searching for departures: routeId=${routeId}, date=${dateString}`);
        
        const departuresRef = adminDb.collection("scheduledTrips");
        
        // First, let's see all departures for this route
        const allRouteDepartures = await departuresRef.where("routeId", "==", routeId).get();
        console.log(`📊 All departures for route ${routeId}: ${allRouteDepartures.size}`);
        allRouteDepartures.forEach(doc => {
            const data = doc.data();
            console.log(`  - Date: "${data.departureDate}", Status: "${data.status}", Period: "${data.departurePeriod}"`);
        });
        
        const q = departuresRef
            .where("routeId", "==", routeId)
            .where('departureDate', '==', dateString)
            .where('status', 'in', ['Scheduled', 'Boarding', 'Provisional']);

        const querySnapshot = await q.get();
        console.log(`📊 Found ${querySnapshot.size} departures for route ${routeId} on ${dateString}`);
        
        if (querySnapshot.empty) {
            console.log(`❌ No departures found for route ${routeId} on ${dateString}`);
            return [];
        }

        const availableDepartures = querySnapshot.docs.map(doc => {
            return serializeObject({ 
                id: doc.id, 
                ...doc.data(),
            }) as ScheduledTrip;
        }).filter(trip => {
            const bookedSeatsCount = trip.bookedSeats?.length || 0;
            const heldSeatsCount = Object.keys(trip.seatHolds || {}).length;
            const hasSeats = (bookedSeatsCount + heldSeatsCount) < 7;
            console.log(`  Trip ${trip.id}: Booked=${bookedSeatsCount}, Held=${heldSeatsCount}, HasSeats=${hasSeats}`);
            return hasSeats;
        }).sort((a, b) => {
            if (a.departurePeriod === 'Morning' && b.departurePeriod === 'Evening') return -1;
            if (a.departurePeriod === 'Evening' && b.departurePeriod === 'Morning') return 1;
            return 0;
        });
        
        console.log(`✅ Returning ${availableDepartures.length} available departures`);
        return availableDepartures;

    } catch (error: any) {
        console.error(`Error in findAvailableDepartures for route ${routeId} on ${dateString}:`, error);
        throw new Error(`A database error occurred while searching for departures.`);
    }
};
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
