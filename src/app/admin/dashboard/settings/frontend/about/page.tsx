
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
  mission: z.string().min(20, "Mission statement is too short."),
  vision: z.string().min(20, "Vision statement is too short."),
});

export default function AboutPageEditor() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            headline: "",
            subHeadline: "",
            heroImageUrl: "",
            mission: "",
            vision: "",
        },
    });

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const db = getFirestore(firebaseApp);
            const docRef = doc(db, "settings", "aboutUsPage");
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
        const docRef = doc(db, 'settings', 'aboutUsPage');
        setDoc(docRef, data, { merge: true }).then(() => {
            toast.success("Content Saved", { description: "Your About Us page has been updated." });
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data });
            errorEmitter.emit('permission-error', permissionError);
            toast.error('Error', { description: 'Could not save content due to permissions.' });
        });
    };
    
    if (loading) return <Preloader />;

    return (
        <div className="flex flex-col h-full">
            <SubHeader title="Edit About Us Page">
                 <Button size="sm" type="submit" form="about-us-form" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </SubHeader>
            <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="about-us-form" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>About Us Page Content</CardTitle>
                                <CardDescription>Update the content that appears on your public 'About Us' page.</CardDescription>
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
                                    <FormField control={form.control} name="mission" render={({ field }) => (
                                        <FormItem><FormLabel>Our Mission</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="vision" render={({ field }) => (
                                        <FormItem><FormLabel>Our Vision</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </main>
        </div>
    )
}
