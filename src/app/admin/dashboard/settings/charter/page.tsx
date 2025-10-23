
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, Car, ShieldCheck, GlassWater, PartyPopper, Wifi, Music, Zap, Cookie } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { CharterPackage } from "@/lib/data";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/firebase";

const packageSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Package name is too short."),
  description: z.string().min(10, "Description is too short."),
  basePrice: z.coerce.number().min(1, "Base price must be a positive number."),
  dailyRate: z.coerce.number().min(0, "Daily rate cannot be negative."),
  features: z.object({
    onboardWifi: z.boolean(),
    bottledWater: z.boolean(),
    snackPack: z.boolean(),
    securityEscort: z.boolean(),
    chargingPorts: z.boolean(),
    music: z.boolean(),
    customDecorations: z.boolean(),
  }),
});

const AddEditPackageDialog = ({ onComplete, existingPackages, packageToEdit, children }: { onComplete: () => void, existingPackages: CharterPackage[], packageToEdit?: CharterPackage, children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const isEditMode = !!packageToEdit;
    const { firestore } = useAuth();

    const defaultFeatures = {
        onboardWifi: true,
        bottledWater: true,
        snackPack: true,
        securityEscort: false,
        chargingPorts: true,
        music: true,
        customDecorations: false
    };

    const form = useForm<z.infer<typeof packageSchema>>({
        resolver: zodResolver(packageSchema),
        defaultValues: packageToEdit ? { ...packageToEdit, features: { ...defaultFeatures, ...packageToEdit.features } } : {
            id: uuidv4(),
            name: "",
            description: "",
            basePrice: 0,
            dailyRate: 0,
            features: defaultFeatures
        },
    });

    useEffect(() => {
        if(open) {
            const initialValues = packageToEdit ? { ...packageToEdit, features: { ...defaultFeatures, ...packageToEdit.features } } : {
                id: uuidv4(), name: "", description: "", basePrice: 0, dailyRate: 0,
                features: defaultFeatures
            };
            form.reset(initialValues);
        }
    }, [open, packageToEdit, form]);

    const onSubmit = (data: z.infer<typeof packageSchema>) => {
        
        let newPackages: CharterPackage[];
        if (isEditMode) {
            const index = existingPackages.findIndex(p => p.id === data.id);
            newPackages = [...existingPackages];
            newPackages[index] = data;
        } else {
            newPackages = [...existingPackages, data];
        }

        const docRef = doc(firestore, 'settings', 'charter');
        setDoc(docRef, { packages: newPackages }, { merge: true }).then(() => {
            toast.success(isEditMode ? "Package Updated" : "Package Created");
            onComplete();
            setOpen(false);
        }).catch(error => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: { packages: newPackages } });
            errorEmitter.emit('permission-error', permissionError);
        });
    }

    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen} trigger={children}>
            <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit" : "Create"} Charter Package</DialogTitle>
                <DialogDescription>Define a new tier for charter vehicle services.</DialogDescription>
            </DialogHeader>
            <div className="p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id={`charter-form-${packageToEdit?.id || 'new'}`} className="space-y-4 pt-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Package Name</FormLabel><FormControl><Input placeholder="e.g., Gold, Premium" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe what this package offers" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="basePrice" render={({ field }) => (<FormItem><FormLabel>Base Price (₦)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="dailyRate" render={({ field }) => (<FormItem><FormLabel>Daily Rate (₦)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="space-y-2 pt-2">
                             <FormLabel>Features</FormLabel>
                             <div className="grid grid-cols-2 gap-4">
                                 <FormField control={form.control} name="features.onboardWifi" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Onboard Wi-Fi</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                                 <FormField control={form.control} name="features.bottledWater" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Bottled Water</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                                 <FormField control={form.control} name="features.snackPack" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Snack Pack</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                                 <FormField control={form.control} name="features.securityEscort" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Security Escort</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                                 <FormField control={form.control} name="features.chargingPorts" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Charging Ports</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                                 <FormField control={form.control} name="features.music" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Music</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                                 <FormField control={form.control} name="features.customDecorations" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Custom Decorations</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                             </div>
                        </div>
                    </form>
                </Form>
            </div>
             <DialogFooter>
                <Button type="submit" form={`charter-form-${packageToEdit?.id || 'new'}`}>{isEditMode ? "Save Changes" : "Create Package"}</Button>
            </DialogFooter>
        </ResponsiveDialog>
    )
}

