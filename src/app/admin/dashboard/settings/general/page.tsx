
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Bell, DollarSign, CreditCard, Route, Settings, KeyRound, Loader2, AppWindow, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useAuth } from "@/hooks/use-auth";
import { PERMISSIONS } from "@/lib/permissions";
import { Preloader } from "@/components/preloader";
import { SubHeader } from "@/components/sub-header";

const formSchema = z.object({
  appName: z.string().min(3, "App name is required."),
  supportEmail: z.string().email("Please enter a valid email."),
  supportPhone: z.string().min(10, "Please enter a valid phone number."),
  currency: z.string().length(3, "Currency code must be 3 letters."),
});

const settingsLinks = [
    { title: "Route Pricing", description: "Set base fares for different routes.", href: "/admin/dashboard/settings/routes", icon: DollarSign, permission: 'manageSettings' },
    { title: "Referrals", description: "Configure the customer referral program.", href: "/admin/dashboard/settings/referrals", icon: Share2, permission: 'manageSettings' },
    { title: "Notification Settings", description: "Manage automated system and user notifications.", href: "/admin/dashboard/settings/notifications", icon: Bell, permission: 'sendNotifications' },
    { title: "Payment Gateway", description: "Configure Paystack and other payment providers.", href: "/admin/dashboard/settings/payment", icon: CreditCard, permission: 'managePayments' },
    { title: "Operations", description: "Manage driver settings and booking modes.", href: "/admin/dashboard/settings/operations", icon: Route, permission: 'manageSettings' },
]

export default function GeneralSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const userRole = user?.role || "Support";
    const userPermissions = PERMISSIONS[userRole] || [];
    const canManageSettings = userPermissions.includes('manageSettings');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            appName: "Engraced Smile",
            supportEmail: "support@engracedsmile.com",
            supportPhone: "+234 800 123 4567",
            currency: "NGN",
        }
    });
    
    useEffect(() => {
        if (!canManageSettings) {
            toast.error("Permission Denied", { description: "You do not have access to this page."});
            router.replace('/admin/dashboard');
            return;
        }

        const fetchSettings = async () => {
            setLoading(true);
            const db = getFirestore(firebaseApp);
            const docRef = doc(db, "settings", "general");
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    form.reset(docSnap.data());
                }
            } catch (error) {
                 const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
                 errorEmitter.emit('permission-error', permissionError);
                 toast.error("Permission Denied", { description: "You don't have access to these settings."});
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [form, canManageSettings, router]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, 'settings', 'general');
        setDoc(docRef, data, { merge: true }).then(() => {
            toast.success("Settings Saved", { description: "General settings have been updated." });
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data });
            errorEmitter.emit('permission-error', permissionError);
            toast.error('Error', { description: 'Could not save settings due to permissions.' });
        });
    }

    if (loading || !canManageSettings) {
        return <Preloader />;
    }

    return (
        <div className="flex flex-col h-dvh">
            <SubHeader title="General Settings" />
            <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Core Configuration</CardTitle>
                                <CardDescription>Manage your application's core settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="appName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>App Name</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="supportEmail"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Support Email</FormLabel>
                                                        <FormControl><Input {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="supportPhone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Support Phone</FormLabel>
                                                        <FormControl><Input {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="currency"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Currency Code</FormLabel>
                                                    <FormControl><Input {...field} maxLength={3} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex justify-end">
                                            <Button type="submit">Save Changes</Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold tracking-tight px-1">More Settings</h3>
                        {settingsLinks.filter(link => userPermissions.includes(link.permission)).map(link => (
                            <Link href={link.href} key={link.href} className="block">
                                <Card className="hover:border-primary transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">{link.title}</CardTitle>
                                            <CardDescription>{link.description}</CardDescription>
                                        </div>
                                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted text-muted-foreground">
                                            <link.icon className="h-5 w-5" />
                                        </div>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
