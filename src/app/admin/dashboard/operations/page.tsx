
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Route, Mail, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AdminHelp } from "../help";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Preloader } from "@/components/preloader";
import { PERMISSIONS } from "@/lib/permissions";
import { getOperationsSettings, defaultOperationsSettings } from "@/lib/settings";
import { SubHeader } from "@/components/sub-header";
import Link from "next/link";


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.225 0-9.652-3.808-11.303-8.854l-6.571 4.819C9.656 39.663 16.318 44 24 44z" />
    </svg>
)

const formSchema = z.object({
  driverRegistrationOpen: z.boolean(),
  driverRegistrationLimit: z.coerce.number().min(0, "Limit must be a positive number."),
  seatHoldDuration: z.coerce.number().min(5, "Seat hold must be at least 5 minutes."),
  requireEmailVerification: z.boolean(),
  requirePhoneVerification: z.boolean(),
  authMethods: z.object({
      email: z.boolean(),
      google: z.boolean(),
  }).refine(data => data.email || data.google, {
      message: "At least one authentication method must be enabled.",
      path: ["email"],
  }),
});


export default function OperationsSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const userRole = user?.role || "Support";
    const canManageSettings = PERMISSIONS[userRole]?.includes('manageSettings');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultOperationsSettings,
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
        if (!data.authMethods.email && !data.authMethods.google) {
            toast.error("Invalid Configuration", { description: "You must enable at least one sign-in method." });
            return;
        }
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, 'settings', 'operations');
        setDoc(docRef, data, { merge: true }).then(() => {
            toast.success("Settings Saved", { description: "Operational settings have been updated." });
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data });
            errorEmitter.emit('permission-error', permissionError);
            toast.error('Error', { description: 'Could not save settings due to permissions.' });
        });
    };

    if (loading) {
        return <Preloader />
    }
    
    if (!canManageSettings) {
        return <Preloader />; // Return preloader while redirecting
    }

    return (
        <div className="flex flex-col h-full">
            <SubHeader title="Operations Settings">
                 <div className="flex items-center gap-2">
                    <Button size="sm" type="submit" form="operations-settings-form" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Save Changes
                    </Button>
                    <AdminHelp page="operations" />
                </div>
            </SubHeader>
            <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                 <Alert>
                    <Route className="h-4 w-4" />
                    <AlertTitle>Looking for Route Management?</AlertTitle>
                    <AlertDescription>
                        Service routes and their base prices are now managed under <Link href="/admin/dashboard/settings/routes" className="font-bold text-primary hover:underline">Route Management</Link>.
                    </AlertDescription>
                </Alert>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="operations-settings-form" className="space-y-6">
                        <Card>
                             <CardHeader>
                                <CardTitle>Authentication Methods</CardTitle>
                                <CardDescription>Control how users can sign in and sign up.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {form.formState.errors.authMethods && (
                                     <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Configuration Error</AlertTitle>
                                        <AlertDescription>
                                           {form.formState.errors.authMethods.root?.message}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <FormField
                                    control={form.control}
                                    name="authMethods.email"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                            <div>
                                                <FormLabel htmlFor="email-auth-switch" className="font-semibold flex items-center gap-2"><Mail className="h-4 w-4"/> Enable Email & Password</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch 
                                                    id="email-auth-switch"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="authMethods.google"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                            <div>
                                                <FormLabel htmlFor="google-auth-switch" className="font-semibold flex items-center gap-2"><GoogleIcon className="h-4 w-4"/> Enable Google Sign-In</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch 
                                                    id="google-auth-switch"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Passenger Booking</CardTitle>
                                <CardDescription>Settings related to the passenger booking flow.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="seatHoldDuration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Seat Hold Duration (Minutes)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    placeholder="e.g., 5" 
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <p className="text-xs text-muted-foreground pt-1">
                                                How long to reserve a seat for a user while they complete payment. Minimum is 5 minutes.
                                            </p>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Driver Registrations</CardTitle>
                                <CardDescription>Control how and when new drivers can apply.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="driverRegistrationOpen"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                            <div>
                                                <FormLabel htmlFor="driver-reg-open" className="font-semibold">Allow New Driver Applications</FormLabel>
                                                <p className="text-xs text-muted-foreground">Enable or disable the driver application form.</p>
                                            </div>
                                            <FormControl>
                                                <Switch 
                                                    id="driver-reg-open"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="driverRegistrationLimit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Driver Registration Limit</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    placeholder="e.g., 100" 
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <p className="text-xs text-muted-foreground pt-1">
                                                Set the maximum number of drivers that can be registered.
                                            </p>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </main>
        </div>
    )
}

    
