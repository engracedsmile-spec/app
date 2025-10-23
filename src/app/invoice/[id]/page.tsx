/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Booking, User } from "@/lib/data";
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import { useReactToPrint } from 'react-to-print';
import { LogoFull } from "@/components/icons/logo-full";
import { Preloader } from "@/components/preloader";
import { toast } from "sonner";

export default function InvoicePage() {
    const router = useRouter();
    const params = useParams();
    const invoiceId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [customer, setCustomer] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const printRef = useRef(null);

    useEffect(() => {
        if (!invoiceId) return;

        const fetchInvoiceData = async () => {
            setLoading(true);
            const db = getFirestore(firebaseApp);
            const bookingRef = doc(db, "bookings", invoiceId);
            try {
                const bookingSnap = await getDoc(bookingRef);

                if (bookingSnap.exists()) {
                    const bookingData = { id: bookingSnap.id, ...bookingSnap.data() } as Booking;
                    setBooking(bookingData);

                    if (bookingData.userId) {
                        const userRef = doc(db, "users", bookingData.userId);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            setCustomer({ id: userSnap.id, ...userSnap.data() } as User);
                        }
                    }
                } else {
                    toast.error("Not Found", { description: "The requested invoice could not be found." });
                }
            } catch (error) {
                toast.error("Error", { description: "Failed to fetch invoice details." });
            } finally {
                setLoading(false);
            }
        };

        fetchInvoiceData();
    }, [invoiceId]);
    
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Invoice-${invoiceId}`,
    });

    if (loading) {
        return <Preloader />;
    }
    
    if (!booking) {
        return (
             <div className="flex flex-col h-full bg-muted">
                <header className="flex items-center p-4 bg-background z-10 border-b">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Invoice Not Found</h1>
                </header>
                <main className="flex-1 p-6 flex items-center justify-center">
                    <p>The invoice for this booking could not be found.</p>
                </main>
            </div>
        )
    }
    
    const issueDate = (booking.createdAt as any)?.toDate() ?? new Date();
    const isCharter = booking.type === 'charter';
    const description = isCharter 
        ? `${booking.charterPackageName || 'Charter Service'}`
        : `Passenger Trip`;
    const subDescription = isCharter
        ? `Vehicle charter for ${booking.charterDays} day(s)`
        : booking.title;

    return (
        <div className="bg-muted min-h-dvh">
            <header className="flex items-center justify-between p-4 bg-background z-10 border-b print:hidden">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Invoice</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Print / Download
                    </Button>
                </div>
            </header>
            <main className="p-4 md:p-8">
                <Card className="max-w-4xl mx-auto shadow-lg" ref={printRef}>
                    <CardContent className="p-8 md:p-12">
                        <header className="flex justify-between items-start mb-12">
                            <div>
                                <LogoFull className="h-10 w-auto mb-4" />
                                <p className="text-muted-foreground">Engraced Smiles Transport</p>
                                <p className="text-muted-foreground">123 Transport Way, Lagos, Nigeria</p>
                            </div>
                            <div className="text-right">
                                <h1 className="text-3xl font-bold text-primary mb-2">INVOICE</h1>
                                <p className="text-muted-foreground"># {booking.id.slice(0, 10).toUpperCase()}</p>
                            </div>
                        </header>

                        <section className="grid grid-cols-2 gap-8 mb-12">
                            <div>
                                <h2 className="font-semibold mb-2 text-muted-foreground">BILL TO</h2>
                                <p className="font-bold text-lg">{customer?.name || booking.passengerName}</p>
                                <p>{customer?.email || 'guest@booking.com'}</p>
                                <p>{customer?.phone || booking.passengerPhone}</p>
                            </div>
                            <div className="text-right">
                                <div className="mb-4">
                                    <p className="font-semibold text-muted-foreground">Issue Date</p>
                                    <p className="font-medium">{issueDate.toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground">Status</p>
                                    <p className="font-medium text-green-500">Paid</p>
                                </div>
                            </div>
                        </section>

                        <section>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <p className="font-medium">{description}</p>
                                            <p className="text-sm text-muted-foreground">{subDescription}</p>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(booking.price)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </section>

                        <section className="flex justify-end mt-8">
                             <div className="w-full max-w-xs space-y-4">
                                <div className="flex justify-between font-medium">
                                    <span>Subtotal</span>
                                    <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(booking.price)}</span>
                                </div>
                                 <div className="flex justify-between font-medium">
                                    <span>Tax (0%)</span>
                                    <span>₦0.00</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between font-bold text-xl text-primary">
                                    <span>Total Amount</span>
                                    <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(booking.price)}</span>
                                </div>
                            </div>
                        </section>

                        <footer className="mt-16 text-center text-muted-foreground text-sm">
                            <p>Thank you for choosing Engraced Smiles!</p>
                            <p>For any inquiries, please contact support at support@engracedsmiles.com</p>
                        </footer>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */