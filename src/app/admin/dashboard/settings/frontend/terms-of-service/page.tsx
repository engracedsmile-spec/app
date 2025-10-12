
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { Preloader } from "@/components/preloader";
import { SubHeader } from "@/components/sub-header";

const formSchema = z.object({
  body: z.string().min(50, "Content is too short."),
});

export default function TermsOfServiceEditor() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { body: "" },
    });

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const db = getFirestore(firebaseApp);
            const docRef = doc(db, "settings", "termsOfService");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                form.reset(docSnap.data());
            }
            setLoading(false);
        };
        fetchContent();
    }, [form]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, 'settings', 'termsOfService');
        await setDoc(docRef, { title: "Terms of Service", ...data }, { merge: true });
        toast.success("Content Saved", { description: "Your Terms of Service have been updated." });
    };

    if (loading) return <Preloader />;

    return (
        <div className="flex flex-col h-full">
            <SubHeader title="Edit Terms of Service">
                <Button size="sm" type="submit" form="terms-form" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </SubHeader>
            <main className="flex-1 p-4 md:p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="terms-form" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Terms of Service Content</CardTitle>
                                <CardDescription>Use the editor below to manage your terms of service. You can use markdown for formatting.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField control={form.control} name="body" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Textarea {...field} rows={25} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </main>
        </div>
    )
}
