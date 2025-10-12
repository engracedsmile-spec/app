
"use client";

import { Booking, Draft, Promotion } from "@/lib/data";
import { ArrowRight, Wallet, Bell, Search, HelpCircle, Star, Navigation, ChevronRight, Settings, Trash2, FileEdit, Clock, Tag, Car, Wifi, Calendar, ChevronLeft } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { collection, query, where, orderBy, limit, doc, deleteDoc, getDocs } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getOperationsSettings, type OperationsSettings } from "@/lib/settings";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCollection } from "@/firebase/firestore/use-collection";
import Link from "next/link";
import { Users } from "lucide-react";
import { Header } from "./header";
import { WalletCard } from "@/components/wallet-card";
import { usePreloader } from "@/context/preloader-context";
import { findAvailableDepartures } from "../booking/actions";


const InfoCard = ({ title, description, href, cta, imageUrl, code }: { title: string, description: string, href?: string, cta?: string, imageUrl?: string, icon?: React.ElementType, code?: string }) => {
    const { showPreloader } = usePreloader();
    const router = useRouter();

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (href) {
            e.preventDefault();
            showPreloader();
            router.push(href);
        }
    };
    
    const cardContent = (
        <Card className="relative h-48 w-full overflow-hidden rounded-2xl border-none group">
            {imageUrl ? (
                <>
                    <Image 
                        src={imageUrl} 
                        alt={title} 
                        fill 
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        data-ai-hint="background image"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
                </>
            ) : (
                 <div className="absolute inset-0 bg-gradient-to-r from-card to-card/50" />
            )}
             <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
                 <div>
                     <h3 className="font-bold text-lg">{title}</h3>
                     <p className="text-sm text-white/90 mt-1 line-clamp-2">{description}</p>
                 </div>
                 <div className="flex items-end justify-between">
                     {cta && href && (
                         <Button asChild size="sm" className="w-fit font-bold" variant="default">
                             <Link href={href} onClick={handleLinkClick}>{cta}</Link>
                         </Button>
                     )}
                      {code && (
                        <div className="flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1">
                            <Tag className="h-4 w-4 text-primary" />
                            <span className="font-mono text-sm font-bold text-white">{code}</span>
                        </div>
                    )}
                 </div>
             </div>
        </Card>
    );

    return href ? <Link href={href} onClick={handleLinkClick} className="block">{cardContent}</Link> : cardContent;
}


const DiscoverCarousel = () => {
    const queryConstraints = useMemo(() => [where('status', '==', 'active'), orderBy('createdAt', 'desc')], []);
    const { data: promotions, loading } = useCollection<Promotion>("promotions", { queryConstraints });

    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    const plugins = useMemo(() => [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })], []);

    useEffect(() => {
        if (!api) return;
        
        setCurrent(api.selectedScrollSnap());
        const handleSelect = () => {
            setCurrent(api.selectedScrollSnap());
        };
        api.on("select", handleSelect);
        return () => {
            api.off("select", handleSelect);
        };
    }, [api]);
    
    const items = useMemo(() => promotions?.map(p => ({...p, cta: p.code ? 'Use Code' : (p.href ? 'View Offer' : undefined)})) || [], [promotions]);

    const handleDotClick = useCallback((index: number) => {
        api?.scrollTo(index);
    }, [api]);

    if (loading) {
        return (
             <div className="space-y-4">
                <h2 className="font-bold text-lg px-4">Discover Our Services</h2>
                <div className="px-4">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
             </div>
        );
    }
    
    if (items.length === 0) {
        return null; 
    }

    return (
        <div className="space-y-4">
            <h2 className="font-bold text-lg px-4">Discover Our Services</h2>
            <div className="px-4">
                <Carousel
                    setApi={setApi}
                    className="w-full"
                    plugins={plugins}
                    opts={{ loop: true, align: "start" }}
                >
                    <CarouselContent className="-ml-4">
                        {items.map((item) => (
                            <CarouselItem key={item.id} className="pl-4 basis-full">
                                <InfoCard 
                                    title={item.title}
                                    description={item.description}
                                    href={item.href || "#"}
                                    cta={item.cta}
                                    imageUrl={item.imageUrl}
                                    code={item.code}
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
            
            {items.length > 1 && (
                <div className="flex justify-center items-center gap-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={cn(
                                "h-2 w-2 rounded-full transition-all duration-300",
                                current === index ? "w-6 bg-primary" : "bg-muted-foreground/50"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


const DraftsCard = () => {
    const { user, firestore } = useAuth();
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 5;

    const queryConstraints = useMemo(() => user ? [where("userId", "==", user.id)] : [], [user]);
    const { data: drafts, loading, mutate } = useCollection<Draft>(
        user ? `drafts` : null,
        { queryConstraints }
    );
    
    useEffect(() => {
        const cleanupStaleDrafts = async () => {
            if (!drafts || drafts.length === 0 || !firestore) return;
            
            const draftsToDelete: string[] = [];
            
            for (const draft of drafts) {
                if (draft.type === 'passenger' && draft.formData?.routeId && draft.formData?.travelDate) {
                    try {
                        const available = await findAvailableDepartures(draft.formData.routeId, draft.formData.travelDate);
                        if (available.length === 0) {
                            draftsToDelete.push(draft.id);
                        }
                    } catch (error) {
                        console.error("Error checking draft validity, will not delete:", error);
                    }
                }
            }

            if (draftsToDelete.length > 0) {
                const batch = draftsToDelete.map(id => deleteDoc(doc(firestore, 'drafts', id)));
                await Promise.all(batch);
                toast.info(`${draftsToDelete.length} stale draft(s) have been cleared.`);
                mutate(); // Re-fetch drafts
            }
        };
        cleanupStaleDrafts();
    }, [drafts, firestore, mutate]);

    const handleDelete = async (draftId: string) => {
        const draftRef = doc(firestore, 'drafts', draftId);
        try {
            await deleteDoc(draftRef);
            toast.success("Draft Deleted");
        } catch (error) {
            toast.error("Error", { description: "Could not delete draft."})
        }
    }
    
    const paginatedDrafts = useMemo(() => {
        if (!drafts) return [];
        const startIndex = currentPage * ITEMS_PER_PAGE;
        return drafts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [drafts, currentPage]);

    const totalPages = drafts ? Math.ceil(drafts.length / ITEMS_PER_PAGE) : 0;

    if (loading) {
        return <div className="px-4"><Skeleton className="h-32 w-full" /></div>;
    }

    if (!drafts || drafts.length === 0) return null;

    return (
        <div className="px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Saved Drafts</CardTitle>
                    <CardDescription>You have unfinished bookings. Continue where you left off.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {paginatedDrafts.map(draft => (
                        <div key={draft.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                            <FileEdit className="h-6 w-6 text-primary"/>
                            <div className="flex-1">
                                <p className="font-semibold capitalize">
                                    {draft.type ? draft.type.replace('_', ' ') : 'Unfinished'} Booking
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Last saved: {draft.lastSaved ? new Date((draft.lastSaved as any).toDate()).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/book-trip?draftId=${draft.id}`}>Resume</Link>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive h-9 w-9">
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete this draft. This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(draft.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                    {totalPages > 1 && (
                         <div className="flex justify-center items-center gap-2 pt-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>Previous</Button>
                            <span className="text-sm text-muted-foreground">Page {currentPage + 1} of {totalPages}</span>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1}>Next</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

const UpcomingTripsCard = () => {
    const { user } = useAuth();
    const router = useRouter();
    const { showPreloader } = usePreloader();
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 5;
    
    const queryConstraints = useMemo(() => user ? [
        where("userId", "==", user.id),
        where("status", "in", ['Pending', 'Boarding', 'In Transit'])
    ] : [], [user]);
    
    const { data: upcomingTrips, loading } = useCollection<Booking>(
        user ? `bookings` : null,
        { queryConstraints }
    );

    const sortedTrips = useMemo(() => {
        if (!upcomingTrips) return [];
        return upcomingTrips.sort((a, b) => new Date(a.travelDate || 0).getTime() - new Date(b.travelDate || 0).getTime());
    }, [upcomingTrips]);
    
    const paginatedTrips = useMemo(() => {
        const startIndex = currentPage * ITEMS_PER_PAGE;
        return sortedTrips.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedTrips, currentPage]);

    const totalPages = Math.ceil(sortedTrips.length / ITEMS_PER_PAGE);

    if (loading) return <div className="px-4"><Skeleton className="h-32 w-full" /></div>;
    if (!sortedTrips || sortedTrips.length === 0) return null;
    
    const handleLinkClick = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        showPreloader();
        router.push(href);
    };

    return (
        <div className="px-4 space-y-4">
             <h2 className="font-bold text-lg">Upcoming Trips</h2>
            {paginatedTrips.map(trip => (
                <Link key={trip.id} href={`/dashboard/trip/${trip.id}`} onClick={(e) => handleLinkClick(e, `/dashboard/trip/${trip.id}`)} className="block">
                    <Card className="bg-card hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                             <div className="p-3 bg-primary/10 rounded-full">
                                <Car className="h-6 w-6 text-primary"/>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold">{trip.title}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    {trip.travelDate ? new Date(trip.travelDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A'}
                                </p>
                            </div>
                            <Badge variant="secondary">{trip.status}</Badge>
                        </CardContent>
                    </Card>
                </Link>
            ))}
             {totalPages > 1 && (
                 <div className="flex justify-center items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>Previous</Button>
                    <span className="text-sm text-muted-foreground">Page {currentPage + 1} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1}>Next</Button>
                </div>
            )}
        </div>
    )
}

const OnboardWifiCard = () => {
    const { user } = useAuth();
    const queryConstraints = useMemo(() => user ? [
        where("userId", "==", user.id),
        where("status", "in", ['Completed']),
        where("wifiPassword", "!=", null),
        orderBy("wifiPassword"),
        orderBy("travelDate", "desc"),
        limit(3)
    ] : [], [user]);

    const { data: recentCompletedTrips, loading } = useCollection<Booking>(
        user ? `bookings` : null,
        { queryConstraints }
    );

    const wifiTrips = useMemo(() => recentCompletedTrips || [], [recentCompletedTrips]);
    
    if (loading) return <div className="px-4"><Skeleton className="h-24 w-full" /></div>;
    if (wifiTrips.length === 0) return null;

    return (
        <div className="px-4 space-y-4">
             <h2 className="font-bold text-lg">Onboard WiFi</h2>
            {wifiTrips.map(trip => (
                <Card key={trip.id} className="bg-card">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full">
                            <Wifi className="h-6 w-6 text-blue-500"/>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">SSID: {trip.wifiSSID || 'ENGRACED_SMILES'}</p>
                            <p className="font-bold font-mono tracking-wider">{trip.wifiPassword}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {
                            navigator.clipboard.writeText(trip.wifiPassword || '');
                            toast.success("Password Copied!");
                        }}>
                            Copy
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        const hasShownPinPrompt = sessionStorage.getItem('hasShownPinPrompt');
        if (!hasShownPinPrompt) {
            const toastId = toast("Secure Your Wallet", {
                description: "Create a PIN to protect your funds for all transactions.",
                duration: Infinity,
                action: (
                   <Button onClick={() => {
                        router.push('/dashboard/wallet/pin');
                        toast.dismiss(toastId);
                   }}>
                        Create PIN
                   </Button>
                ),
            });
            sessionStorage.setItem('hasShownPinPrompt', 'true');
        }

    }, [router]);

    return (
        <>
            <Header />
            <div className="space-y-6 pt-4">
                <div className="px-4">
                    <WalletCard />
                </div>
                
                <DiscoverCarousel />
                
                <DraftsCard />
                
                <UpcomingTripsCard />
                
                <OnboardWifiCard />
            </div>
        </>
    );
}
