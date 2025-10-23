
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AnimatedMap } from "@/app/animated-map";

interface PriceCalculationProps {
  price: string;
  onConfirm: () => void;
  onSaveForLater?: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const PriceCalculation = ({ price, onConfirm, onSaveForLater, onBack, isLoading }: PriceCalculationProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 md:p-6 relative bg-card">
        <header className="w-full p-0 flex items-center justify-center relative border-b border-border/50 -mt-6 pb-4">
            <Button type="button" variant="ghost" size="icon" onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2">
                <ArrowLeft className="h-5 w-5"/>
            </Button>
            <h1 className="text-xl font-bold">Fare Calculation</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center w-full space-y-8">
            <AnimatedMap className="w-64 h-64" />
            
            <div className="w-full text-center">
                <p className="text-muted-foreground text-lg">Total Estimated Fare</p>
                <p className="text-4xl font-bold my-2 text-primary">{price}</p>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">This is your total trip fare. Please confirm if you agree.</p>
            </div>
        </div>

        <div className="w-full space-y-2">
            <Button onClick={onConfirm} className="h-14 w-full text-lg font-bold" disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="animate-spin" />
                ) : "Confirm Booking"}
            </Button>
             {onSaveForLater && (
                <Button variant="outline" onClick={onSaveForLater} className="w-full h-12 text-base" disabled={isLoading}>
                    Save for Later
                </Button>
            )}
        </div>
    </div>
  );
};
