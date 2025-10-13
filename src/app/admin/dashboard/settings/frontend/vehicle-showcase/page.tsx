
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Edit, Trash2, Car, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { VehicleShowcaseImage } from "@/lib/data";
import { useDoc } from "@/firebase/firestore/use-collection";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Image from "next/image";
import { SubHeader } from "@/components/sub-header";
import { useAuth } from "@/firebase";

const imageSchema = z.object({
  id: z.string(),
  src: z.string().url("Please enter a valid image URL."),
  alt: z.string().min(3, "Alt text is too short."),
  hint: z.string().optional(),
});

const showcaseSchema = z.object({
    images: z.array(imageSchema),
});


const AddEditImageDialog = ({ onComplete, existingImages, imageToEdit, children }: { onComplete: () => void, existingImages: VehicleShowcaseImage[], imageToEdit?: VehicleShowcaseImage, children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const isEditMode = !!imageToEdit;
    const { firestore } = useAuth();

    const form = useForm<z.infer<typeof imageSchema>>({
        resolver: zodResolver(imageSchema),
        defaultValues: imageToEdit || { id: uuidv4(), src: "", alt: "", hint: "" },
    });

    useEffect(() => {
        if(open) {
            form.reset(imageToEdit || { id: uuidv4(), src: "https://picsum.photos/seed/vehicle/800/600", alt: "", hint: "" });
        }
    }, [open, imageToEdit, form]);

    const onSubmit = async (data: z.infer<typeof imageSchema>) => {
        let newImages: VehicleShowcaseImage[];
        if (isEditMode) {
            const index = existingImages.findIndex(p => p.id === data.id);
            newImages = [...existingImages];
            newImages[index] = data;
        } else {
            newImages = [...existingImages, data];
        }

        const docRef = doc(firestore, 'settings', 'vehicleShowcase');
        try {
            await setDoc(docRef, { images: newImages }, { merge: true });
            toast.success(isEditMode ? "Image Updated" : "Image Added");
            onComplete();
            setOpen(false);
        } catch (error) {
            toast.error("Failed to save image.");
        }
    }

    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen} trigger={children}>
            <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit" : "Add"} Image</DialogTitle>
                <DialogDescription>Manage an image for the vehicle showcase carousel.</DialogDescription>
            </DialogHeader>
            <div className="p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id={`showcase-form-${imageToEdit?.id || 'new'}`} className="space-y-4 pt-4">
                        <FormField control={form.control} name="src" render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://picsum.photos/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="alt" render={({ field }) => (<FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input placeholder="A short description of the image" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="hint" render={({ field }) => (<FormItem><FormLabel>AI Hint (Optional)</FormLabel><FormControl><Input placeholder="e.g., 'minivan interior'" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </form>
                </Form>
            </div>
             <DialogFooter>
                <Button type="submit" form={`showcase-form-${imageToEdit?.id || 'new'}`}>{isEditMode ? "Save Changes" : "Add Image"}</Button>
            </DialogFooter>
        </ResponsiveDialog>
    )
}

export default function VehicleShowcasePage() {
    const { data, loading, error } = useDoc<{images: VehicleShowcaseImage[]}>("settings/vehicleShowcase");
    const { firestore } = useAuth();
    
    const images = data?.images || [];

    const handleDelete = async (imageId: string) => {
        const newImages = images.filter(p => p.id !== imageId);
        const docRef = doc(firestore, 'settings', 'vehicleShowcase');
        try {
            await setDoc(docRef, { images: newImages });
            toast.success("Image Deleted");
        } catch(e) {
            toast.error("Failed to delete image.");
        }
    }
    
    return (
        <div className="flex flex-col h-full">
            <SubHeader title="Vehicle Showcase">
                <AddEditImageDialog onComplete={() => {}} existingImages={images}>
                    <Button><Plus className="mr-2 h-4 w-4" /> Add Image</Button>
                </AddEditImageDialog>
            </SubHeader>
            <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Showcase Images</CardTitle>
                        <CardDescription>These images are shown to customers on the seat selection screen during booking.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                        ) : images.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {images.map(image => (
                                    <Card key={image.id} className="flex flex-col overflow-hidden">
                                        <div className="relative aspect-video bg-muted">
                                            <Image 
                                                src={image.src} 
                                                alt={image.alt} 
                                                fill 
                                                className="object-cover"
                                                unoptimized
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full"><svg class="h-16 w-16 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                                                }}
                                            />
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="text-base line-clamp-1">{image.alt}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex items-end">
                                            <div className="flex items-center gap-2 w-full">
                                                <AddEditImageDialog onComplete={() => {}} imageToEdit={image} existingImages={images}>
                                                    <Button variant="outline" size="sm" className="w-full"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                                </AddEditImageDialog>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm" className="w-full"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This will permanently delete this image from the showcase.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(image.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                                <ImageIcon className="h-16 w-16 mx-auto text-primary/20"/>
                                <p className="text-lg font-semibold mt-4">No Showcase Images</p>
                                <p className="mt-1">Click "Add Image" to create your first one.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