const FeatureIcon = ({ feature, active }: { feature: string, active: boolean }) => {
    const icons: { [key: string]: React.ElementType } = {
        onboardWifi: Wifi,
        bottledWater: GlassWater,
        snackPack: Cookie,
        securityEscort: ShieldCheck,
        chargingPorts: Zap,
        music: Music,
        customDecorations: PartyPopper,
    }
    const labels: { [key: string]: string } = {
        onboardWifi: "WiFi",
        bottledWater: "Water",
        snackPack: "Snacks",
        securityEscort: "Security",
        chargingPorts: "Charging",
        music: "Music",
        customDecorations: "Decor"
    }

    const Icon = icons[feature];
    if (!Icon || !active) return null;

    return (
        <div className="flex flex-col items-center gap-1" title={labels[feature]}>
           <Icon className="h-5 w-5 text-primary"/>
           <span className="text-xs text-muted-foreground">{labels[feature]}</span>
        </div>
    )
}

export default function CharterSettingsPage() {
    const router = useRouter();
    const [packages, setPackages] = useState<CharterPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const { firestore } = useAuth();

    const fetchData = async () => {
        setLoading(true);
        const docRef = doc(firestore, 'settings', 'charter');
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().packages) {
                setPackages(docSnap.data().packages);
            }
        } catch (error) {
            toast.error("Error", { description: "Could not load charter packages." });
        }
        setLoading(false);
    }
    
    useEffect(() => { fetchData() }, []);
    
    const handleDelete = async (packageId: string) => {
        const newPackages = packages.filter(p => p.id !== packageId);
        const docRef = doc(firestore, 'settings', 'charter');
        await setDoc(docRef, { packages: newPackages });
        toast.success("Package Deleted");
        fetchData();
    }
    
    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                 <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Charter Packages</h1>
                </div>
                <AddEditPackageDialog onComplete={fetchData} existingPackages={packages}>
                    <Button><Plus className="mr-2 h-4 w-4" /> New Package</Button>
                </AddEditPackageDialog>
            </header>
            <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                 {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                ) : packages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map(pkg => (
                            <Card key={pkg.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-start">
                                        {pkg.name}
                                        <div className="flex items-center gap-1">
                                            <AddEditPackageDialog onComplete={fetchData} existingPackages={packages} packageToEdit={pkg}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                                            </AddEditPackageDialog>
                                             <ResponsiveDialog>
                                                <AlertDialogTrigger asChild>
                                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                </AlertDialogTrigger>
                                                <DialogHeader>
                                                    <DialogTitle>Are you sure?</DialogTitle>
                                                    <DialogDescription>This will permanently delete the "{pkg.name}" package.</DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(pkg.id)}>Delete</AlertDialogAction>
                                                </DialogFooter>
                                            </ResponsiveDialog>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>{pkg.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <p><span className="font-bold text-lg">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN'}).format(pkg.basePrice)}</span> <span className="text-muted-foreground">base fare</span></p>
                                        <p><span className="font-bold text-lg">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN'}).format(pkg.dailyRate)}</span> <span className="text-muted-foreground">per day</span></p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t">
                                        <h4 className="font-semibold text-sm mb-2">Included Features:</h4>
                                        <div className="flex items-center justify-around gap-4 flex-wrap">
                                            {Object.entries(pkg.features).map(([key, value]) => (
                                                <FeatureIcon key={key} feature={key} active={value} />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Car className="h-16 w-16 mx-auto text-primary/20"/>
                        <p className="text-lg font-semibold mt-4">No Charter Packages Found</p>
                        <p className="mt-1">Click "New Package" to create your first charter service tier.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
