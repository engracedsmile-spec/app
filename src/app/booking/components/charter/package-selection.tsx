
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, GlassWater, PartyPopper, Car, Wifi, Zap, Music, Cookie } from "lucide-react";
import type { CharterPackage, CharterPackageFeature } from "@/lib/data";
import { cn } from "@/lib/utils";

interface PackageSelectionProps {
  onNext: (pkg: CharterPackage) => void;
  packages: CharterPackage[];
}

const FeatureIcon = ({ feature }: { feature: CharterPackageFeature }) => {
    
    const icons: { [key: string]: React.ElementType } = {
        'Onboard WiFi': Wifi,
        'Bottled Water': GlassWater,
        'Snack Pack': Cookie,
        'Security Escort': ShieldCheck,
        'Charging Ports': Zap,
        'Music System': Music,
        'Custom Decorations': PartyPopper,
    };
    const Icon = icons[feature.name] || Car;
    
    return (
        <div className={cn("flex items-center gap-2", feature.status === 'included' ? "text-primary" : "text-muted-foreground")}>
            <Icon className="h-4 w-4"/>
            <span className="text-sm">{feature.name}</span>
        </div>
    )
}

const PackageCard = ({ pkg, onSelect, selected }: { pkg: CharterPackage, onSelect: () => void, selected: boolean }) => (
    <Card 
        onClick={onSelect} 
        className={cn(
            "cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200",
            selected && "border-primary ring-2 ring-primary"
        )}
    >
        <CardHeader>
            <div className="flex justify-between items-start">
                <CardTitle>{pkg.name}</CardTitle>
                {selected && <CheckCircle2 className="h-6 w-6 text-primary" />}
            </div>
            <CardDescription>{pkg.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <p><span className="font-bold text-2xl">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN'}).format(pkg.basePrice)}</span> <span className="text-muted-foreground">base fare</span></p>
             <div className="space-y-2">
                 {pkg.features && pkg.features.length > 0 && pkg.features.map((feature, index) => (
                    <FeatureIcon key={index} feature={feature} />
                 ))}
             </div>
        </CardContent>
    </Card>
);

export const CharterPackageSelection = ({ onNext, packages }: PackageSelectionProps) => {
    const [selectedPackage, setSelectedPackage] = useState<CharterPackage | null>(null);

    const handleSelect = (pkg: CharterPackage) => {
        setSelectedPackage(pkg);
    };
    
    const handleNext = () => {
        if (selectedPackage) {
            onNext({ ...selectedPackage });
        }
    }

    return (
        <div className="w-full h-full flex flex-col bg-card">
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {packages.length > 0 ? packages.map(pkg => (
                    <PackageCard 
                        key={pkg.id}
                        pkg={pkg}
                        onSelect={() => handleSelect(pkg)}
                        selected={selectedPackage?.id === pkg.id}
                    />
                )) : (
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Car className="h-16 w-16 mx-auto text-primary/20"/>
                        <p className="text-lg font-semibold mt-4">No Charter Packages Found</p>
                        <p className="mt-1 max-w-xs mx-auto">This service is not yet available. The administrator has not configured any charter packages.</p>
                    </div>
                )}
            </main>
             <footer className="p-4 border-t border-border/50 bg-card shrink-0">
                <Button onClick={handleNext} disabled={!selectedPackage} className="h-14 w-full text-lg font-bold">
                    Continue
                </Button>
            </footer>
        </div>
    )
}
