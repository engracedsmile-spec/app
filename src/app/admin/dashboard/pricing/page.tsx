
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Trash2, Edit, Route as RouteIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { v4 as uuidv4 } from 'uuid';
import type { PricingSettings, Route } from "@/lib/settings";
import { AdminHelp } from "../help";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { nigeriaData } from "@/lib/nigeria-data";
import { Switch } from "@/components/ui/switch";
import { SwapIcon } from "@/components/icons/swap-icon";

const routeSchema = z.object({
  id: z.string(),
  from: z.string().min(1, "Please select a departure state."),
  to: z.string().min(1, "Please select a destination state."),
  price: z.coerce.number().min(1, "Base price must be a positive number."),
  isDefault: z.boolean().optional(),
}).refine(data => data.from !== data.to, {
    message: "Departure and destination states cannot be the same.",
    path: ["to"],
});


const AddEditRouteDialog = ({ onComplete, existingRoutes, routeToEdit, children }: { onComplete: () => void, existingRoutes: Route[], routeToEdit?: Route, children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const isEditMode = !!routeToEdit;

    const form = useForm<z.infer<typeof routeSchema>>({
        resolver: zodResolver(routeSchema),
        defaultValues: routeToEdit || { id: uuidv4(), from: "", to: "", price: 0, isDefault: false }
    });
    
     useEffect(() => {
        if (open) {
             if (routeToEdit) {
                form.reset(routeToEdit);
            } else {
                form.reset({ id: uuidv4(), from: "", to: "", price: 0, isDefault: false });
            }
        }
    }, [routeToEdit, form, open]);

    const handleSwap = () => {
        const from = form.getValues('from');
        const to = form.getValues('to');
        form.setValue('from', to);
        form.setValue('to', from);
    }

    const onSubmit = (data: z.infer<typeof routeSchema>) => {
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, 'settings', 'pricing');
        
        let newRoutes: Route[];

        if (data.isDefault) {
            newRoutes = existingRoutes.map(r => ({...r, isDefault: false}));
        } else {
            newRoutes = [...existingRoutes];
        }

        if (isEditMode) {
            const routeIndex = newRoutes.findIndex(r => r.id === data.id);
            if (routeIndex > -1) {
                newRoutes[routeIndex] = data;
            }
        } else {
            newRoutes.push(data);
        }

        const updateData = { routes: newRoutes };
        
        setDoc(docRef, updateData, { merge: true }).then(() => {
            toast.success(isEditMode ? "Route Updated" : "Route Created");
            onComplete();
            setOpen(false);
        }).catch(error => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: updateData });
            errorEmitter.emit('permission-error', permissionError);
        });
    }

    const states = nigeriaData.map(s => s.state).sort();

    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen} trigger={children}>
            <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit" : "Add"} Route</DialogTitle>
                <DialogDescription>Define a travel route between two states and set the fare.</DialogDescription>
            </DialogHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex-1">
                             <FormField control={form.control} name="from" render={({ field }) => (
                                <FormItem><FormLabel>From</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger></FormControl><SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <div className="pt-6">
                            <Button type="button" variant="outline" size="icon" onClick={handleSwap}><SwapIcon/></Button>
                        </div>
                        <div className="flex-1">
                             <FormField control={form.control} name="to" render={({ field }) => (
                                <FormItem><FormLabel>To</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger></FormControl><SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </div>
                     <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price (₦)</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g. 25000" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField
                        control={form.control}
                        name="isDefault"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div>
                                    <FormLabel htmlFor="is-default-switch" className="font-semibold">Set as Default Route</FormLabel>
                                    <p className="text-xs text-muted-foreground">This will be the pre-selected route for new bookings.</p>
                                </div>
                                <FormControl>
                                    <Switch id="is-default-switch" checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit">{isEditMode ? "Save Changes" : "Create Route"}</Button>
                    </DialogFooter>
                </form>
            </Form>
        </ResponsiveDialog>
    )
}

export default function PricingSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [pricingSettings, setPricingSettings] = useState<PricingSettings>({ routes: [], charterRates: [] });

    const fetchData = async () => {
        setLoading(true);
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, "settings", "pricing");
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPricingSettings(docSnap.data() as PricingSettings);
            }
        } catch (error) {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
            toast.error("Permission Denied", { description: "You don't have access to these settings."});
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteRoute = async (routeId: string) => {
        const updatedRoutes = pricingSettings.routes.filter(route => route.id !== routeId);
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, 'settings', 'pricing');
        const updateData = { ...pricingSettings, routes: updatedRoutes };
        try {
            await setDoc(docRef, updateData, { merge: true });
            toast.success("Route Deleted", { description: "The route has been removed." });
            fetchData();
        } catch (error) {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: updateData });
            errorEmitter.emit('permission-error', permissionError);
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                 <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Route Pricing</h1>
                </div>
                 <div className="flex items-center gap-2">
                    <AddEditRouteDialog onComplete={fetchData} existingRoutes={pricingSettings.routes || []}>
                       <Button><Plus className="mr-2 h-4 w-4" /> Add New Route</Button>
                    </AddEditRouteDialog>
                    <AdminHelp page="pricing" />
                 </div>
            </header>
            <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Service Routes & Fares</CardTitle>
                        <CardDescription>Define your operational routes and set a base price for trips.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pricingSettings.routes && pricingSettings.routes.map(route => (
                           <div key={route.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                               <div className="flex-1">
                                   <p className="font-bold flex items-center gap-2">{route.from} <RouteIcon className="h-4 w-4 text-muted-foreground"/> {route.to}</p>
                                    {route.isDefault && <span className="text-xs font-semibold text-primary">(Default)</span>}
                               </div>
                               <div className="text-lg font-bold text-primary">
                                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(route.price)}
                               </div>
                               <div className="flex items-center">
                                  <AddEditRouteDialog onComplete={fetchData} existingRoutes={pricingSettings.routes} routeToEdit={route}>
                                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>
                                  </AddEditRouteDialog>
                                   <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteRoute(route.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                   </Button>
                               </div>
                           </div>
                       ))}
                       {(!pricingSettings.routes || pricingSettings.routes.length === 0) && (
                           <p className="text-center text-muted-foreground py-8">No routes created yet. Click "Add New Route" to begin.</p>
                       )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
