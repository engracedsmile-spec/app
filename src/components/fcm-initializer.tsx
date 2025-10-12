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

"use client";

import { useEffect } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useAuth } from "@/hooks/use-auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getClientApp } from '@/firebase/config';
import { toast } from "sonner";

const FcmInitializer = () => {
    const { user } = useAuth();

    useEffect(() => {
        // Look, this only runs on the client. Don't try to make it work on the server.
        // It's like trying to teach a fish to climb a tree. A very, very dry tree.
        if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !user) {
            return;
        }
        const firebaseApp = getClientApp();
        const messaging = getMessaging(firebaseApp);

        const requestPermissionAndToken = async () => {
            try {
                // First, we gotta ask nicely for permission. If the user says no, we can't be pushy.
                if (Notification.permission !== "granted") {
                    const permission = await Notification.requestPermission();
                     if (permission !== "granted") {
                        console.log("User said no to notifications. Can't blame 'em, they can be annoying.");
                        return;
                    }
                }

                // If they say yes, we grab the magic token. It's like their personal notification doorbell.
                const currentToken = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                });

                // If we got a token AND it's a new one, we save it. No need to spam Firestore otherwise.
                if (currentToken && user.fcmToken !== currentToken) {
                    console.log("New FCM Token, hot off the press:", currentToken);
                    const db = getFirestore(firebaseApp);
                    const userRef = doc(db, "users", user.id);
                    await updateDoc(userRef, { fcmToken: currentToken });
                    console.log("Token saved. Now we can ping 'em.");
                } else if (!currentToken) {
                    console.log('No token for you! Permission needed, maybe?');
                }
            } catch (error) {
                console.error("Something blew up while getting the FCM token. Whoops.", error);
            }
        };

        requestPermissionAndToken();

        // This part listens for messages while the user is actively staring at the screen.
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("Got a message while they were looking! ", payload);
            toast.info(payload.notification?.title, {
              description: payload.notification?.body,
              action: {
                  label: "View",
                  onClick: () => {
                      if (payload.fcmOptions?.link) {
                          window.location.href = payload.fcmOptions.link;
                      }
                  }
              }
            });
        });

        // Clean up our listener when the component decides to peace out.
        return () => {
            unsubscribe();
        };

    }, [user]);

    return null; // This component does its work in the shadows. It renders nothing. Spooky.
};

export default FcmInitializer;

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
