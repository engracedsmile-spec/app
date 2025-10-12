
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Status, UserStatus, Shipment } from "@/lib/data";
import { ArrowLeft, Car, DollarSign, Star, Package, UserX, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getFirestore, doc, getDoc, updateDoc, collection, where, query, getDocs } from 'firebase/firestore';
import firebaseApp from "@/firebase/config";

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const StatusBadge = ({ status }: { status: Status }) => {
    const variants: Record<Status, string> = {
        'On Progress': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Delayed': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
        'Delivered': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Pending': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        'Completed': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Boarding': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        'In Transit': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return <Badge variant="outline" className={`text-xs font-medium border-0 ${variants[status]}`}>{status}</Badge>;
};

const DriverStatusBadge = ({ status }: { status: UserStatus }) => {
    const variants: Record<UserStatus, string> = {
        'Active': 'text-green-500 border-green-500/50 bg-green-500/10',
        'Online': 'text-green-500 border-green-500/50 bg-green-500/10',
        'Offline': 'text-muted-foreground border-border bg-card',
        'Inactive': 'text-muted-foreground border-border bg-card',
        'Suspended': 'text-red-500 border-red-500/50 bg-red-500/10',
    };
    return <Badge variant="outline" className={variants[status]}>{status}</Badge>;
};

export default function DriverDetailPage() {
    const router = useRouter();
    const params = useParams();
    const driverId = params.id as string;

    const [driver, setDriver] = useState<User | null>(null);
    const [driverShipments, setDriverShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!driverId) return;

        const fetchDriverData = async () => {
            setLoading(true);
            const db = getFirestore(firebaseApp);
            const driverRef = doc(db, "users", driverId);
            const driverSnap = await getDoc(driverRef);

            if (driverSnap.exists()) {
                const driverData = { id: driverSnap.id, ...driverSnap.data() } as User;
                setDriver(driverData);

                const shipmentsRef = collection(db, "shipments");
                const q = query(shipmentsRef, where("driver.id", "==", driverId));
                const shipmentsSnap = await getDocs(q);
                const shipmentsList = shipmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment));
                setDriverShipments(shipmentsList);

            } else {
                toast.error("Error", { description: "Driver not found." });
            }
            setLoading(false);
        };

        fetchDriverData();
    }, [driverId]);

    const handleSuspend = async () => {
        if (!driver) return;
        const db = getFirestore(firebaseApp);
        const driverRef = doc(db, 'users', driver.id);
        await updateDoc(driverRef, { status: 'Suspended' });
        setDriver(prev => prev ? { ...prev, status: 'Suspended' } : null);
        toast.success("Driver Suspended", {
            description: `${driver.name}'s account has been suspended.`,
        });
    };
    
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!driver) {
        return (
             <div className="flex flex-col h-full">
                <header className="flex items-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Driver Not Found</h1>
                </header>
                <main className="flex-1 flex items-center justify-center">
                    <p>Could not find details for this driver.</p>
                </main>
            </div>
        );
    }
    
    const totalEarnings = driverShipments.reduce((acc, trip) => acc + (trip.price || 0), 0);

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Driver Details</h1>
            </header>
            <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${driver.email}`} />
                            <AvatarFallback>{driver.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{driver.name}</CardTitle>
                            <div className="text-muted-foreground space-x-4">
                                <span>{driver.phone}</span>
                                <span>{driver.email}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <DriverStatusBadge status={driver.status} />
                         <p className="flex items-center gap-2 pt-2"><Car className="h-4 w-4 text-muted-foreground"/> {driver.vehicle}</p>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard title="Overall Rating" value={(Math.random() * (5 - 4) + 4).toFixed(1)} icon={Star} />
                    <StatCard title="Total Trips" value={driverShipments.length.toString()} icon={Package} />
                    <StatCard title="Total Earnings" value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalEarnings)} icon={DollarSign} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Trip History</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking ID</TableHead>
                                    <TableHead>Passenger</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {driverShipments.map((shipment) => (
                                    <TableRow key={shipment.id}>
                                        <TableCell className="font-mono text-xs">{shipment.id.slice(0, 10)}</TableCell>
                                        <TableCell>{shipment.passengerName}</TableCell>
                                        <TableCell><StatusBadge status={shipment.status} /></TableCell>
                                        <TableCell>{(shipment.createdAt as any).toDate().toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
             <footer className="p-4 border-t border-border/50">
                 <Button onClick={handleSuspend} variant="destructive" className="w-full h-12 text-base" disabled={driver.status === 'Suspended'}>
                    <UserX className="mr-2 h-5 w-5"/> Suspend Account
                </Button>
            </footer>
        </div>
    );
}

    