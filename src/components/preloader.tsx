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

import { AnimatedLogoIcon } from './icons/animated-logo-icon';
import { cn } from '@/lib/utils';

export const Preloader = ({ className }: { className?: string }) => {
    // This component is now purely presentational.
    // The logic to show/hide it is handled by the PreloaderProvider.
    return (
        <div className={cn("fixed inset-0 z-[200] flex h-dvh w-full flex-col items-center justify-center bg-background/80 backdrop-blur-sm", className)}>
            <div className="relative flex flex-col items-center justify-center">
                <AnimatedLogoIcon className="h-24 w-24 text-primary" />
            </div>
        </div>
    );
};

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
