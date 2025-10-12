/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

"use client";

import { BookingFlow } from "../booking/booking-flow";
import { Suspense } from "react";

export default function BookTripPage() {
    return (
        <div className="h-dvh w-full bg-muted/30 flex items-center justify-center p-0 md:p-4">
            <Suspense>
                <BookingFlow/>
            </Suspense>
        </div>
    );
}
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
