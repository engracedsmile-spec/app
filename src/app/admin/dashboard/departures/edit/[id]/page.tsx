
"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { User, ScheduledTrip, Route, Vehicle, Terminal } from "@/lib/data";
import { format } from "date-fns";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useFirestore } from "@/firebase";
import { doc, setDoc, collection, onSnapshot, query, orderBy, where, writeBatch, getDoc } from 'firebase/firestore';
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from 'uuid';
import { SubHeader } from "@/components/sub-header";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Preloader } from "@/components/preloader";

const departureFormSchema = z.object({
    routeId: z.string().min(1, "Please select a route."),
    vehicleId: z.string().min(1, "Please select a vehicle."),
    driverId: z.string().min(1, "A driver must be assigned to the trip."),
    departurePeriod: z.enum(["Morning", "Evening"]),
    departureDate: z.date({ required_error: "A departure date is required." }),
    fare: z.coerce.number().min(0, "Fare must be a positive number.").optional(),
});

type DepartureFormSchema = z.infer<typeof departureFormSchema>;

export default function EditDeparturePage() {
    const router = useRouter();
    const params = useParams();
    const departureId = params.id as string;

    const [routes, setRoutes] = useState<Route[]>([]);
    const [drivers, setDrivers] = useState<User[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [existingDepartures, setExistingDepartures] = useState<ScheduledTrip[]>([]);
    const [editingDeparture, setEditingDeparture] = useState<ScheduledTrip | null>(null);
    const [loading, setLoading] = useState(true);
    const firestore = useFirestore();

    const form = useForm<DepartureFormSchema>({
        resolver: zodResolver(departureFormSchema),
    });

    useEffect(() => {
        const unsubscribes: (() => void)[] = [];
        setLoading(true);

        const fetchData = async () => {
            unsubscribes.push(onSnapshot(doc(firestore, 'scheduledTrips', departureId), (docSnap) => {
                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() } as ScheduledTrip;
                    setEditingDeparture(data);
                }
            }));
            unsubscribes.push(onSnapshot(query(collection(firestore, 'routes')), (snapshot) => {
                const routesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route));
                console.log('Routes loaded:', routesData.length);
                setRoutes(routesData);
            }));
            unsubscribes.push(onSnapshot(query(collection(firestore, 'vehicles')), (snapshot) => setVehicles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle)))));
            unsubscribes.push(onSnapshot(query(collection(firestore, 'users'), where("userType", "==", "driver")), (snapshot) => setDrivers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)))));
            unsubscribes.push(onSnapshot(query(collection(firestore, 'scheduledTrips')), (snapshot) => setExistingDepartures(snapshot.docs.map(doc => doc.data() as ScheduledTrip))));
            setLoading(false);
        };

        fetchData();

        return () => unsubscribes.forEach(unsub => unsub());
    }, [firestore, departureId, form]);

    // Reset form when both routes and departure data are available (only once)
    const [formInitialized, setFormInitialized] = useState(false);
    useEffect(() => {
        if (editingDeparture && routes.length > 0 && !formInitialized) {
            form.reset({
                ...editingDeparture,
                departureDate: new Date(editingDeparture.departureDate),
            });
            setFormInitialized(true);
        }
    }, [editingDeparture, routes, form, formInitialized]);

    const { departureDate: selectedDate } = useWatch({ control: form.control });

    const availableVehicles = useMemo(() => {
        if (!existingDepartures || !selectedDate) return vehicles.filter(v => v.status === 'Active');
        
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        const assignedVehicleIds = existingDepartures
            .filter(d => d.departureDate === selectedDateStr && d.id !== departureId)
            .map(d => d.vehicleId);
        
        return vehicles.filter(v => v.status === 'Active' && !assignedVehicleIds.includes(v.id));
    }, [vehicles, existingDepartures, selectedDate, departureId]);


    const onSubmit = async (data: DepartureFormSchema) => {
        if (!editingDeparture) return;

        const mainRoute = routes.find(r => r.id === data.routeId);
        const selectedDriver = drivers.find(d => d.id === data.driverId);
        const selectedVehicle = vehicles.find(v => v.id === data.vehicleId);
        
        if (!mainRoute || !selectedDriver || !selectedVehicle) {
            toast.error("Invalid route, driver, or vehicle selected.");
            return;
        }

        const departureRef = doc(firestore, 'scheduledTrips', editingDeparture.id);
        
        // Only update the fields that have changed, preserve existing data
        const departureData = {
            ...editingDeparture, // Keep all existing data
            routeId: data.routeId,
            routeName: mainRoute.name,
            vehicleId: data.vehicleId,
            driverId: data.driverId,
            driverName: selectedDriver.name,
            departureDate: format(data.departureDate, 'yyyy-MM-dd'),
            departurePeriod: data.departurePeriod,
            fare: data.fare || mainRoute.baseFare,
        };

        try {
            await setDoc(departureRef, departureData, { merge: true });
            toast.success("Departure Updated");
            router.push('/admin/dashboard/departures');
        } catch (error: any) {
            const permissionError = new FirestorePermissionError({ path: departureRef.path, operation: 'update', requestResourceData: departureData as any });
            errorEmitter.emit('permission-error', permissionError);
            toast.error("Failed to update departure.");
        }
    };
    
    if (loading || !editingDeparture) {
        return <Preloader />;
    }

    return (
        <div className="flex flex-col h-full">
            <SubHeader title={`Edit: ${editingDeparture.routeName}`}>
                <Button type="submit" form="edit-departure-form" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </SubHeader>
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                <Card className="max-w-2xl mx-auto">
                    <CardContent className="p-4 md:p-6">
                        <Form {...form}>
                            <form id="edit-departure-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField control={form.control} name="routeId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Route</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a route"/></SelectTrigger></FormControl>
                                        <SelectContent>{routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="departureDate" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Departure Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className="h-12 justify-start font-normal">
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().toDateString())}/>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage/>
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="departurePeriod" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Departure Period</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="h-12"><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="Morning">Morning</SelectItem><SelectItem value="Evening">Evening</SelectItem></SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="vehicleId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vehicle</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select an available vehicle"/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {availableVehicles.length > 0 ? (
                                                availableVehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.make} {v.model} ({v.licensePlate})</SelectItem>)
                                            ) : (
                                                <p className="p-2 text-xs text-muted-foreground">No vehicles available for this date.</p>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="driverId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assigned Driver</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a driver"/></SelectTrigger></FormControl>
                                        <SelectContent>{drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="fare" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custom Fare (₦)</FormLabel>
                                    <FormControl><Input type="number" placeholder="Leave blank to use route base fare" {...field}/></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
