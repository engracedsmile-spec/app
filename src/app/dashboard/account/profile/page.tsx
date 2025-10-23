
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
import { doc, updateDoc } from 'firebase/firestore';
import { SubHeader } from "@/components/sub-header";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerBody } from "@/components/ui/drawer";
import { PhoneInput } from "@/components/ui/phone-input";
import { Preloader } from "@/components/preloader";
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
        const userRef = doc(firestore, "users", user.id);
        
        try {
            const updatedData = { ...data, profilePictureUrl: imagePreview || '' };
            await updateDoc(userRef, updatedData);
            // The onSnapshot listener in AuthProvider will handle updating the user state
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
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="edit-profile-form" className="space-y-4 pt-4">
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
                                <FormControl>
                                    <PhoneInput {...field} control={form.control} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </form>
                </Form>
            </DrawerBody>
             <DialogFooter>
                <Button type="submit" form="edit-profile-form">Save Changes</Button>
            </DialogFooter>
        </ResponsiveDialog>
    )
}

const ProfileField = ({ label, value, loading }: { label: string, value: string | undefined, loading?: boolean }) => (
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? <Skeleton className="h-7 w-48 mt-1" /> : <p className="text-lg font-medium">{value}</p>}
    </div>
);

export default function ProfileDetailsPage() {
    const { user, loading } = useAuth();

    if (loading || !user) return <Preloader />;

    return (
        <>
            <SubHeader title="Profile Details" />

            <main className="p-4 md:p-6 space-y-8">
                 <Card>
                    <CardHeader className="items-center text-center">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-2 border-primary/50">
                                <AvatarImage src={user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${user?.name.replace(' ', '+')}&background=random`} />
                                <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                             <EditProfileDialog user={user} />
                        </div>
                         <CardTitle className="text-2xl pt-2">{user?.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ProfileField label="Full Name" value={user?.name} loading={loading}/>
                        <ProfileField label="Email Address" value={user?.email} loading={loading}/>
                        <ProfileField label="Phone Number" value={user?.phone} loading={loading}/>
                    </CardContent>
                 </Card>
            </main>
        </>
    );
}

    