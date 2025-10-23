
/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useAuth, useFirestore, useDoc } from "@/firebase";
import { setDoc, doc } from 'firebase/firestore';
import { SubHeader } from "@/components/sub-header";
import { Skeleton } from "@/components/ui/skeleton";
import type { SupportSettings } from "@/lib/data";
import { useEffect } from "react";

const formSchema = z.object({
  quickReplies: z.array(z.object({ value: z.string().min(1, "Reply cannot be empty.") })),
});

type FormSchema = z.infer<typeof formSchema>;

export default function SupportSettingsPage() {
    const { firestore } = useAuth();
    const { data: settings, loading } = useDoc<SupportSettings>('settings/support');
    
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quickReplies: [{ value: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "quickReplies",
    });

    useEffect(() => {
        if (settings?.quickReplies) {
            const replies = settings.quickReplies.map(reply => ({ value: reply }));
            form.reset({ quickReplies: replies.length > 0 ? replies : [{ value: "" }] });
        }
    }, [settings, form]);
    
    const onSubmit = async (data: FormSchema) => {
        try {
            const docRef = doc(firestore, 'settings', 'support');
            const plainReplies = data.quickReplies.map(r => r.value);
            await setDoc(docRef, { quickReplies: plainReplies });
            toast.success("Support settings updated successfully.");
        } catch (error) {
            console.error("Error updating support settings:", error);
            toast.error("Failed to update settings.");
        }
    }

    return (
        <div className="flex flex-col h-full">
            <SubHeader title="Support Settings">
                <Button type="submit" form="support-settings-form" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </SubHeader>
             <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>User Quick Replies</CardTitle>
                        <CardDescription>Manage the pre-filled messages users see when they open the support chat.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
                             <Form {...form}>
                                <form id="support-settings-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <FormField
                                                key={field.id}
                                                control={form.control}
                                                name={`quickReplies.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="flex items-center gap-2">
                                                            <FormControl>
                                                                <Input {...field} placeholder={`Quick reply #${index + 1}`} />
                                                            </FormControl>
                                                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                                                <Trash2 className="h-4 w-4"/>
                                                            </Button>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => append({ value: "" })}>
                                        <Plus className="mr-2 h-4 w-4"/>
                                        Add Reply
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
