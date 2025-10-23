
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Edit, Trash2, BadgePercent, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, deleteDoc, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';
import type { Promotion, CharterPackage } from "@/lib/data";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

const promotionSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "Title is too short."),
  description: z.string().min(10, "Description is too short."),
  imageUrl: z.string().url("Please enter a valid image URL."),
  href: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  code: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().min(0, "Discount value must be positive."),
  applicableTo: z.enum(['all', 'seat_booking', 'charter', 'specific_package']),
  applicablePackageId: z.string().optional(),
});

const AddEditPromotionDialog = ({ onComplete, promotionToEdit, packages, children }: { onComplete: () => void, promotionToEdit?: Promotion, packages: CharterPackage[], children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const isEditMode = !!promotionToEdit;
    const { firestore } = useAuth();

    const form = useForm<z.infer<typeof promotionSchema>>({
        resolver: zodResolver(promotionSchema),
        defaultValues: promotionToEdit || {
            id: '',
            title: "",
            description: "",
            imageUrl: "https://picsum.photos/seed/promo/800/400",
            href: "/book-trip?bookingType=seat_booking",
            status: 'active',
            code: "",
            discountType: 'percentage',
            discountValue: 10,
            applicableTo: 'all'
        },
    });
    
    const applicableTo = form.watch('applicableTo');

    useEffect(() => {
        if(open) {
            form.reset(promotionToEdit || {
                id: doc(collection(firestore, 'promotions')).id, title: "", description: "", imageUrl: "https://picsum.photos/seed/promo/800/400", href: "/book-trip?bookingType=seat_booking", status: 'active', code: "", discountType: 'percentage', discountValue: 10, applicableTo: 'all'
            });
        }
    }, [open, promotionToEdit, form, firestore]);

    const onSubmit = async (data: z.infer<typeof promotionSchema>) => {
        const docRef = doc(firestore, 'promotions', data.id);
        const submissionData = isEditMode
            ? data
            : { ...data, createdAt: serverTimestamp() };

        try {
            await setDoc(docRef, submissionData, { merge: true });
            toast.success(isEditMode ? "Promotion Updated" : "Promotion Created");
            onComplete();
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Error", { description: "Could not save promotion."});
        }
    }

    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen} trigger={children}>
            <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit" : "Create"} Promotion</DialogTitle>
                <DialogDescription>Define a new promotional slide for the user dashboard carousel.</DialogDescription>
            </DialogHeader>
            <div className="p-4">
                <Form {...form}>
                    <form id={`promo-form-${promotionToEdit?.id || 'new'}`} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Weekend Discount" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the promotion" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://picsum.photos/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="href" render={({ field }) => (<FormItem><FormLabel>Link URL (Optional)</FormLabel><FormControl><Input placeholder="/book-trip" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>Coupon Code (Optional)</FormLabel><FormControl><Input placeholder="e.g., WEEKEND10" {...field} /></FormControl><FormMessage /></FormItem>)} />
                         <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="discountType" render={({ field }) => (<FormItem><FormLabel>Discount Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                            <FormField control={form.control} name="discountValue" render={({ field }) => (<FormItem><FormLabel>Value</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </div>
                        <FormField control={form.control} name="applicableTo" render={({ field }) => (
                           <FormItem><FormLabel>Applicable To</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="all">All Bookings</SelectItem><SelectItem value="seat_booking">Seat Bookings Only</SelectItem><SelectItem value="charter">Charters Only</SelectItem><SelectItem value="specific_package">Specific Charter Package</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                        {applicableTo === 'specific_package' && (
                            <FormField control={form.control} name="applicablePackageId" render={({ field }) => (
                               <FormItem><FormLabel>Charter Package</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a package"/></SelectTrigger></FormControl><SelectContent>{packages.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                        )}
                        <FormField control={form.control} name="status" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Status: {field.value}</FormLabel></div><FormControl><Switch checked={field.value === 'active'} onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')} /></FormControl></FormItem>)}/>
                    </form>
                </Form>
            </div>
             <DialogFooter>
                <Button type="submit" form={`promo-form-${promotionToEdit?.id || 'new'}`}>{isEditMode ? "Save Changes" : "Create Promotion"}</Button>
            </DialogFooter>
        </ResponsiveDialog>
    )
}

export default function PromotionsSettingsPage() {
    const router = useRouter();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [packages, setPackages] = useState<CharterPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const { firestore } = useAuth();

    useEffect(() => {
        const q = query(collection(firestore, "promotions"), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedPromos: Promotion[] = [];
            querySnapshot.forEach((doc) => {
                fetchedPromos.push({ id: doc.id, ...doc.data() } as Promotion);
            });
            setPromotions(fetchedPromos);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);
    
     useEffect(() => {
        const docRef = doc(firestore, 'settings', 'charter');
        const unsub = onSnapshot(docRef, (docSnap) => {
             if (docSnap.exists() && docSnap.data().packages) {
                setPackages(docSnap.data().packages);
            }
        });
        return () => unsub();
    }, [firestore]);
    
    const handleDelete = async (promotionId: string) => {
        const docRef = doc(firestore, 'promotions', promotionId);
        try {
            await deleteDoc(docRef);
            toast.success("Promotion Deleted");
        } catch (error) {
            toast.error("Error", { description: "Could not delete promotion."});
        }
    }
    
    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                 <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Promotions Carousel</h1>
                </div>
                <AddEditPromotionDialog onComplete={() => {}} packages={packages}>
                    <Button><Plus className="mr-2 h-4 w-4" /> New Promotion</Button>
                </AddEditPromotionDialog>
            </header>
            <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                 {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                ) : promotions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {promotions.map(promo => (
                            <Card key={promo.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="relative aspect-video mb-4">
                                        <Image src={promo.imageUrl} alt={promo.title} fill className="object-cover rounded-md" />
                                    </div>
                                    <CardTitle className="flex justify-between items-start">
                                        {promo.title}
                                        <Badge variant={promo.status === 'active' ? 'default' : 'secondary'}>{promo.status}</Badge>
                                    </CardTitle>
                                    <CardDescription>{promo.description}</CardDescription>
                                     {promo.code && (
                                        <div className="flex items-center gap-2 pt-2">
                                            <Tag className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="outline" className="font-mono">{promo.code}</Badge>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-end">
                                    <div className="flex items-center gap-2">
                                        <AddEditPromotionDialog onComplete={() => {}} promotionToEdit={promo} packages={packages}>
                                            <Button variant="outline" size="sm" className="w-full"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                        </AddEditPromotionDialog>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" className="w-full"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Are you sure?</DialogTitle>
                                                    <DialogDescription>This will permanently delete the "{promo.title}" promotion.</DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(promo.id)}>Delete</AlertDialogAction>
                                                </DialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                        <BadgePercent className="h-16 w-16 mx-auto text-primary/20"/>
                        <p className="text-lg font-semibold mt-4">No Promotions Found</p>
                        <p className="mt-1">Click "New Promotion" to create your first promotional slide.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
    

    