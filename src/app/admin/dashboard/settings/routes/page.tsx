
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MoreHorizontal, Edit, Trash2, CalendarPlus, Route as RouteIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, doc, deleteDoc, writeBatch, onSnapshot, getDoc } from 'firebase/firestore';
import { useAuth } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import type { Route, Terminal } from "@/lib/data";
import { AdminHelp } from "../../help";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerBody } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from 'uuid';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SubHeader } from "@/components/sub-header";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePreloader } from "@/context/preloader-context";


const routeSchema = z.object({
    id: z.string(),
    name: z.string().min(3, "Route name is required."),
    originTerminalId: z.string().min(1, "Please select an origin terminal."),
    destinationTerminalId: z.string().min(1, "Please select a destination terminal."),
    baseFare: z.coerce.number().min(1, "Base fare must be a positive number."),
    estimatedDuration: z.string().optional(),
    createReverse: z.boolean().optional(),
    reverseRouteId: z.string().optional(),
}).refine(data => data.originTerminalId !== data.destinationTerminalId, {
    message: "Origin and destination terminals cannot be the same.",
    path: ["destinationTerminalId"],
});


const AddEditRouteDialog = ({ onComplete, terminals, routes, routeToEdit, open, onOpenChange }: { onComplete: () => void, terminals: Terminal[], routes: Route[], routeToEdit?: Route, open: boolean, onOpenChange: (open: boolean) => void }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { firestore } = useAuth();
    const isEditMode = !!routeToEdit;

    const form = useForm<z.infer<typeof routeSchema>>({
        resolver: zodResolver(routeSchema),
        defaultValues: { id: uuidv4(), name: "", originTerminalId: "", destinationTerminalId: "", baseFare: 0, estimatedDuration: "", createReverse: true, reverseRouteId: "" }
    });

    useEffect(() => {
        if (open) {
            const defaultValues = routeToEdit
                ? { ...routeToEdit, createReverse: false }
                : { id: uuidv4(), name: "", originTerminalId: "", destinationTerminalId: "", baseFare: 0, estimatedDuration: "", createReverse: true, reverseRouteId: "" };
            form.reset(defaultValues);
        }
    }, [open, routeToEdit, form]);
    
    const originId = useWatch({ control: form.control, name: "originTerminalId" });
    const destinationId = useWatch({ control: form.control, name: "destinationTerminalId" });

     useEffect(() => {
        if (originId && destinationId) {
            const originTerminal = terminals.find(t => t.id === originId);
            const destTerminal = terminals.find(t => t.id === destinationId);
            if (originTerminal && destTerminal) {
                 const currentName = form.getValues('name');
                const generatedName = `${originTerminal.name} -> ${destTerminal.name}`;
                 if (!currentName || currentName.includes(' -> ')) {
                    form.setValue("name", generatedName);
                }
            }
        }
    }, [originId, destinationId, terminals, form]);

    const onSubmit = async (data: z.infer<typeof routeSchema>) => {
        setIsSubmitting(true);
        const batch = writeBatch(firestore);
        
        const mainRouteRef = doc(firestore, 'routes', data.id);
        const mainRouteData: Route = {
            id: data.id,
            name: data.name,
            originTerminalId: data.originTerminalId,
            destinationTerminalId: data.destinationTerminalId,
            baseFare: data.baseFare,
            estimatedDuration: data.estimatedDuration,
            reverseRouteId: data.reverseRouteId === "no_reverse" ? "" : data.reverseRouteId,
        };

        if (data.createReverse && !isEditMode) {
            const reverseRouteRef = doc(collection(firestore, 'routes'));
            const originTerminal = terminals.find(t => t.id === data.originTerminalId);
            const destTerminal = terminals.find(t => t.id === data.destinationTerminalId);

            if(originTerminal && destTerminal) {
                const reverseRouteData: Route = {
                    id: reverseRouteRef.id,
                    name: `${destTerminal.name} -> ${originTerminal.name}`,
                    originTerminalId: data.destinationTerminalId,
                    destinationTerminalId: data.originTerminalId,
                    baseFare: data.baseFare,
                    estimatedDuration: data.estimatedDuration,
                    reverseRouteId: mainRouteRef.id,
                };
                batch.set(reverseRouteRef, reverseRouteData);
                mainRouteData.reverseRouteId = reverseRouteRef.id;
            }
        } 
        else if (isEditMode && data.reverseRouteId && data.reverseRouteId !== "no_reverse") {
            const reverseRouteRef = doc(firestore, 'routes', data.reverseRouteId);
            const reverseRouteDoc = await getDoc(reverseRouteRef);
            if(reverseRouteDoc.exists()) {
                batch.update(reverseRouteRef, { reverseRouteId: mainRouteData.id });
            }
        }
        
        batch.set(mainRouteRef, mainRouteData, { merge: true });

        try {
            await batch.commit();
            toast.success(isEditMode ? "Route Updated!" : `Route${data.createReverse ? 's' : ''} Created!`);
            onComplete();
        } catch (error) {
            console.error("Error saving route:", error);
            toast.error("Failed to save route.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
            <DrawerHeader>
                <DrawerTitle>{isEditMode ? "Edit" : "Create"} Route</DrawerTitle>
                <DrawerDescription>Define or update a travel route and its settings.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
               <Form {...form}>
                    <form id="route-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Route Name</FormLabel>
                                <FormControl><Input placeholder="e.g., Lagos (Jibowu) -> Abuja (Utako)" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="originTerminalId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>From (Origin)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a Terminal" /></SelectTrigger></FormControl>
                                        <SelectContent>{terminals.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="destinationTerminalId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To (Destination)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a Terminal" /></SelectTrigger></FormControl>
                                        <SelectContent>{terminals.map(t => <SelectItem key={t.id} value={t.id} disabled={t.id === originId}>{t.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="baseFare" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Base Fare (₦)</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g. 25000" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="estimatedDuration" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Est. Duration (Optional)</FormLabel>
                                <FormControl><Input placeholder="e.g. 5h 30m" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="reverseRouteId" render={({ field }) => (
                             <FormItem>
                                <FormLabel>Reverse Route (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Link to a reverse route" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="no_reverse">None</SelectItem>
                                        {routes.filter(r => r.id !== routeToEdit?.id).map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormDescription className="text-xs">Manually link this route to its reverse pair.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        {!isEditMode && (
                            <FormField control={form.control} name="createReverse" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Create reverse route</FormLabel>
                                        <FormDescription className="text-xs">Automatically create the return trip (e.g., B &rarr; A).</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )} />
                        )}
                    </form>
                </Form>
            </DrawerBody>
            <DrawerFooter>
                <Button type="submit" form="route-form" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (isEditMode ? "Save Changes" : "Create Route")}
                </Button>
            </DrawerFooter>
        </ResponsiveDialog>
    )
}

export default function RoutesPage() {
    const router = useRouter();
    const isMobile = useIsMobile();
    const { firestore } = useAuth();
    const [routes, setRoutes] = useState<Route[]>([]);
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Route | undefined>(undefined);
    const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);

    const fetchData = () => {
        const routesQuery = query(collection(firestore, 'routes'), orderBy("name"));
        const terminalsQuery = query(collection(firestore, 'terminals'));

        const unsubRoutes = onSnapshot(routesQuery, (snapshot) => {
            setRoutes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route)));
            setLoading(false);
        });
        
        const unsubTerminals = onSnapshot(terminalsQuery, (snapshot) => {
            const terms: Terminal[] = [];
            snapshot.forEach(doc => {
                terms.push({ id: doc.id, ...doc.data() } as Terminal);
            });
            setTerminals(terms);
        });

        return () => {
            unsubRoutes();
            unsubTerminals();
        }
    };

    useEffect(() => {
        if (firestore) {
            const cleanup = fetchData();
            return cleanup;
        }
    }, [firestore]);
    
    const handleDeleteRoute = async () => {
        if (!routeToDelete) return;
        try {
            const routeRef = doc(firestore, 'routes', routeToDelete.id);
            const routeDoc = await getDoc(routeRef);
            if (!routeDoc.exists()) {
                toast.error("Route not found.");
                return;
            }

            const batch = writeBatch(firestore);
            const routeData = routeDoc.data() as Route;
            
            batch.delete(routeRef);

            if (routeData.reverseRouteId) {
                const reverseRouteRef = doc(firestore, 'routes', routeData.reverseRouteId);
                const reverseRouteDoc = await getDoc(reverseRouteRef);
                if (reverseRouteDoc.exists()) {
                    batch.delete(reverseRouteRef);
                }
            }

            await batch.commit();
            toast.success("Route and its reverse pair deleted successfully.");
            setRouteToDelete(null);
        } catch (error) {
            toast.error("Failed to delete route.");
            console.error("Error deleting route: ", error);
        }
    };
    
    const handleOpenDialog = (route?: Route) => {
        setEditingRoute(route);
        setIsDialogOpen(true);
    }
    
    const RouteCard = ({ route }: { route: Route }) => (
        <Card className="hover:border-primary/50">
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold flex items-center gap-2">
                           <RouteIcon className="w-4 h-4 text-muted-foreground" />
                           {route.name}
                        </p>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem className="flex items-center gap-2" onSelect={() => handleOpenDialog(route)}>
                                <Edit className="w-4 h-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 text-destructive" onSelect={() => setRouteToDelete(route)}>
                                <Trash2 className="w-4 h-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t">
                    <p>Fare: <span className="font-semibold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(route.baseFare)}</span></p>
                    <p>Duration: <span className="font-semibold">{route.estimatedDuration || 'N/A'}</span></p>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col h-full">
            <SubHeader title="Route Management">
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size={isMobile ? 'icon' : 'sm'}>
                        <Link href="/admin/dashboard/departures">
                            <CalendarPlus className={cn(!isMobile && "mr-2", "h-4 w-4")} />
                            <span className="hidden md:inline">Schedule</span>
                        </Link>
                    </Button>
                    <Button size={isMobile ? 'icon' : 'sm'} onClick={() => handleOpenDialog()}>
                        <Plus className={cn(!isMobile && "mr-2", "h-4 w-4")} />
                        <span className="hidden md:inline">Create Route</span>
                    </Button>
                    <AdminHelp page="routes" />
                </div>
            </SubHeader>
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>All Service Routes</CardTitle>
                        <CardDescription>
                            Manage all travel corridors between your terminals. After creating a route, schedule a departure for it.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         {isMobile ? (
                            <div className="space-y-4">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={`skeleton-card-${i}`} className="h-32 w-full" />
                                    ))
                                ) : routes.length > 0 ? (
                                    routes.map((route: Route) => (
                                       <RouteCard key={route.id} route={route} />
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-12">No routes created yet.
                                         <Button variant="link" className="p-1 h-auto" onClick={() => handleOpenDialog()}>Create one</Button>.
                                    </p>
                                )}
                            </div>
                       ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Route Name</TableHead>
                                        <TableHead>Base Fare</TableHead>
                                        <TableHead>Est. Duration</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={4}>
                                                    <Skeleton className="h-10 w-full" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : routes.length > 0 ? (
                                        routes.map((route: Route) => (
                                            <TableRow key={route.id}>
                                                <TableCell className="font-medium flex items-center gap-2">
                                                    <RouteIcon className="w-4 h-4 text-muted-foreground" />
                                                    {route.name}
                                                </TableCell>
                                                <TableCell>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(route.baseFare)}</TableCell>
                                                <TableCell>{route.estimatedDuration || 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                     <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem className="flex items-center gap-2" onSelect={() => handleOpenDialog(route)}>
                                                                <Edit className="w-4 h-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="flex items-center gap-2 text-destructive" onSelect={() => setRouteToDelete(route)}>
                                                                <Trash2 className="w-4 h-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No routes created yet.
                                                <Button variant="link" className="p-1 h-auto" onClick={() => handleOpenDialog()}>Create one</Button>.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                       )}
                    </CardContent>
                </Card>
            </main>
            <AddEditRouteDialog 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen}
                onComplete={() => setIsDialogOpen(false)}
                terminals={terminals} 
                routes={routes}
                routeToEdit={editingRoute}
            />
            <AlertDialog open={!!routeToDelete} onOpenChange={(open) => !open && setRouteToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action will permanently delete the route. It will not affect past trips, but you won't be able to schedule new ones on it.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleDeleteRoute}>Yes, delete</AlertDialogAction>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
