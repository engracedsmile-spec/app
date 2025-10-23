
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, Award, Wallet, Bell, ArrowRight, Wifi, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CreatedBooking } from "../booking-flow";
import Link from "next/link";
import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Ticket } from './ticket';
import { toast } from "sonner";
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';


const Benefit = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-full">
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
)

export const ShipmentCreated = ({ booking, onFinish, isGuest = true }: { booking: CreatedBooking | null, onFinish: () => void, isGuest?: boolean }) => {
  const router = useRouter();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: `Ticket-${booking?.code}`,
    onPrintError: (error) => {
      console.error('Print error:', error);
      toast.error("Print Failed", { description: "Could not download ticket. Please try again." });
    },
  });

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !booking) return;
    
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
      pdf.save(`Ticket-${booking.code.slice(0, 10)}.pdf`);
      toast.success("Downloaded!", { description: "Your ticket has been downloaded as PDF." });
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Download Failed", { description: "Could not download ticket. Please try the print option instead." });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-muted-foreground mb-4">No trip details found. Something went wrong.</p>
        <Button onClick={() => {
            localStorage.removeItem('bookingFlowProgress');
            router.push("/");
        }}>Back to Home</Button>
      </div>
    );
  }
  
  const getSubDescription = () => {
    if (isGuest) {
      return "Your ticket is ready. Download it now and create an account to manage your trips.";
    }
    if (booking.driverName) {
      return `Your ticket is ready. Your driver is ${booking.driverName}.`;
    }
    return "Your ticket is ready. A driver will be assigned to your trip shortly.";
  }

  const benefits = [
      { icon: Bell, title: 'Trip Reminders & Notifications', description: 'Get live updates and reminders about your trip.' },
      { icon: Award, title: 'View Trip History', description: 'Keep a record of all your past and upcoming journeys.' },
      { icon: Wallet, title: 'Secure Wallet', description: 'Manage funds for even faster one-click bookings.' },
  ]

  return (
    <div className="h-full flex flex-col bg-card">
        <div style={{ display: 'none' }}>
            <Ticket ref={ticketRef} booking={booking} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center bg-green-500/20 text-green-400 rounded-full p-3 mb-2">
                <CheckCircle2 className="h-8 w-8"/>
              </div>
              <h1 className="text-2xl font-bold">Trip Booked Successfully</h1>
              <p className="text-muted-foreground">
                {getSubDescription()}
              </p>
            </div>

            <Card className="bg-card">
              <CardContent className="p-4">
                <Ticket booking={booking} />
              </CardContent>
            </Card>

            {booking.wifiPassword && (
                <Card className="bg-blue-500/5 border-blue-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-400">
                            <Wifi className="h-5 w-5"/>
                            Onboard WiFi Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div>
                            <p className="text-xs text-muted-foreground">Network (SSID)</p>
                            <p className="font-semibold text-lg">{booking.wifiSSID}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Password</p>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-lg font-mono tracking-wider flex-1">{booking.wifiPassword}</p>
                                <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(booking.wifiPassword || ''); toast.success("Copied!"); }}>
                                    <Copy className="h-5 w-5"/>
                                </Button>
                            </div>
                        </div>
                        {isGuest && <p className="text-xs text-blue-400/80">Tip: Screenshot this or create an account to save it automatically.</p>}
                    </CardContent>
                </Card>
            )}
            
            <Button 
                onClick={handleDownloadPDF} 
                className="w-full h-14 text-lg font-bold"
                disabled={isDownloading}
            >
                {isDownloading ? (
                    <>Preparing Download...</>
                ) : (
                    <>
                        <Download className="mr-3 h-6 w-6"/>
                        Download Your Ticket
                    </>
                )}
            </Button>
            
            {isGuest && (
                <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle>Why Create an Account?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {benefits.map(benefit => <Benefit key={benefit.title} {...benefit} />)}
                    </CardContent>
                </Card>
            )}
        </div>
        
        <footer className="p-4 border-t border-border/50 bg-card space-y-3 shrink-0">
            {isGuest ? (
                <>
                    <Button asChild className="w-full h-12 text-base font-semibold">
                        <Link href={`/signup?tripId=${booking.code}`}>Create Account</Link>
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                        Already have an account? <Link href={`/signin?tripId=${booking.code}`} className="font-bold text-primary hover:underline">Sign In</Link>
                    </p>
                </>
            ) : (
                 <Button onClick={onFinish} className="w-full h-12 text-base font-semibold">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5"/>
                </Button>
            )}
        </footer>
    </div>
  );
};
