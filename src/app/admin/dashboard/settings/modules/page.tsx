
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Car, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AdminHelp } from "../../help";
import { Preloader } from "@/components/preloader";
import { PERMISSIONS } from "@/lib/permissions";
import { getOperationsSettings, defaultOperationsSettings } from "@/lib/settings";

const formSchema = z.object({
  seatBookingEnabled: z.boolean(),
  charterBookingEnabled: z.boolean(),
});

export default function ModuleSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const userRole = user?.role || "Support";
    const canManageSettings = PERMISSIONS[userRole]?.includes('manageSettings');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            seatBookingEnabled: true,
            charterBookingEnabled: true,
        },
    });

    useEffect(() => {
        if (!canManageSettings) {
            toast.error("Permission Denied", { description: "You do not have access to this page."});
            router.replace('/admin/dashboard');
            return;
        }
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const settings = await getOperationsSettings();
                form.reset(settings);
            } catch (error) {
                 toast.error("Permission Denied", { description: "You don't have access to these settings."});
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [form, canManageSettings, router]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const { firestore } = useAuth();
        const docRef = doc(firestore, 'settings', 'operations');
        setDoc(docRef, data, { merge: true }).then(() => {
            toast.success("Settings Saved", { description: "Module settings have been updated." });
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data });
            errorEmitter.emit('permission-error', permissionError);
            toast.error('Error', { description: 'Could not save settings due to permissions.' });
        });
    };

    if (loading || !canManageSettings) {
        return <Preloader />;
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 absolute left-4">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Module Management</h1>
                <div className="absolute right-4"><AdminHelp page="operations" /></div>
            </header>
            <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Modules</CardTitle>
                                <CardDescription>Enable or disable the core booking types available to customers.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="seatBookingEnabled"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                            <div>
                                                <FormLabel htmlFor="seat-booking-switch" className="font-semibold flex items-center gap-2"><Car className="h-4 w-4"/> Enable Seat Booking</FormLabel>
                                                <p className="text-xs text-muted-foreground">Allows users to book individual seats on scheduled trips.</p>
                                            </div>
                                            <FormControl><Switch id="seat-booking-switch" checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="charterBookingEnabled"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                            <div>
                                                <FormLabel htmlFor="charter-booking-switch" className="font-semibold flex items-center gap-2"><Car className="h-4 w-4"/> Enable Vehicle Charter</FormLabel>
                                                <p className="text-xs text-muted-foreground">Allows users to book the entire vehicle for a private trip.</p>
                                            </div>
                                            <FormControl><Switch id="charter-booking-switch" checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                        <div className="flex justify-end">
                            <Button size="lg" type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </main>
        </div>
    )
}
