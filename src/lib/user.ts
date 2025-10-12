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
import { doc, setDoc, Firestore } from 'firebase/firestore';
import type { User } from './data';

/**
 * Creates a user document in Firestore.
 * This function is basically the bouncer at the club door for new user data.
 * It makes sure everyone has their ID (the user object) and gets them into the system.
 * Only call this from a secure place, like a server action or right after a social auth handshake.
 * We don't want any riff-raff getting in.
 *
 * @param firestore - The Firestore instance. Think of it as the club's VIP list.
 * @param user - The user object to be saved. This is their ticket in.
 */
export async function createUserDocument(firestore: Firestore, user: User) {
  // No user, no entry. Simple as that.
  if (!user || !user.id) {
    throw new Error("Can't create a user document without a user object and an ID. What am I, a magician?");
  }
  const userDocRef = doc(firestore, 'users', user.id);

  try {
    // Making sure the data is clean and ready for the database.
    const userData: User = { ...user };
    await setDoc(userDocRef, userData);
  } catch (serverError: any) {
      // If something goes wrong, we're not just gonna whisper it. We're re-throwing the error
      // so the calling function has to deal with the mess. Not my problem anymore.
      throw serverError;
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
