
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Switch } from "@/components/ui/switch";
import { Preloader } from "@/components/preloader";
import { SubHeader } from "@/components/sub-header";

const formSchema = z.object({
  referralSystemEnabled: z.boolean(),
  referralBonus: z.coerce.number().min(0, "Bonus must be a positive number."),
});

export default function ReferralsSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            referralSystemEnabled: true,
            referralBonus: 500,
        },
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const db = getFirestore(firebaseApp);
            const docRef = doc(db, "settings", "operations"); //Referral settings are stored in operations
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    form.reset(docSnap.data());
                }
            } catch (error) {
                toast.error("Permission Denied", { description: "You don't have access to these settings."});
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [form]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, 'settings', 'operations');
        setDoc(docRef, data, { merge: true }).then(() => {
            toast.success("Settings Saved", { description: "Referral settings have been updated." });
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data });
            errorEmitter.emit('permission-error', permissionError);
            toast.error('Error', { description: 'Could not save settings due to permissions.' });
        });
    };
    
    if (loading) {
        return <Preloader />
    }

    return (
        <>
            <SubHeader title="Referral Program Settings" />
            <main className="p-4 md:p-6">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Referral System</CardTitle>
                                <CardDescription>Enable or disable the refer-a-friend program and set the reward amount.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                               <FormField
                                    control={form.control}
                                    name="referralSystemEnabled"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                            <div>
                                                <FormLabel htmlFor="referral-enabled-switch" className="font-semibold">Enable Referral Program</FormLabel>
                                                <p className="text-xs text-muted-foreground">Globally turn the referral system on or off.</p>
                                            </div>
                                            <FormControl>
                                                <Switch 
                                                    id="referral-enabled-switch"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                {form.watch('referralSystemEnabled') && (
                                     <FormField
                                        control={form.control}
                                        name="referralBonus"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Referral Bonus (₦)</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        placeholder="e.g., 500" 
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                <p className="text-xs text-muted-foreground pt-1">
                                                   The amount credited to the referrer's wallet upon a successful referral.
                                                </p>
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </CardContent>
                        </Card>
                        <div className="flex justify-end">
                            <Button size="lg" type="submit" disabled={form.formState.isSubmitting}>
                              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                              Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </main>
        </>
    )
}
