"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { RefreshCw, Loader2, Info, Car, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import type { User, ScheduledTrip, Route, Vehicle, Terminal } from "@/lib/data";
import { format, eachDayOfInterval, isAfter, parseISO } from "date-fns";
import { useAuth } from "@/firebase";
import { writeBatch, collection, doc, query, where, getDocs } from 'firebase/firestore';
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from 'uuid';
import { SubHeader } from "@/components/sub-header";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Preloader } from "@/components/preloader";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCollection } from "@/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";


const departureFormSchema = z.object({
    routeId: z.string().min(1, "Please select a route."),
    dateRange: z.object({
        from: z.date({ required_error: "A start date is required." }),
        to: z.date().optional(),
    }).refine(data => {
        if (data.from && data.to) {
            return !isAfter(data.from, data.to);
        }
        return true;
    }, {
        message: "The start date cannot be after the end date.",
        path: ["dateRange"],
    }),
    daysOfWeek: z.array(z.number()).min(1, "Please select at least one day of the week."),
    departurePeriod: z.enum(["Morning", "Evening", "Both"]),
    autoScheduleReturn: z.boolean().default(false),
    fare: z.coerce.number().min(0, "Fare must be a positive number.").optional(),
    lifecycle: z.enum(["recycle", "delete"]),
});

type DepartureFormSchema = z.infer<typeof departureFormSchema>;

