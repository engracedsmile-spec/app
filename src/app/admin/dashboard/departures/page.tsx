
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MoreHorizontal, Edit, Trash2, CalendarPlus, Route as RouteIcon, User as UserIcon, Bus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { collection, query, orderBy, doc, deleteDoc, writeBatch, onSnapshot, getDoc } from 'firebase/firestore';
import { useAuth } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import type { Route, Terminal, User, ScheduledTrip, Vehicle } from "@/lib/data";
import { AdminHelp } from "../help";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { SubHeader } from "@/components/sub-header";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePreloader } from "@/context/preloader-context";


export default function DeparturesPage() {
    const router = useRouter();
    const isMobile = useIsMobile();
    const { showPreloader } = usePreloader();
    const [departures, setDepartures] = useState<ScheduledTrip[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const firestore = useAuth().firestore;
    const [departureToDelete, setDepartureToDelete] = useState<ScheduledTrip | null>(null);

    useEffect(() => {
        const unsubscribes: (() => void)[] = [];
        setLoading(true);

        const qDepartures = query(collection(firestore, 'scheduledTrips'), orderBy("departureDate", "desc"));
        unsubscribes.push(onSnapshot(qDepartures, (snapshot) => {
            setDepartures(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduledTrip)));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching departures:", error);
            toast.error("Failed to load departures.");
            setLoading(false);
        }));

        const qVehicles = query(collection(firestore, 'vehicles'));
        unsubscribes.push(onSnapshot(qVehicles, (snapshot) => {
            setVehicles(snapshot.docs.map(doc => ({id: doc.id, ...doc.data() } as Vehicle)));
        }));
        
        return () => unsubscribes.forEach(unsub => unsub());
    }, [firestore]);
    
    const handleViewDeparture = (id: string) => {
        showPreloader();
        router.push(`/admin/dashboard/departures/${id}`);
    }

    const handleDelete = async () => {
        if (!departureToDelete) {
            toast.error("No departure selected for deletion.");
            return;
        }
        const docRef = doc(firestore, 'scheduledTrips', departureToDelete.id);
        try {
            await deleteDoc(docRef);
            toast.success("Departure deleted successfully");
            setDepartureToDelete(null);
        } catch(e) {
            toast.error("Failed to delete departure");
            console.error("Error deleting departure:", e);
        }
    }
    
    const DepartureCard = ({ dep }: { dep: ScheduledTrip }) => (
        <Card className="hover:border-primary/50 cursor-pointer" onClick={() => handleViewDeparture(dep.id)}>
             <CardContent className="p-4 space-y-3">
                 <div className="flex justify-between items-start">
                     <div>
                          <p className="font-bold">{dep.routeName}</p>
                          <p className="text-sm text-muted-foreground">{new Date(dep.departureDate).toLocaleDateString()} - {dep.departurePeriod}</p>
                     </div>
                     <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}><MoreHorizontal /></Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent onClick={e => e.stopPropagation()}>
                             <DropdownMenuItem asChild>
                                 <Link href={`/admin/dashboard/departures/edit/${dep.id}`}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                 </Link>
                             </DropdownMenuItem>
                             <DropdownMenuItem className="text-destructive" onSelect={() => setDepartureToDelete(dep)}>
                                 <Trash2 className="mr-2 h-4 w-4" /> Delete
                             </DropdownMenuItem>
                         </DropdownMenuContent>
                     </DropdownMenu>
                 </div>
                 <div className="flex justify-between items-center text-sm pt-2 border-t">
                     <p className="flex items-center gap-1.5"><UserIcon className="h-4 w-4 text-muted-foreground"/> {dep.driverName}</p>
                     <p className="flex items-center gap-1.5"><Bus className="h-4 w-4 text-muted-foreground"/> {dep.bookedSeats.length} / {vehicles.find(v => v.id === dep.vehicleId)?.seats || 7}</p>
                     <p className="font-semibold">{dep.status}</p>
                 </div>
             </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col h-full">
            <SubHeader title="Departures">
                 <div className="flex items-center gap-2">
                     <Button asChild size={isMobile ? 'icon' : 'default'}>
                        <Link href="/admin/dashboard/departures/create">
                            <Plus className={cn(!isMobile && "mr-2", "h-4 w-4")} /> 
                            <span className="hidden md:inline">Schedule Departure</span>
                        </Link>
                     </Button>
                     <AdminHelp page="departures" />
                 </div>
            </SubHeader>

            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Scheduled Departures</CardTitle>
                        <CardDescription>View, create, and manage all upcoming and past vehicle departures.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {isMobile ? (
                            <div className="space-y-4">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                         <Skeleton key={`skeleton-card-${i}`} className="h-32 w-full" />
                                     ))
                                ) : departures.length > 0 ? (
                                     departures.map((dep: ScheduledTrip) => (
                                        <DepartureCard key={dep.id} dep={dep} />
                                     ))
                                ) : (
                                     <p className="text-center text-muted-foreground py-12">No departures scheduled yet.</p>
                                )}
                            </div>
                       ) : (
                            <Table>
                                 <TableHeader>
                                     <TableRow>
                                         <TableHead>Route</TableHead>
                                         <TableHead>Driver</TableHead>
                                         <TableHead>Departure</TableHead>
                                         <TableHead>Status</TableHead>
                                         <TableHead>Booked Seats</TableHead>
                                         <TableHead className="text-right">Actions</TableHead>
                                     </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                     {loading ? (
                                         Array.from({ length: 5 }).map((_, i) => (
                                              <TableRow key={`skeleton-row-${i}`}>
                                                  <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                                  <TableCell><Skeleton className="h-6 w-4/5" /></TableCell>
                                                  <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                                  <TableCell><Skeleton className="h-6 w-3/5" /></TableCell>
                                                  <TableCell><Skeleton className="h-6 w-1/2" /></TableCell>
                                                  <TableCell className="text-right"><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
                                              </TableRow>
                                          ))
                                     ) : departures.length > 0 ? (
                                          departures.map((dep: ScheduledTrip) => (
                                              <TableRow key={dep.id} onClick={() => handleViewDeparture(dep.id)} className="cursor-pointer">
                                                  <TableCell className="font-medium">{dep.routeName}</TableCell>
                                                  <TableCell>{dep.driverName}</TableCell>
                                                  <TableCell>{new Date(dep.departureDate).toLocaleDateString()} - {dep.departurePeriod}</TableCell>
                                                  <TableCell>{dep.status}</TableCell>
                                                  <TableCell>{dep.bookedSeats.length} / {vehicles.find(v => v.id === dep.vehicleId)?.seats || 7}</TableCell>
                                                  <TableCell className="text-right">
                                                       <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}><MoreHorizontal /></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent onClick={e => e.stopPropagation()}>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/dashboard/departures/edit/${dep.id}`}><Edit className="mr-2 h-4 w-4" /> Edit</Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive" onSelect={() => setDepartureToDelete(dep)}>
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                  </TableCell>
                                              </TableRow>
                                          ))
                                     ) : (
                                          <TableRow>
                                              <TableCell colSpan={6} className="text-center h-24">No departures scheduled yet.</TableCell>
                                          </TableRow>
                                      )}
                                 </TableBody>
                            </Table>
                       )}
                    </CardContent>
                </Card>
            </main>
            <AlertDialog open={!!departureToDelete} onOpenChange={(open) => !open && setDepartureToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this departure. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Yes, Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
