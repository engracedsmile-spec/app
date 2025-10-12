
import { cn } from "@/lib/utils";
import * as React from "react";
import { AnimatedLogoIcon } from "./animated-logo-icon";

export const LogoFull = (props: React.SVGProps<SVGSVGElement>) => (
    <div className={cn("flex items-center gap-2", props.className)}>
        <AnimatedLogoIcon {...props} className="h-full w-auto" />
        <span className="text-2xl font-bold tracking-tight">Engraced Smiles</span>
    </div>
);
