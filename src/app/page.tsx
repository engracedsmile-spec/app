
"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useCallback, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogoFull } from "@/components/icons/logo-full";
import { Car, Wallet, MapPin, Ticket, Route, Armchair, ShieldCheck, CheckCircle } from "lucide-react";
import { Preloader } from "@/components/preloader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { HeroAction } from "./hero-tracker";
import placeholderImages from "./lib/placeholder-images.json";

const Slide = ({ title, description, backgroundColor, children }: { title: string, description: string, backgroundColor?: string, children?: React.ReactNode }) => (
     <div className={cn("relative h-dvh w-full text-center text-white p-8", backgroundColor)}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center">
            <div className="w-full max-w-lg space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
                    <p className="mt-4 text-lg text-white/80">{description}</p>
                </div>
                {children}
            </div>
        </div>
    </div>
);


function WelcomePageComponent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const handleSuccessfulLogin = useCallback(
        (loggedInUser: any) => {
            const redirectPath =
                loggedInUser.userType === 'admin'
                    ? '/admin/dashboard'
                    : loggedInUser.userType === 'driver'
                    ? '/driver/dashboard'
                    : '/dashboard';
            router.replace(redirectPath);
        },
        [router]
    );

    useEffect(() => {
        if (!authLoading && user) {
            handleSuccessfulLogin(user);
        }
    }, [user, authLoading, handleSuccessfulLogin]);

    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const plugins = React.useMemo(() => [Autoplay({ delay: 6000, stopOnInteraction: true })], []);

    useEffect(() => {
        if (!api) return;

        const handleSelect = () => {
            setCurrent(api.selectedScrollSnap());
        };

        api.on("select", handleSelect);
        return () => {
            api.off("select", handleSelect);
        };
    }, [api]);
    
    const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api]);
    
    if (authLoading || user) {
        return <Preloader />; 
    }

    const slides = [
        {
            id: 'hero',
            title: "Travel with Grace, Arrive with a Smile",
            description: "Your trusted partner for premium passenger trips and reliable logistics across Nigeria.",
            imageUrl: placeholderImages.hero.src,
            hint: placeholderImages.hero.hint,
        },
        {
            id: 'passenger',
            title: "Seamless Seat Booking",
            description: "Your journey is just a few taps away. Experience effortless booking from start to finish.",
            backgroundColor: "bg-gradient-to-br from-blue-900/50 via-slate-900 to-background",
            children: (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white w-full">
                    <CardHeader>
                         <CardTitle>Easy as 1-2-3</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-left">
                        <div className="flex items-center gap-4"><Route className="h-6 w-6 text-primary"/><p>Select your route and travel date.</p></div>
                        <div className="flex items-center gap-4"><Armchair className="h-6 w-6 text-primary"/><p>Choose your preferred seat in our comfortable vehicles.</p></div>
                        <div className="flex items-center gap-4"><Ticket className="h-6 w-6 text-primary"/><p>Confirm your booking and get your e-ticket instantly.</p></div>
                    </CardContent>
                </Card>
            )
        },
        {
            id: 'charter',
            title: "Exclusive Charter Services",
            description: "Reserve an entire vehicle for your private group trips, events, or executive travel needs.",
            backgroundColor: "bg-gradient-to-br from-gray-800/50 via-slate-900 to-background",
            children: (
                 <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white w-full">
                    <CardHeader>
                         <CardTitle>Your Private Ride</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-left">
                        <div className="flex items-center gap-4"><CheckCircle className="h-6 w-6 text-primary"/><p>Ultimate privacy and comfort for your group.</p></div>
                        <div className="flex items-center gap-4"><CheckCircle className="h-6 w-6 text-primary"/><p>Flexible scheduling tailored to your itinerary.</p></div>
                        <div className="flex items-center gap-4"><CheckCircle className="h-6 w-6 text-primary"/><p>Professional and vetted drivers at your service.</p></div>
                    </CardContent>
                </Card>
            )
        },
        {
            id: 'wallet',
            title: "Secure Wallet & Easy Payments",
            description: "Fund your wallet for one-click bookings and manage all your transactions in one secure place.",
            backgroundColor: "bg-gradient-to-br from-yellow-900/30 via-slate-900 to-background",
            children: (
                 <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white w-full">
                    <CardHeader>
                         <CardTitle>Fast & Safe Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-left">
                        <div className="flex items-center gap-4"><ShieldCheck className="h-6 w-6 text-primary"/><p>PIN-protected for maximum security.</p></div>
                        <div className="flex items-center gap-4"><Wallet className="h-6 w-6 text-primary"/><p>Fund your wallet easily with multiple payment options.</p></div>
                        <div className="flex items-center gap-4"><CheckCircle className="h-6 w-6 text-primary"/><p>Enjoy faster checkouts for all your bookings.</p></div>
                    </CardContent>
                </Card>
            )
        },
        {
            id: 'tracking',
            title: "Real-Time Trip Tracking",
            description: "Never be in the dark. Track your trip's progress live on the map from start to finish.",
            backgroundColor: "bg-gradient-to-br from-green-900/50 via-slate-900 to-background",
             children: (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white w-full">
                    <CardHeader>
                        <CardTitle>Peace of Mind on the Go</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-left">
                        <div className="flex items-center gap-4"><MapPin className="h-6 w-6 text-primary"/><p>See your vehicle's live location on the map.</p></div>
                        <div className="flex items-center gap-4"><CheckCircle className="h-6 w-6 text-primary"/><p>Share your trip status with family and friends.</p></div>
                        <div className="flex items-center gap-4"><CheckCircle className="h-6 w-6 text-primary"/><p>Receive timely updates about your journey.</p></div>
                    </CardContent>
                </Card>
            )
        },
    ];

    return (
        <div className="relative h-dvh w-full bg-black">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={cn(
                            "h-2.5 w-2.5 rounded-full bg-white/50 transition-all duration-300",
                            current === index && "w-6 bg-white"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
            
            <div className="h-full overflow-hidden">
                <Carousel 
                    setApi={setApi} 
                    opts={{ loop: true, align: 'start' }} 
                    plugins={plugins}
                    className="h-full"
                >
                    <CarouselContent className="-ml-0 h-full">
                        {slides.map((slide) => (
                            <CarouselItem key={slide.id} className="pl-0 basis-full h-full">
                                {slide.id === 'hero' ? (
                                    <div className="relative h-dvh w-full text-center text-white p-8">
                                        <div className="absolute inset-0 z-0">
                                            <Image
                                                src={slide.imageUrl || ''}
                                                alt={slide.title}
                                                fill
                                                className="object-cover"
                                                quality={100}
                                                unoptimized={slide.imageUrl?.endsWith('.gif')}
                                                data-ai-hint={slide.hint}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30"></div>
                                        </div>
                                         <div className="relative z-10 flex h-full flex-col items-center justify-center">
                                            <div className="text-center">
                                                <LogoFull className="h-20 w-auto justify-center" />
                                                <h1 className="text-4xl font-bold tracking-tight mt-6">{slide.title}</h1>
                                                <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">{slide.description}</p>
                                            </div>
                                            <div className="absolute bottom-20">
                                                <HeroAction />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Slide {...slide} />
                                )}
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
             </div>
            
            <footer className="absolute bottom-0 z-10 p-4 w-full text-center text-xs text-white/50">
                <Link href="/about" className="hover:underline">About Us</Link>
                <span className="mx-2">|</span>
                <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
                <span className="mx-2">|</span>
                <Link href="/terms-of-service" className="hover:underline">Terms of Service</Link>
            </footer>
        </div>
    );
}


export default function WelcomePage() {
    return (
        <Suspense fallback={<Preloader />}>
            <WelcomePageComponent />
        </Suspense>
    );
}
