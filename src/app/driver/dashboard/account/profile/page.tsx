
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Edit, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';
import { Preloader } from "@/components/preloader";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerBody } from "@/components/ui/drawer";
import type { Vehicle } from "@/lib/data";
import { SubHeader } from "@/components/sub-header";
import { Car } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
    name: z.string().min(2, "Name is required."),
    phone: z.string().min(10, "Please enter a valid phone number."),
    profilePictureUrl: z.string().optional(),
});

const EditProfileDialog = ({ user }: { user: any }) => {
    const [open, setOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(user.profilePictureUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { firestore } = useAuth();

    const form = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user.name, phone: user.phone, profilePictureUrl: user.profilePictureUrl || '' }
    });

     useEffect(() => {
        if(open) {
            form.reset({ name: user.name, phone: user.phone, profilePictureUrl: user.profilePictureUrl || '' });
            setImagePreview(user.profilePictureUrl || null);
        }
    }, [open, user, form]);

    const onSubmit = async (data: z.infer<typeof profileSchema>) => {
        if (!firestore) return;
        const userRef = doc(firestore, "users", user.id);
        
        try {
            const updatedData = { ...data, profilePictureUrl: imagePreview || '' };
            await updateDoc(userRef, updatedData);
            // The onSnapshot listener in AuthProvider will handle updating the user state.
            toast.success("Profile Updated", { description: "Your details have been successfully updated." });
            setOpen(false);
        } catch (error) {
            toast.error('Error', { description: 'Could not update your profile.' });
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen} trigger={
             <Button size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary hover:bg-primary/90">
                <Edit className="h-4 w-4" />
            </Button>
        }>
            <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>Update your personal information below.</DialogDescription>
            </DialogHeader>
            <DrawerBody>
                 <div className="p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} id="driver-edit-profile-form" className="space-y-4 pt-4">
                            <FormItem className="flex flex-col items-center">
                                <Avatar className="h-24 w-24 border-2 border-primary/50 mb-2">
                                    <AvatarImage src={imagePreview || user.profilePictureUrl} alt={user.name} />
                                    <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                   <Upload className="mr-2 h-4 w-4"/> Change Photo
                                </Button>
                                <FormControl>
                                    <Input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                </FormControl>
                            </FormItem>

                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl><PhoneInput {...field} control={form.control} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </form>
                    </Form>
                </div>
            </DrawerBody>
            <DialogFooter>
                <Button type="submit" form="driver-edit-profile-form">Save Changes</Button>
            </DialogFooter>
        </ResponsiveDialog>
    )
}

const ProfileField = ({ label, value }: { label: string, value: string | undefined }) => (
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-medium">{value || "N/A"}</p>
    </div>
);

export default function DriverProfileDetailsPage() {
    const { user, firestore, loading: authLoading } = useAuth();
    const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null);
    const [vehicleLoading, setVehicleLoading] = useState(true);

    useEffect(() => {
        if (!user || !firestore) return;
        setVehicleLoading(true);
        const vehiclesQuery = query(collection(firestore, 'vehicles'), where("primaryDriverId", "==", user.id));
        const unsubscribe = onSnapshot(vehiclesQuery, (snapshot) => {
            if (!snapshot.empty) {
                setAssignedVehicle(snapshot.docs[0].data() as Vehicle);
            } else {
                setAssignedVehicle(null);
            }
            setVehicleLoading(false);
        });
        return unsubscribe;
    }, [user, firestore]);

    if (authLoading || vehicleLoading || !user) return <Preloader />;

    return (
        <>
            <SubHeader title="Driver Profile"/>
            <main className="flex-1 p-4 md:p-6 space-y-8 overflow-y-auto">
                 <Card>
                    <CardHeader className="items-center text-center">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-2 border-primary/50">
                                <AvatarImage src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`} />
                                <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <EditProfileDialog user={user} />
                        </div>
                         <CardTitle className="text-2xl pt-2">{user.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <ProfileField label="Full Name" value={user.name} />
                            <ProfileField label="Email Address" value={user.email} />
                            <ProfileField label="Phone Number" value={user.phone} />
                            <ProfileField label="Date Joined" value={user.dateJoined} />
                        </div>
                         <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><Car/> Vehicle Information</h3>
                            {assignedVehicle ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <ProfileField label="Vehicle Model" value={`${assignedVehicle.make} ${assignedVehicle.model}`} />
                                    <ProfileField label="License Plate" value={assignedVehicle.licensePlate} />
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No vehicle assigned.</p>
                            )}
                        </div>
                    </CardContent>
                 </Card>
            </main>
        </>
    );
}

    