
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Edit, Car, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, orderBy, deleteDoc, where, writeBatch } from 'firebase/firestore';
import { useAuth } from "@/firebase";
import { v4 as uuidv4 } from 'uuid';
import type { User, Vehicle, WiFi } from "@/lib/data";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerBody, DrawerFooter, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SubHeader } from "@/components/sub-header";

const predefinedPasswords = [
    "22Hv4KOc", "4HNBzvgR", "qrfIQ8g0", "aMFl1R5G", "5sVYullW", 
    "koReJz7W", "qFzFcYgH", "qtJTwtqK"
];

function generatePassword(length = 8) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

const vehicleSchema = z.object({
  id: z.string(),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1990, "Year must be 1990 or later"),
  licensePlate: z.string().min(3, "License plate is required"),
  vin: z.string().optional().nullable(),
  status: z.enum(['Active', 'Maintenance', 'Inactive']),
  primaryDriverId: z.string().optional(),
  wifiId: z.string().optional(),
  wifiPassword: z.string().optional(),
});


const AddEditVehicleDialog = ({ onComplete, vehicleToEdit, drivers, wifiNetworks, children }: { onComplete: () => void, vehicleToEdit?: Vehicle, drivers: User[], wifiNetworks: WiFi[], children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const { firestore } = useAuth();
    const isEditMode = !!vehicleToEdit;

    const form = useForm<z.infer<typeof vehicleSchema>>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: vehicleToEdit || {
            id: uuidv4(),
            make: "Toyota",
            model: "Sienna",
            year: new Date().getFullYear(),
            licensePlate: "",
            status: 'Active',
            primaryDriverId: "",
            vin: null
        }
    });

    const licensePlate = form.watch('licensePlate');

    useEffect(() => {
        if (open) {
            if (isEditMode && vehicleToEdit) {
                 form.reset(vehicleToEdit);
            } else {
                const nextWifiNumber = wifiNetworks.length + 1;
                const wifiId = `SMILES-WIFI-${String(nextWifiNumber).padStart(4, '0')}`;
                
                const password = (nextWifiNumber - 1) < predefinedPasswords.length
                    ? predefinedPasswords[nextWifiNumber - 1]
                    : generatePassword(8);

                form.reset({
                    id: uuidv4(), make: "Toyota", model: "Sienna", year: new Date().getFullYear(),
                    licensePlate: "", status: 'Active', primaryDriverId: "",
                    wifiId: wifiId,
                    wifiPassword: password,
                    vin: null
                });
            }
        }
    }, [open, isEditMode, vehicleToEdit, wifiNetworks.length, form]);


    const onSubmit = async (data: z.infer<typeof vehicleSchema>) => {
        const batch = writeBatch(firestore);
        
        const vehicleRef = doc(firestore, 'vehicles', data.id);
        const vehicleData = { ...data, vin: data.vin || null };
        batch.set(vehicleRef, vehicleData, { merge: true });

        if(data.wifiId && data.wifiPassword) {
            const wifiRef = doc(firestore, 'wifi', data.wifiId);
            const wifiData: WiFi = {
                id: data.wifiId,
                name: data.wifiId,
                password: data.wifiPassword,
            };
            batch.set(wifiRef, wifiData, { merge: true });
        }
        
        try {
            await batch.commit();
            toast.success(isEditMode ? "Vehicle Updated" : "Vehicle Added");
            onComplete();
            setOpen(false);
        } catch (error) {
            console.error("Error saving vehicle and wifi:", error);
            toast.error("Failed to save data.");
        }
    }

    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen} trigger={children}>
             <DrawerHeader>
                <DrawerTitle>{isEditMode ? "Edit Vehicle" : "Add New Vehicle"}</DrawerTitle>
                <DrawerDescription>Manage the details for this vehicle in your fleet.</DrawerDescription>
            </DrawerHeader>
             <DrawerBody>
                <Form {...form}>
                    <form id={`vehicle-form-${vehicleToEdit?.id || 'new'}`} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="make" render={({ field }) => (<FormItem><FormLabel>Make</FormLabel><FormControl><Input placeholder="e.g. Toyota" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="model" render={({ field }) => (<FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="e.g. Sienna" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="year" render={({ field }) => (<FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" placeholder="e.g. 2018" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="licensePlate" render={({ field }) => (<FormItem><FormLabel>License Plate</FormLabel><FormControl><Input placeholder="e.g. ABC-123-XY" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                         <FormField control={form.control} name="vin" render={({ field }) => (<FormItem><FormLabel>VIN (Optional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name="wifiId" render={({ field }) => (<FormItem><FormLabel>Onboard WiFi SSID</FormLabel><FormControl><Input readOnly {...field} /></FormControl><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name="wifiPassword" render={({ field }) => (<FormItem><FormLabel>WiFi Password</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name="primaryDriverId" render={({ field }) => (<FormItem><FormLabel>Primary Driver</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Assign a driver" /></SelectTrigger></FormControl><SelectContent>{drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </form>
                </Form>
             </DrawerBody>
            <DrawerFooter>
                 <Button type="submit" form={`vehicle-form-${vehicleToEdit?.id || 'new'}`}>{isEditMode ? "Save Changes" : "Add Vehicle"}</Button>
            </DrawerFooter>
        </ResponsiveDialog>
    )
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<User[]>([]);
    const [wifiNetworks, setWifiNetworks] = useState<WiFi[]>([]);
    const [loading, setLoading] = useState(true);
    const { firestore } = useAuth();

    useEffect(() => {
        const unsubVehicles = onSnapshot(query(collection(firestore, 'vehicles'), orderBy('make')), (snapshot) => {
            setVehicles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle)));
            setLoading(false);
        });

        const unsubDrivers = onSnapshot(query(collection(firestore, 'users'), where('userType', '==', 'driver')), (snapshot) => {
            setDrivers(snapshot.docs.map(doc => doc.data() as User));
        });
        
        const unsubWifi = onSnapshot(collection(firestore, 'wifi'), (snapshot) => {
            setWifiNetworks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WiFi)));
        });

        return () => {
            unsubVehicles();
            unsubDrivers();
            unsubWifi();
        }
    }, [firestore]);
    
    const getDriverName = (driverId?: string | null) => drivers.find(d => d.id === driverId)?.name || <span className="text-muted-foreground">Unassigned</span>;
    
    const handleDelete = async (vehicleId: string, wifiId?: string | null) => {
        const batch = writeBatch(firestore);
        
        const vehicleRef = doc(firestore, 'vehicles', vehicleId);
        batch.delete(vehicleRef);

        if(wifiId) {
            const wifiRef = doc(firestore, 'wifi', wifiId);
            batch.delete(wifiRef);
        }
        
        try {
            await batch.commit();
            toast.success("Vehicle and associated WiFi removed");
        } catch (error) {
            toast.error("Failed to remove vehicle");
        }
    }

    return (
        <div className="flex flex-col h-dvh">
            <SubHeader title="Vehicle Management">
                <AddEditVehicleDialog onComplete={() => {}} drivers={drivers} wifiNetworks={wifiNetworks}>
                    <Button><Plus className="mr-2 h-4 w-4" /> Add Vehicle</Button>
                </AddEditVehicleDialog>
            </SubHeader>
             <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Fleet Overview</CardTitle>
                        <CardDescription>Manage all vehicles in your fleet and assign drivers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>License Plate</TableHead>
                                    <TableHead>Primary Driver</TableHead>
                                    <TableHead>WiFi</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({length: 4}).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-12 w-full"/></TableCell></TableRow>
                                )) : vehicles.length > 0 ? vehicles.map(vehicle => (
                                    <TableRow key={vehicle.id}>
                                        <TableCell>
                                            <p className="font-bold">{vehicle.make} {vehicle.model}</p>
                                            <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                                        </TableCell>
                                        <TableCell className="font-mono">{vehicle.licensePlate}</TableCell>
                                        <TableCell>{getDriverName(vehicle.primaryDriverId)}</TableCell>
                                        <TableCell>{vehicle.wifiId || "None"}</TableCell>
                                        <TableCell><Badge variant={vehicle.status === 'Active' ? 'default' : 'secondary'}>{vehicle.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal/></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <AddEditVehicleDialog onComplete={() => {}} vehicleToEdit={vehicle} drivers={drivers} wifiNetworks={wifiNetworks}>
                                                       <DropdownMenuItem onSelect={e => e.preventDefault()}>Edit</DropdownMenuItem>
                                                    </AddEditVehicleDialog>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive" onSelect={e => e.preventDefault()}>Delete</DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently delete the vehicle and its associated WiFi credentials. This action cannot be undone.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(vehicle.id, vehicle.wifiId)}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={6} className="text-center h-24">No vehicles added yet.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
             </main>
        </div>
    )
}
