/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

"use client";

import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import type { Auth } from 'firebase/auth';

// This function now correctly handles the RecaptchaVerifier lifecycle.
export async function sendOtp(auth: Auth, phoneNumber: string, recaptchaContainerId: string): Promise<ConfirmationResult> {
    
    // Ensure the container is clean before creating a new verifier
    const recaptchaContainer = document.getElementById(recaptchaContainerId);
    if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
    }
    
    const appVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        'size': 'invisible',
    });
    
    try {
        // signInWithPhoneNumber will resolve with a confirmationResult object.
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        return confirmationResult;
    } catch (error) {
        // Errors like invalid phone number, etc., will be caught here.
        console.error("Error sending OTP:", error);
        // It's important to re-throw the error so the calling function knows about it.
        throw error;
    }
}


export async function confirmOtp(confirmationResult: ConfirmationResult | null, otp: string): Promise<boolean> {
    if (!confirmationResult) {
        throw new Error("Firebase confirmation result is not available.");
    }
    try {
        await confirmationResult.confirm(otp);
        return true;
    } catch (error) {
        console.error("Error confirming OTP:", error);
        throw error;
    }
}
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
