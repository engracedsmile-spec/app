
"use client";

import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/icons/logo-icon";

export const WelcomeAnimation = ({ className }: { className?: string }) => (
    <div className={cn("relative w-64 h-64", className)}>
        <svg viewBox="0 0 200 200">
            <defs>
                <style>{`
                    .w-circle { animation: w-scale 4s ease-in-out infinite; transform-origin: center; }
                    .w-pin { animation: w-bob 4s ease-in-out infinite; transform-origin: bottom; }
                    .w-sparkle { animation: w-fade 2s ease-in-out infinite alternate; }
                    @keyframes w-scale { 0%, 100% { transform: scale(0.95); } 50% { transform: scale(1.05); } }
                    @keyframes w-bob { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
                    @keyframes w-fade { 0% { opacity: 0.5; } 100% { opacity: 1; } }
                `}</style>
            </defs>
            <circle cx="100" cy="100" r="80" fill="hsl(var(--primary) / 0.1)" />
            <circle cx="100" cy="100" r="60" fill="hsl(var(--primary) / 0.2)" className="w-circle" />
            
            <g className="w-pin" transform="translate(50 50) scale(4)">
                <LogoIcon/>
            </g>
            
            <path d="M60 70 L40 70" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" className="w-sparkle" style={{animationDelay: '0.1s'}} />
            <path d="M140 70 L160 70" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" className="w-sparkle" style={{animationDelay: '0.2s'}} />
            <path d="M50 120 L30 130" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" className="w-sparkle" style={{animationDelay: '0.3s'}} />
            <path d="M150 120 L170 130" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" className="w-sparkle" style={{animationDelay: '0.4s'}} />
        </svg>
    </div>
);

export const TrackingAnimation = ({ className }: { className?: string }) => (
    <div className={cn("relative w-64 h-64", className)}>
        <svg viewBox="0 0 200 200">
             <defs>
                <style>{`
                    .t-path { stroke-dasharray: 500; stroke-dashoffset: 500; animation: t-draw 4s ease-in-out infinite alternate; }
                    .t-car { offset-path: path("M 30 120 C 50 50, 150 150, 170 80"); animation: t-move 4s ease-in-out infinite alternate; }
                    .t-ping { animation: t-ping-anim 2s ease-out infinite; transform-origin: center; }
                    @keyframes t-draw { to { stroke-dashoffset: 0; } }
                    @keyframes t-move { from { offset-distance: 0%; } to { offset-distance: 100%; } }
                    @keyframes t-ping-anim { 0% { r: 0; opacity: 1; } 100% { r: 15; opacity: 0; } }
                `}</style>
            </defs>
            <circle cx="100" cy="100" r="90" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            <path d="M 30 120 C 50 50, 150 150, 170 80" stroke="hsl(var(--border))" strokeWidth="2" fill="none" strokeDasharray="4 2"/>
            <path className="t-path" d="M 30 120 C 50 50, 150 150, 170 80" stroke="hsl(var(--primary))" strokeWidth="3" fill="none"/>
            <g>
                <circle cx="30" cy="120" r="6" fill="hsl(var(--primary))" />
                <circle cx="30" cy="120" r="6" fill="hsl(var(--primary))" className="t-ping" />
            </g>
            <path d="M170 80 L165 70 M170 80 L178 75" stroke="hsl(var(--primary))" strokeWidth="2" fill="none"/>
            <g className="t-car">
                 <path d="M-8 -2 L-6 4 L-4 -2 M-1 -2 L1 -2 M4 -2 L6 4 L8 -2 M-8 6 C-8 8 -6 10 0 10 C6 10 8 8 8 6 L-8 6" fill="hsl(var(--primary))" transform="scale(1.2) rotate(90) translate(-3, 2)" />
            </g>
        </svg>
    </div>
);

export const PaymentAnimation = ({ className }: { className?: string }) => (
    <div className={cn("relative w-64 h-64", className)}>
        <svg viewBox="0 0 200 200">
            <defs>
                <style>{`
                    .p-card { animation: p-slide-in 2s ease-out infinite alternate; }
                    .p-coin { animation: p-drop 2s ease-in infinite forwards; opacity: 0; }
                    .p-check { stroke-dasharray: 100; stroke-dashoffset: 100; animation: p-draw-check 2s ease-out infinite; animation-delay: 1s; }
                    @keyframes p-slide-in { from { transform: translateY(20px) rotate(-5deg); opacity: 0; } to { transform: translateY(0) rotate(0); opacity: 1; } }
                    @keyframes p-drop { 0% { transform: translateY(-20px); opacity: 0; } 20% { opacity: 1; } 80% { transform: translateY(60px); opacity: 1; } 100% { transform: translateY(70px); opacity: 0; } }
                    @keyframes p-draw-check { to { stroke-dashoffset: 0; } }
                `}</style>
            </defs>
            <rect x="50" y="80" width="100" height="60" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" className="p-card" />
            <rect x="60" y="110" width="40" height="10" rx="3" fill="hsl(var(--muted))" className="p-card" />
            
            <circle cx="100" cy="60" r="12" fill="hsl(var(--primary))" className="p-coin" style={{animationDelay: '0s'}} />
            <circle cx="120" cy="60" r="12" fill="hsl(var(--primary))" className="p-coin" style={{animationDelay: '0.2s'}} />
            <circle cx="80" cy="60" r="12" fill="hsl(var(--primary))" className="p-coin" style={{animationDelay: '0.4s'}} />
            
            <circle cx="100" cy="100" r="40" fill="hsl(var(--primary) / 0.1)" />
            <path d="M80 100 L95 115 L120 90" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" className="p-check"/>
        </svg>
    </div>
);
