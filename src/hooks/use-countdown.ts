/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

"use client";

import { useState, useEffect, useMemo } from 'react';

export const useCountdown = (targetDate: string | Date | undefined) => {
    const countDownDate = useMemo(() => targetDate ? new Date(targetDate).getTime() : 0, [targetDate]);

    const [countDown, setCountDown] = useState(
        countDownDate ? countDownDate - new Date().getTime() : 0
    );

    useEffect(() => {
        if (!countDownDate) {
            setCountDown(0);
            return;
        };

        const interval = setInterval(() => {
            setCountDown(countDownDate - new Date().getTime());
        }, 1000);

        return () => clearInterval(interval);
    }, [countDownDate]);
    
    if (countDown < 0 || !countDownDate) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true };
    }

    const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
        (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isFinished: false };
};
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
