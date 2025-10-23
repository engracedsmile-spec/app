
"use client";

import { cn } from "@/lib/utils";
import { MapPin, Users, Car, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

const steps = [
  {
    icon: MapPin,
    text: "Select Your Route",
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    icon: Users,
    text: "Choose Your Seat",
    color: "bg-yellow-500/20 text-yellow-400",
  },
  {
    icon: Car,
    text: "Enjoy a Premium Ride",
    color: "bg-primary/20 text-primary",
  },
  {
    icon: CheckCircle,
    text: "Arrive with a Smile",
    color: "bg-green-500/20 text-green-400",
  },
];

export const AuthAnimation = ({ className }: { className?: string }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000); // Change step every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("relative w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden bg-background/50 p-8", className)}>
        <div className="absolute inset-0 z-0">
             <div className="absolute h-48 w-48 rounded-full bg-primary/5 blur-3xl animate-pulse -top-10 -left-10"></div>
             <div className="absolute h-64 w-64 rounded-full bg-blue-500/5 blur-3xl animate-pulse -bottom-20 -right-10" style={{ animationDelay: '1s' }}></div>
             <div className="absolute h-32 w-32 rounded-full bg-yellow-500/5 blur-3xl animate-pulse top-20 -right-5" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center gap-6">
            <div className="relative grid grid-cols-2 grid-rows-2 gap-x-12 gap-y-12">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={cn(
                            "relative flex flex-col items-center justify-center transition-opacity duration-500",
                            currentStep >= index ? "opacity-100" : "opacity-30"
                        )}
                    >
                        <div className={cn("flex items-center justify-center h-20 w-20 rounded-full", step.color)}>
                            <step.icon className="h-10 w-10" />
                        </div>
                        <p className="mt-2 text-xs text-center text-muted-foreground">{step.text}</p>
                    </div>
                ))}
                 {/* Animated Connector Lines */}
                <svg className="absolute inset-0 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 48 48 L 100 48" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M 124 48 L 124 100" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M 100 124 L 48 124" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4 4" />
                </svg>
            </div>
            <div className="relative w-full h-1 bg-muted rounded-full overflow-hidden mt-6">
                <div
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
            </div>
        </div>
    </div>
  );
};
