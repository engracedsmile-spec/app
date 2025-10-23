
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Share2, CheckCircle2 } from "lucide-react";
import { CharterTicket } from '@/app/dashboard/trip/[id]/charter-ticket';
import type { Booking } from '@/lib/data';
import { useReactToPrint } from 'react-to-print';
import { toast } from "sonner";
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getClientApp } from '@/firebase/config';

interface CharterInvoiceScreenProps {
  booking: Booking;
  onFinish: () => void;
}

export const CharterInvoiceScreen = ({ booking, onFinish }: CharterInvoiceScreenProps) => {
  const ticketRef = useRef(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
        const db = getFirestore(getClientApp());
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().whatsappNumber) {
            setWhatsappNumber(docSnap.data().whatsappNumber);
        }
    }
    fetchSettings();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: `Invoice-${booking?.id}`,
    onAfterPrint: () => toast.success("Invoice downloaded!"),
  });
  
  const handleShare = async () => {
      const passengerName = booking.passengerName;
      const tripDetails = `${booking.charterPackageName} for ${booking.charterDays} day(s)`;
      const startDate = booking.travelDate ? new Date(booking.travelDate).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'N/A';
      const totalFare = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN'}).format(booking.price);

      const message = `
Hello Engraced Smiles,

I would like to confirm my charter booking. Please find the details below:

*Name:* ${passengerName}
*Service:* ${tripDetails}
*Start Date:* ${startDate}
*Quoted Fare:* ${totalFare}

Please let me know the next steps for payment and confirmation. My booking ID is ${booking.id.slice(0,10)}.

Thank you!
`.trim().replace(/^\s+/gm, '');

      if (whatsappNumber) {
          const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
          toast.info("Opening WhatsApp...", { description: "Please attach your downloaded invoice to the message and send." });
      } else if (navigator.share) {
            try {
                await navigator.share({
                    title: `Booking Confirmation: ${booking.id.slice(0,10)}`,
                    text: message,
                });
                toast.success("Shared successfully!");
            } catch (error) {
                console.error('Error sharing:', error);
                toast.error("Could not open share dialog.", { description: "You can still download the invoice and share it manually." });
            }
      } else {
            toast.error("Cannot Share Automatically", { description: "Please download the invoice and share it to WhatsApp manually." });
      }
  }

  return (
    <div className="h-full flex flex-col bg-card">
        <div style={{ display: 'none' }}>
            {booking && <CharterTicket ref={ticketRef} booking={{ ...booking, status: 'Quoted' }} />}
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
             <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center bg-primary/20 text-primary rounded-full p-3 mb-2">
                    <CheckCircle2 className="h-8 w-8"/>
                </div>
                <h1 className="text-2xl font-bold">Quote Generated!</h1>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    Your invoice is ready. Please download it and then send it to our team via WhatsApp to finalize your booking.
                </p>
            </div>
            
            <div className="px-4">
                {booking && <CharterTicket booking={{ ...booking, status: 'Quoted' }} />}
            </div>
        </main>
        
        <footer className="p-4 border-t border-border/50 bg-card space-y-3 shrink-0">
             <Button onClick={handlePrint} variant="outline" className="w-full h-12 text-base font-semibold">
                <Download className="mr-3 h-5 w-5"/>
                Download Invoice
            </Button>
            <Button onClick={handleShare} className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white">
                <WhatsAppIcon className="mr-3 h-6 w-6"/>
                Send via WhatsApp
            </Button>
        </footer>
    </div>
  );
};
