
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, CalendarIcon, Download, Loader2, BarChart, Users, DollarSign, Car, Package, Share2, Printer, WhatsApp } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef } from "react";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from "@/firebase";
import type { Shipment, User } from "@/lib/data";
import { AdminHelp } from "../help";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toPng } from 'html-to-image';
import { LogoFull } from "@/components/icons/logo-full";
import { cn } from "@/lib/utils";

const ReportTemplate = React.forwardRef(({ reportData, dateRange }: { reportData: any; dateRange: DateRange | undefined }, ref: React.Ref<HTMLDivElement>) => {
    if (!reportData) return null;
    const { totalRevenue, totalBookings, passengerTrips, charterHires, newUsers } = reportData;

    const formattedDate = dateRange?.from ?
        dateRange.to ?
            `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` :
            format(dateRange.from, "LLL dd, y") :
        "N/A";

    const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
        <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Icon className="h-4 w-4" />
                <span>{title}</span>
            </div>
            <p className="font-bold text-2xl mt-1">{value}</p>
        </div>
    );

    return (
        <div ref={ref} className="bg-background text-foreground p-8">
            <header className="flex justify-between items-start mb-12">
                <div>
                    <LogoFull className="h-10 w-auto mb-4" />
                    <p className="text-muted-foreground">Engraced Smiles Transport</p>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-primary mb-2">Daily Digest</h1>
                    <p className="font-medium">{formattedDate}</p>
                </div>
            </header>
            <main>
                <h2 className="text-lg font-semibold mb-4">Executive Summary</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Revenue" value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalRevenue)} icon={DollarSign} />
                    <StatCard title="Total Bookings" value={totalBookings.toString()} icon={Package} />
                    <StatCard title="Passenger Trips" value={passengerTrips.toString()} icon={Users} />
                    <StatCard title="Charter Hires" value={charterHires.toString()} icon={Car} />
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">New Users</h2>
                    {newUsers.length > 0 ? (
                        <div className="border rounded-lg">
                            {newUsers.slice(0, 5).map((user: User) => (
                                <div key={user.id} className="flex justify-between p-3 border-b last:border-b-0">
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{new Date(user.dateJoined).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">No new users in this period.</p>}
                </div>
            </main>
             <footer className="mt-16 text-center text-muted-foreground text-xs">
                <p>Report generated on {new Date().toLocaleString()}.</p>
            </footer>
        </div>
    );
});
ReportTemplate.displayName = "ReportTemplate";


export default function ReportPage() {
    const router = useRouter();
    const { firestore } = useAuth();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: new Date(), to: new Date() });
    const [reportData, setReportData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const reportRef = useRef(null);

    const handleGenerateReport = async () => {
        if (!dateRange?.from) {
            toast.error("Please select a date range.");
            return;
        }

        setLoading(true);
        const toDate = dateRange.to || dateRange.from;
        const fromTimestamp = Timestamp.fromDate(new Date(dateRange.from.setHours(0, 0, 0, 0)));
        const toTimestamp = Timestamp.fromDate(new Date(toDate.setHours(23, 59, 59, 999)));
        
        try {
            const shipmentsQuery = query(collection(firestore, "shipments"), where('createdAt', '>=', fromTimestamp), where('createdAt', '<=', toTimestamp));
            const usersQuery = query(collection(firestore, "users"), where('dateJoined', '>=', format(dateRange.from, 'yyyy-MM-dd')), where('dateJoined', '<=', format(toDate, 'yyyy-MM-dd')));

            const [shipmentsSnap, usersSnap] = await Promise.all([getDocs(shipmentsQuery), getDocs(usersQuery)]);

            const shipments = shipmentsSnap.docs.map(doc => doc.data() as Shipment);
            const newUsers = usersSnap.docs.map(doc => doc.data() as User);

            const totalRevenue = shipments.filter(s => s.status === 'Completed' || s.status === 'Delivered').reduce((acc, s) => acc + s.price, 0);
            const passengerTrips = shipments.filter(s => s.type === 'passenger').length;
            const charterHires = shipments.filter(s => s.type === 'charter').length;

            setReportData({
                totalRevenue,
                totalBookings: shipments.length,
                passengerTrips,
                charterHires,
                newUsers,
            });
            toast.success("Report generated successfully!");
        } catch (error: any) {
            console.error("Error generating report: ", error);
            toast.error("Error", { description: `Could not generate report. Firestore error: ${error.message}` });
            setReportData(null);
        }

        setLoading(false);
    }
    
    const handleDownloadPdf = async () => {
        if (!reportRef.current) return;

        try {
            const dataUrl = await toPng(reportRef.current, { cacheBust: true, pixelRatio: 2 });
            const { jsPDF } = await import("jspdf");
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [1080, 1920] // A common screen dimension for better viewing on mobile
            });
             const imgProps= pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Daily_Digest_${format(dateRange?.from || new Date(), 'yyyy-MM-dd')}.pdf`);
        } catch (error) {
            console.error("Failed to download PDF", error);
            toast.error("Download Failed", { description: "Could not generate PDF." });
        }
    };
    
    const handleShareToWhatsApp = () => {
        if (!reportData || !dateRange?.from) return;

        const dateString = format(dateRange.from, 'do MMM, yyyy');
        
        const summaryText = `*📈 Daily Digest: ${dateString}*\n\n` +
            `*Revenue:* ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(reportData.totalRevenue)}\n` +
            `*Total Bookings:* ${reportData.totalBookings}\n` +
            `  - Passenger Trips: ${reportData.passengerTrips}\n` +
            `  - Charter Hires: ${reportData.charterHires}\n` +
            `*New Users:* ${reportData.newUsers.length}\n\n` +
            `Full report is attached.`;
            
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;
        window.open(whatsappUrl, '_blank');
    }
    
    const setDatePreset = (preset: 'today' | 'yesterday' | 'last7days') => {
        const today = new Date();
        if (preset === 'today') setDateRange({ from: today, to: today });
        if (preset === 'yesterday') {
            const yesterday = subDays(today, 1);
            setDateRange({ from: yesterday, to: yesterday });
        }
        if (preset === 'last7days') setDateRange({ from: subDays(today, 7), to: today });
    }

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <header className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b border-border/50 print:hidden">
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Daily Digest Report</h1>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={!reportData}>
                        <Printer className="mr-2 h-4 w-4"/>
                        Export PDF
                    </Button>
                    <AdminHelp page="report" />
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Generate Report</CardTitle>
                        <CardDescription>Select a date range to generate a daily digest.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Select onValueChange={(value) => setDatePreset(value as any)}>
                                <SelectTrigger className="md:col-span-1"><SelectValue placeholder="Select a preset..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="yesterday">Yesterday</SelectItem>
                                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("md:col-span-2 w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="range" selected={dateRange} onSelect={(range) => { setDateRange(range); setIsPickerOpen(false); }} />
                                </PopoverContent>
                            </Popover>
                            <Button onClick={handleGenerateReport} disabled={loading} className="md:col-span-1 h-10">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BarChart className="mr-2 h-4 w-4" />}
                                Generate Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {reportData && (
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <div>
                                <CardTitle>Report Results</CardTitle>
                                <CardDescription>Summary for the selected period.</CardDescription>
                            </div>
                            <Button onClick={handleShareToWhatsApp} size="sm" variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                                <Share2 className="mr-2 h-4 w-4"/> Share via WhatsApp
                            </Button>
                        </CardHeader>
                        <CardContent>
                             <ReportTemplate ref={reportRef} reportData={reportData} dateRange={dateRange} />
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}
