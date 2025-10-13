
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Copy, User, Star, MessageSquare, Car, MapPin, Package as PackageIcon, Navigation, StarIcon, PackageCheck, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import type { Status, Booking } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import QRCode from "qrcode.react";
import { getFirestore, doc, onSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Preloader } from "@/components/preloader";
import { useReactToPrint } from 'react-to-print';
import { Ticket } from '@/app/booking/components/ticket';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';


const Rating = ({ currentRating, onRatingChange }: { currentRating: number, onRatingChange: (rating: number) => void }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                    key={star}
                    className={cn("h-8 w-8 cursor-pointer", star <= currentRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50")}
                    onClick={() => onRatingChange(star)}
                />
            ))}
        </div>
    );
};


const TripRating = ({ trip, onComplete }: { trip: Booking, onComplete: () => void }) => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { firestore } = useAuth();

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }
        setIsSubmitting(true);
        const tripRef = doc(firestore, 'bookings', trip.id);
        
        try {
            await updateDoc(tripRef, {
                rating: {
                    stars: rating,
                    feedback: feedback
                }
            });
            toast.success("Thank you for your feedback!");
            onComplete();
        } catch (error) {
            toast.error("Failed to submit feedback.");
        } finally {
            setIsSubmitting(false);
        }
    }
    
    return (
         <Card className="bg-card">
            <CardHeader className="text-center">
                <CardTitle>How was your trip?</CardTitle>
                <CardDescription>Rate your experience with the driver.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
                <Rating currentRating={rating} onRatingChange={setRating} />
                 <Textarea 
                    placeholder="Tell us more about your experience (optional)"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />
                <Button className="w-full h-12" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Feedback
                </Button>
            </CardContent>
        </Card>
    )
}


const StatusBadge = ({ status }: { status: Status }) => {
    const variants: Record<Status, string> = {
        'On Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Delayed': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
        'Completed': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Boarding': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        'In Transit': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'Pending': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return <Badge variant="outline" className={`text-xs font-medium border-0 ${variants[status]}`}>{status}</Badge>;
};


export default function TripDetailPage() {
    const router = useRouter();
    const params = useParams();
    const tripId = params.id as string;
    const { firestore } = useAuth();

    const [trip, setTrip] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRating, setShowRating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const ticketRef = useRef<HTMLDivElement>(null);
    
    const handlePrint = useReactToPrint({
        content: () => ticketRef.current,
        documentTitle: `Ticket-${trip?.id}`,
        onPrintError: (error) => {
            console.error('Print error:', error);
            toast.error("Download Failed", { description: "Could not download ticket. Please try again." });
        },
    });

    const handleDownloadPDF = async () => {
        if (!ticketRef.current || !trip) return;
        
        setIsDownloading(true);
        try {
            // Convert the ticket to an image
            const dataUrl = await toPng(ticketRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
            });

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [400, 600],
            });

            // Add image to PDF
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            // Download PDF
            pdf.save(`Ticket-${trip.id.slice(0, 10)}.pdf`);
            toast.success("Downloaded!", { description: "Your ticket has been downloaded as PDF." });
        } catch (error) {
            console.error('Download error:', error);
            toast.error("Download Failed", { description: "Could not download ticket. Please try again." });
        } finally {
            setIsDownloading(false);
        }
    };


    useEffect(() => {
        if(!tripId) return;

        const docRef = doc(firestore, "bookings", tripId);
        
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const tripData = { id: docSnap.id, ...docSnap.data() } as Booking;
                setTrip(tripData);
                if (tripData.status === 'Completed' && !tripData.rating) {
                    setShowRating(true);
                }
            } else {
                toast.error("Error", { description: 'Trip not found.' });
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching trip:", error);
            toast.error("Error", { description: 'Could not load trip details.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tripId, firestore]);

    if (loading) {
        return <Preloader />;
    }
    
    if (!trip) {
        return (
            <div className="flex flex-col h-full bg-muted">
                <header className="flex items-center p-4 bg-background z-10 border-b">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Trip Not Found</h1>
                </header>
                <main className="flex-1 p-6 flex items-center justify-center">
                    <p>The trip with ID "{tripId}" could not be found.</p>
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <header className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Your Trip</h1>
                </div>
                <Button 
                    onClick={handleDownloadPDF} 
                    variant="outline" 
                    size="sm"
                    disabled={isDownloading}
                >
                    {isDownloading ? "Downloading..." : "Download Ticket"}
                </Button>
            </header>

            <main className="flex-1 p-4 md:p-6 space-y-6">
                
                <div style={{ display: 'none' }}>
                    <Ticket ref={ticketRef} booking={trip} />
                </div>
                
                <Card>
                    <CardContent className="p-4">
                         <Ticket booking={trip} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Trip Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <StatusBadge status={trip.status} />
                         <p className="text-sm text-muted-foreground mt-2">Current status of your journey.</p>
                    </CardContent>
                </Card>
                
                {showRating && <TripRating trip={trip} onComplete={() => setShowRating(false)} />}

            </main>
        </div>
    );
}
