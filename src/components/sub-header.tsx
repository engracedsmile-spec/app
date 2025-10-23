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

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SubHeaderProps {
    title: string;
    children?: React.ReactNode;
    className?: string;
}

export const SubHeader = ({ title, children, className }: SubHeaderProps) => {
    const router = useRouter();

    return (
        <header className={cn("flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b", className)}>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                 <h1 className="text-lg md:text-xl font-bold text-left truncate">{title}</h1>
            </div>
            {children && <div>{children}</div>}
        </header>
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
