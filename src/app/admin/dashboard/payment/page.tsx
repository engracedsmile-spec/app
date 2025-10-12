
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Eye, Loader2, Copy, AlertTriangle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import firebaseApp from "@/firebase/config";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AdminHelp } from "../help";
import { useAuth } from "@/hooks/use-auth";
import { PERMISSIONS } from "@/lib/permissions";
import { Preloader } from "@/components/preloader";

const formSchema = z.object({
  paystackPublicKey: z.string().min(1, "Paystack Public Key is required."),
  paystackSecretKey: z.string().min(1, "Paystack Secret Key is required."),
});

const URLDisplay = ({ label, value }: { label: string; value: string }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        toast("Copied to clipboard!");
    };

    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="flex items-center gap-2">
                <Input type="text" readOnly value={value} className="bg-muted" />
                <Button type="button" variant="outline" size="icon" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </FormItem>
    );
};


export default function PaymentSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [showSecret, setShowSecret] = useState(false);
    const [origin, setOrigin] = useState("");
    const { user } = useAuth();
    const canManagePayments = PERMISSIONS[user?.role || 'Support']?.includes('managePayments');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            paystackPublicKey: "",
            paystackSecretKey: "",
        },
    });
    
    useEffect(() => {
        if (!canManagePayments) {
            toast.error("Permission Denied", { description: "You do not have access to this page."});
            router.replace('/admin/dashboard');
            return;
        }

        // This ensures the code only runs on the client-side
        setOrigin(window.location.origin);
    }, [canManagePayments, router]);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const db = getFirestore(firebaseApp);
            const docRef = doc(db, 'settings', 'payment');
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    form.reset(docSnap.data());
                }
            } catch (error) {
                const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'get'
                });
                errorEmitter.emit('permission-error', permissionError);
                toast.error("Permission Denied", { description: "You don't have access to these settings."});
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [form]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, 'settings', 'payment');
        setDoc(docRef, data, { merge: true }).then(() => {
            toast.success("Settings Saved", { description: "Paystack API keys have been updated." });
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data });
            errorEmitter.emit('permission-error', permissionError);
            toast.error('Error', { description: 'Could not save settings due to permissions.' });
        });
    }

    const callbackUrl = `${origin}/verify-payment`;
    const webhookUrl = `${origin}/api/webhooks/paystack`;

    if (loading || !canManagePayments) {
        return <Preloader />;
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 absolute left-4">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Payment Gateway: Paystack</h1>
                <div className="absolute right-4">
                    <AdminHelp page="payment" />
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>API Configuration - Test Mode</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                     <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>For Testing Only</AlertTitle>
                                        <AlertDescription>
                                            These keys are for testing purposes. Please DO NOT use them in a production environment.
                                        </AlertDescription>
                                    </Alert>
                                    <FormField
                                        control={form.control}
                                        name="paystackSecretKey"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Test Secret Key</FormLabel>
                                                <div className="flex items-center gap-2">
                                                    <Input type={showSecret ? "text" : "password"} placeholder="sk_test_..." {...field} />
                                                    <Button type="button" variant="outline" size="icon" onClick={() => setShowSecret(!showSecret)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="paystackPublicKey"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Test Public Key</FormLabel>
                                                <FormControl><Input placeholder="pk_test_..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <URLDisplay label="Test Callback URL" value={callbackUrl} />
                                     <URLDisplay label="Test Webhook URL" value={webhookUrl} />
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                  Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
                 <div className="lg:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/> Setup Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground">1. Get Your API Keys</p>
                                <p>Log in to your Paystack Dashboard, go to <span className="font-semibold text-primary/80">Settings &rarr; API Keys & Webhooks</span> to find your Test Secret and Public keys.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground">2. Paste Keys Here</p>
                                <p>Copy the keys from your Paystack dashboard and paste them into the corresponding fields on this page.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground">3. Update Your Paystack Dashboard</p>
                                <p>Copy the auto-generated <span className="font-semibold text-primary/80">Callback URL</span> and <span className="font-semibold text-primary/80">Webhook URL</span> from this page and paste them into the matching fields in your Paystack dashboard.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground">4. Save Changes</p>
                                <p>Click "Save Changes" on both this page and in your Paystack dashboard to complete the setup.</p>
                            </div>
                        </CardContent>
                     </Card>
                </div>
            </main>
        </div>
    )
}
