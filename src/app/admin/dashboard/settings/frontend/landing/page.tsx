
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Preloader } from "@/components/preloader";
import { SubHeader } from "@/components/sub-header";

const formSchema = z.object({
  headline: z.string().min(5, "Headline is too short."),
  subHeadline: z.string().min(10, "Sub-headline is too short."),
  heroImageUrl: z.string().url("Please enter a valid URL."),
  ctaButtonText: z.string().min(3, "Button text is too short."),
  signInButtonText: z.string().min(3, "Button text is too short."),
});

export default function LandingPageEditor() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            headline: "",
            subHeadline: "",
            heroImageUrl: "",
            ctaButtonText: "Get Started",
            signInButtonText: "Sign In",
        },
    });

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const db = getFirestore(firebaseApp);
            const docRef = doc(db, "settings", "landingPage");
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    form.reset(docSnap.data());
                }
            } catch (error) {
                toast.error("Error", { description: "Could not load page content."});
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [form]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, 'settings', 'landingPage');
        setDoc(docRef, data, { merge: true }).then(() => {
            toast.success("Content Saved", { description: "Your landing page has been updated." });
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data });
            errorEmitter.emit('permission-error', permissionError);
            toast.error('Error', { description: 'Could not save content due to permissions.' });
        });
    };
    
    if (loading) return <Preloader />;

    return (
        <div className="flex flex-col h-full">
            <SubHeader title="Edit Landing Page">
                 <Button size="sm" type="submit" form="landing-page-form" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </SubHeader>
            <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="landing-page-form" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Landing Page Content</CardTitle>
                                <CardDescription>Update the text and images that appear on your public homepage.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <FormField control={form.control} name="headline" render={({ field }) => (
                                        <FormItem><FormLabel>Main Headline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="subHeadline" render={({ field }) => (
                                        <FormItem><FormLabel>Sub-Headline</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="heroImageUrl" render={({ field }) => (
                                        <FormItem><FormLabel>Background Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="ctaButtonText" render={({ field }) => (
                                            <FormItem><FormLabel>Primary Button Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="signInButtonText" render={({ field }) => (
                                            <FormItem><FormLabel>Secondary Button Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </main>
        </div>
    )
}
