#!/usr/bin/env node

/**
 * Database Migration Script: Fix Vehicle Seats
 * 
 * This script ensures all vehicles in the database have a 'seats' field.
 * Run this script to fix the 0/N/A issue in the admin departures page.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function fixVehicleSeats() {
  console.log('🔧 Starting vehicle seats migration...');
  
  try {
    const vehiclesRef = db.collection('vehicles');
    const snapshot = await vehiclesRef.get();
    
    if (snapshot.empty) {
      console.log('❌ No vehicles found in database');
      return;
    }
    
    const batch = db.batch();
    let updateCount = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Check if seats field is missing or undefined
      if (!data.seats || data.seats === undefined) {
        console.log(`📝 Updating vehicle ${doc.id}: ${data.make} ${data.model}`);
        batch.update(doc.ref, { seats: 7 }); // Default to 7 seats
        updateCount++;
      } else {
        console.log(`✅ Vehicle ${doc.id} already has seats: ${data.seats}`);
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully updated ${updateCount} vehicles with default seat count of 7`);
    } else {
      console.log('✅ All vehicles already have seat counts defined');
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
  
  console.log('🎉 Migration completed successfully!');
  process.exit(0);
}

// Run the migration
fixVehicleSeats();