export default function CreateDeparturePage() {
    const router = useRouter();
    const { firestore } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { data: routes, loading: loadingRoutes } = useCollection<Route>('routes');
    const { data: drivers, loading: loadingDrivers } = useCollection<User>('users', { queryConstraints: [where('userType', '==', 'driver')]});
    const { data: vehicles, loading: loadingVehicles } = useCollection<Vehicle>('vehicles');
    const { data: terminals, loading: loadingTerminals } = useCollection<Terminal>('terminals');

    const form = useForm<DepartureFormSchema>({
        resolver: zodResolver(departureFormSchema),
        defaultValues: { routeId: "", daysOfWeek: [0,1,2,3,4,5,6], departurePeriod: "Both", autoScheduleReturn: true, fare: undefined, lifecycle: 'recycle' }
    });
    
    const selectedRouteId = useWatch({ control: form.control, name: "routeId" });
    const selectedRoute = routes?.find(r => r.id === selectedRouteId);
    
    const passengerVehicles = useMemo(() => vehicles?.filter(v => v.status === 'Active' && (v.serviceType === 'passenger' || v.serviceType === 'all')) || [], [vehicles]);
    const activeDrivers = useMemo(() => drivers?.filter(d => ['Active', 'Online', 'Offline'].includes(d.status)) || [], [drivers]);


    const handleSwap = useCallback(() => {
        if (selectedRoute?.reverseRouteId) {
            const reverseRoute = routes?.find(r => r.id === selectedRoute.reverseRouteId);
            if (reverseRoute) {
                form.setValue("routeId", reverseRoute.id, { shouldValidate: true });
            } else {
                toast.info("No Reverse Route Found");
            }
        }
    }, [selectedRoute, routes, form]);

    const onSubmit = async (data: DepartureFormSchema) => {
        if (!firestore) return toast.error("Database not ready.");
        
        setIsSubmitting(true);
        const { dateRange, routeId, daysOfWeek, departurePeriod, autoScheduleReturn, fare, lifecycle } = data;
        
        const startDate = dateRange.from;
        const endDate = dateRange.to || dateRange.from;

        if (passengerVehicles.length === 0 || activeDrivers.length === 0) {
            toast.error("No active vehicles or drivers available to create schedules.");
            setIsSubmitting(false);
            return;
        }
        
        const selectedRouteData = routes?.find(r => r.id === routeId);
        if (!selectedRouteData) {
            toast.error("Invalid route selected.");
            setIsSubmitting(false);
            return;
        }

        const batch = writeBatch(firestore);
        const allDaysInRange = eachDayOfInterval({ start: startDate, end: endDate });
        const selectedDays = allDaysInRange.filter(day => daysOfWeek.includes(day.getDay()));

        if (selectedDays.length === 0) {
            toast.error("No valid days selected in the date range.");
            setIsSubmitting(false);
            return;
        }

        let departuresCreated = 0;
        const periodsToSchedule = departurePeriod === 'Both' ? ['Morning', 'Evening'] : [departurePeriod];

        const existingDeparturesSnap = await getDocs(query(collection(firestore, 'scheduledTrips'), where('departureDate', '>=', format(startDate, 'yyyy-MM-dd')), where('departureDate', '<=', format(endDate, 'yyyy-MM-dd'))));
        const existingDeparturesByDate: Record<string, ScheduledTrip[]> = {};
        existingDeparturesSnap.forEach(doc => {
            const trip = doc.data() as ScheduledTrip;
            if (!existingDeparturesByDate[trip.departureDate]) {
                existingDeparturesByDate[trip.departureDate] = [];
            }
            existingDeparturesByDate[trip.departureDate].push(trip);
        });

        for (const day of selectedDays) {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dailySchedule: ScheduledTrip[] = [...(existingDeparturesByDate[dateStr] || [])];

            const processTripsForRoute = (currentRoute: Route, periods: ('Morning' | 'Evening')[]) => {
                for (const period of periods) {
                    const tripAlreadyExists = dailySchedule.some(d => d.routeId === currentRoute.id && d.departurePeriod === period);
                    if (tripAlreadyExists) {
                        console.log(`Skipping existing trip for ${dateStr} - ${period}`);
                        continue; 
                    }

                    // Find available resources
                    const usedVehicleIds = new Set(dailySchedule.map(t => t.vehicleId));
                    const usedDriverIds = new Set(dailySchedule.map(t => t.driverId));

                    const assignedVehicle = passengerVehicles.find(v => !usedVehicleIds.has(v.id));
                    const assignedDriver = activeDrivers.find(d => !usedDriverIds.has(d.id));

                    if (assignedVehicle && assignedDriver) {
                         const newTripId = uuidv4();
                         const newTripRef = doc(firestore, 'scheduledTrips', newTripId);
                         const newTripData: ScheduledTrip = {
                            id: newTripId,
                            routeId: currentRoute.id,
                            routeName: currentRoute.name,
                            originTerminalId: currentRoute.originTerminalId,
                            destinationTerminalId: currentRoute.destinationTerminalId,
                            driverId: assignedDriver.id,
                            driverName: assignedDriver.name,
                            vehicleId: assignedVehicle.id,
                            departureDate: dateStr,
                            departurePeriod: period,
            status: 'Scheduled',
            bookedSeats: [],
                            passengers: [],
                            fare: fare || currentRoute.baseFare,
                            seatHolds: {},
                            lifecycle: lifecycle,
                         };
                         batch.set(newTripRef, newTripData);
                         dailySchedule.push(newTripData); // Add to in-memory schedule for this day
                         departuresCreated++;
                    } else {
                         console.warn(`Could not find available vehicle/driver for ${dateStr} - ${period}`);
                    }
                }
            }

            // Process outbound trips
            processTripsForRoute(selectedRouteData, periodsToSchedule);
            
            // Process return trips if enabled
            if (autoScheduleReturn && selectedRouteData.reverseRouteId) {
                const reverseRoute = routes?.find(r => r.id === selectedRouteData.reverseRouteId);
            if (reverseRoute) {
                    const returnPeriods = periodsToSchedule.map(p => p === 'Morning' ? 'Evening' : 'Morning') as ('Morning' | 'Evening')[];
                    processTripsForRoute(reverseRoute, returnPeriods);
                }
            }
        }
        
        if (departuresCreated === 0) {
            toast.info("No New Departures Created", { description: "All available slots may be filled, or no resources were free for the selected dates." });
            setIsSubmitting(false);
            return;
        }
        
        try {
            await batch.commit();
            toast.success(`${departuresCreated} Departures Scheduled`, {
                 description: `Successfully created trips for the selected date range.`
            });
            router.push('/admin/dashboard/departures');
        } catch (error: any) {
            toast.error("Failed to schedule departures.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loadingRoutes || loadingDrivers || loadingVehicles || loadingTerminals) {
        return <Preloader />;
    }

    return (
        <div className="flex flex-col h-full">
            <SubHeader title="Schedule Departures">
                <Button type="submit" form="create-departure-form" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Generate Schedules"}
                </Button>
            </SubHeader>
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                 <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>How Batch Scheduling Works</AlertTitle>
                    <AlertDescription>
                        This tool creates trips for each selected day within your date range. It automatically cycles through available vehicles and drivers to prevent daily conflicts.
                    </AlertDescription>
                </Alert>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Passenger Vehicles</CardTitle>
                            <Car className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{passengerVehicles.length}</div>
                            {passengerVehicles.length === 0 && <Link href="/admin/dashboard/settings/vehicles" className="text-xs text-primary hover:underline">Add or activate vehicles</Link>}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeDrivers.length}</div>
                             {activeDrivers.length === 0 && <Link href="/admin/dashboard/drivers" className="text-xs text-primary hover:underline">Add or activate drivers</Link>}
                        </CardContent>
                    </Card>
                </div>
                <Card className="max-w-2xl mx-auto mt-6">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form id="create-departure-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField control={form.control} name="routeId" render={({ field }) => (
                                <FormItem>
                                    <div className="flex justify-between items-center">
                                        <FormLabel>Route</FormLabel>
                                        <Button asChild variant="link" size="sm" className="p-0 h-auto"><Link href="/admin/dashboard/settings/routes">Manage Routes</Link></Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a route"/></SelectTrigger></FormControl>
                                                <SelectContent>{routes?.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Button type="button" variant="outline" size="icon" onClick={handleSwap} disabled={!selectedRoute?.reverseRouteId}><RefreshCw className="h-4 w-4"/></Button>
                                    </div>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                                <FormField control={form.control} name="dateRange" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date Range</FormLabel>
                                        <DatePickerWithRange date={field.value} onDateChange={field.onChange} />
                                        <FormMessage/>
                                    </FormItem>
                                )}/>

                                <FormField control={form.control} name="daysOfWeek" render={() => (
                                    <FormItem>
                                         <FormLabel>Days of the Week</FormLabel>
                                         <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                             {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                                                 <FormField key={index} control={form.control} name="daysOfWeek" render={({ field }) => (
                                                      <FormItem className="flex items-center gap-2 space-y-0 p-2 rounded-md bg-muted/50 border">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(index)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, index])
                                                                        : field.onChange(field.value?.filter((value) => value !== index))
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{day}</FormLabel>
                                                    </FormItem>
                                                 )} />
                                             ))}
                                         </div>
                                        <FormMessage/>
                                    </FormItem>
                                )} />
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <FormField control={form.control} name="departurePeriod" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Departure Period</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="h-12"><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Both">Both (Morning & Evening)</SelectItem>
                                                    <SelectItem value="Morning">Morning Only</SelectItem>
                                                    <SelectItem value="Evening">Evening Only</SelectItem>
                                                </SelectContent>
                                        </Select>
                                        <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="fare" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custom Fare (₦)</FormLabel>
                                    <FormControl><Input type="number" placeholder="Leave blank to use route base fare" {...field}/></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                                </div>
                                <FormField control={form.control} name="autoScheduleReturn" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/50">
                                    <div className="space-y-0.5">
                                            <FormLabel>Auto-schedule return trips</FormLabel>
                                            <FormDescription className="text-xs">
                                                If a reverse route exists, automatically schedule return trips for the same day.
                                            </FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={!selectedRoute?.reverseRouteId} /></FormControl>
                                </FormItem>
                            )}/>
                                <FormField control={form.control} name="lifecycle" render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Lifecycle Policy</FormLabel>
                                        <FormDescription>Choose what happens to trips after they are completed.</FormDescription>
                                        <FormControl>
                                            <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                            >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                <RadioGroupItem value="recycle" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                Recycle: Automatically re-schedule for the next available day.
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                <RadioGroupItem value="delete" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                Delete: Automatically delete the trip record after completion.
                                                </FormLabel>
                                            </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
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