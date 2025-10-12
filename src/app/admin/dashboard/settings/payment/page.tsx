
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
import { useAuth } from "@/hooks/use-auth";
import { PERMISSIONS } from "@/lib/permissions";
import { Preloader } from "@/components/preloader";
import { SubHeader } from "@/components/sub-header";
import { getPaymentSettings } from "@/lib/settings";

const formSchema = z.object({
  paystackLivePublicKey: z.string().min(1, "Paystack Live Public Key is required."),
  paystackLiveSecretKey: z.string().min(1, "Paystack Live Secret Key is required."),
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
    const [showLiveSecret, setShowLiveSecret] = useState(false);
    const [origin, setOrigin] = useState("");
    const { user, firestore } = useAuth();
    const canManagePayments = PERMISSIONS[user?.role || 'Support']?.includes('managePayments');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            paystackLivePublicKey: "",
            paystackLiveSecretKey: "",
        },
    });
    
    useEffect(() => {
        if (!canManagePayments) {
            toast.error("Permission Denied", { description: "You do not have access to this page."});
            router.replace('/admin/dashboard');
            return;
        }

        setOrigin(window.location.origin);
    }, [canManagePayments, router]);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const settings = await getPaymentSettings();
                form.reset(settings);
            } catch (error) {
                toast.error("Permission Denied", { description: "You don't have access to these settings."});
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [form]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const docRef = doc(firestore, 'settings', 'payment');
        // We ensure only live keys are saved.
        const saveData = {
            paystackLivePublicKey: data.paystackLivePublicKey,
            paystackLiveSecretKey: data.paystackLiveSecretKey,
        };
        setDoc(docRef, saveData, { merge: true }).then(() => {
            toast.success("Settings Saved", { description: "Paystack API keys have been updated." });
        }).catch(async (serverError) => {
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
            <SubHeader title="Payment Gateway: Paystack">
                 <div className="flex items-center gap-2">
                    <Button size="sm" type="submit" form="payment-settings-form" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Save Changes
                    </Button>
                </div>
            </SubHeader>
            <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} id="payment-settings-form" className="space-y-8">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Live API Configuration</CardTitle>
                                    <CardDescription>Enter your official Paystack keys for processing real payments.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                     <FormField control={form.control} name="paystackLiveSecretKey" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Live Secret Key</FormLabel>
                                            <div className="flex items-center gap-2">
                                                <Input type={showLiveSecret ? "text" : "password"} placeholder="sk_live_..." {...field} />
                                                <Button type="button" variant="outline" size="icon" onClick={() => setShowLiveSecret(!showLiveSecret)}><Eye className="h-4 w-4" /></Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="paystackLivePublicKey" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Live Public Key</FormLabel>
                                            <FormControl><Input placeholder="pk_live_..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </CardContent>
                            </Card>
                            
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/> Setup Instructions</CardTitle>
                                    <CardDescription>Copy these URLs into the corresponding Webhook & Callback URL fields in your Paystack dashboard for both test and live settings.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                     <URLDisplay label="Webhook URL" value={webhookUrl} />
                                     <URLDisplay label="Callback URL" value={callbackUrl} />
                                </CardContent>
                             </Card>
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
                                <p>Log in to your Paystack Dashboard, go to <span className="font-semibold text-primary/80">Settings &rarr; API Keys & Webhooks</span> to find your Live Secret and Public keys.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground">2. Paste Keys Here</p>
                                <p>Copy the keys from your Paystack dashboard and paste them into the corresponding fields on this page.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground">3. Update Your Paystack Dashboard</p>
                                <p>Copy the auto-generated <span className="font-semibold text-primary/80">Webhook URL</span> and <span className="font-semibold text-primary/80">Callback URL</span> from this page and paste them into the matching fields in your Paystack dashboard.</p>
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
