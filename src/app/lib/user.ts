import { doc, setDoc, Firestore } from 'firebase/firestore';
import type { User } from './data';

/**
 * Creates a user document in Firestore.
 * This will be called from a secure context (like a server action or after social auth)
 * or by an admin.
 * @param firestore - The Firestore instance.
 * @param user - The user object to be saved.
 */
export async function createUserDocument(firestore: Firestore, user: Omit<User, 'id'> & { id: string }) {
  if (!user || !user.id) {
    throw new Error("Invalid user object provided to createUserDocument.");
  }
  const userDocRef = doc(firestore, 'users', user.id);

  try {
    // Ensure the data being set matches the User type as much as possible,
    // excluding the 'id' from the data body itself if it's already used in the ref.
    const userData: Omit<User, 'id'> = { ...user };
    await setDoc(userDocRef, userData);
  } catch (serverError: any) {
      // Create a detailed, contextual error
      throw serverError; // Re-throw to be caught by the calling function
  }
}
