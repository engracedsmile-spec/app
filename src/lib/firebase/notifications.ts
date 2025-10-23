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

import { getFirebaseAdmin } from './admin';
import type { AppNotification, User } from '../data';

type NotificationPayload = Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'userId'>;

// This is the function for sending notifications to the big bosses, the "Managers".
// It finds all users with the 'Manager' role and slides into their DMs... I mean, notifications.
export const sendAdminNotification = async (payload: NotificationPayload) => {
    const { adminDb } = getFirebaseAdmin();
    
    // Let's go find all the managers. They're the ones who need to know everything.
    const adminsQuery = adminDb.collection('users').where('role', '==', 'Manager');
    const adminSnap = await adminsQuery.get();
    
    // If there are no managers, we just whisper into the void and move on.
    if (adminSnap.empty) {
        console.warn("Trying to notify admins, but I can't find any. Are they all on vacation?");
        return;
    }

    // We use a batch write because it's efficient. It's like sending a group text instead of individual messages.
    const batch = adminDb.batch();

    adminSnap.forEach(adminDoc => {
        const admin = adminDoc.data() as User;
        const notifRef = adminDb.collection(`users/${admin.id}/notifications`).doc();
        // Crafting the personal little notification for each manager.
        const notification: Omit<AppNotification, 'id'> = {
            ...payload,
            userId: admin.id,
            read: false, // Obviously, it's a new message.
            createdAt: new Date(), // Stamped with the current time.
        };
        batch.set(notifRef, notification);
    });

    try {
        // "Aaaaand... SEND!" - The sound of the batch commit.
        await batch.commit();
    } catch (error) {
        // If it fails, we log it. We don't want to be the reason a manager missed an important update.
        console.error("Failed to send admin notifications. Someone's probably getting a phone call.", error);
    }
}

// This is the function for sending notifications to specific users
export const sendNotification = async (userId: string, payload: NotificationPayload) => {
    const { adminDb } = getFirebaseAdmin();
    
    try {
        const notifRef = adminDb.collection(`users/${userId}/notifications`).doc();
        const notification: Omit<AppNotification, 'id'> = {
            ...payload,
            userId: userId,
            read: false,
            createdAt: new Date(),
        };
        await notifRef.set(notification);
    } catch (error) {
        console.error("Failed to send notification to user:", userId, error);
    }
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
