"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { updatePassword } from "firebase/auth";
import { SubHeader } from "@/components/sub-header";

const formSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
}).refine(data => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current one.",
    path: ["newPassword"],
});

export default function SecurityPage() {
    const { firebaseUser, signIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { currentPassword: "", newPassword: "" },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!firebaseUser || !firebaseUser.email) return;

        setIsLoading(true);

        try {
            await signIn(firebaseUser.email, data.currentPassword);
            
            await updatePassword(firebaseUser, data.newPassword);
            
            toast.success("Password Updated", {
                description: "Your password has been changed successfully.",
            });
            form.reset();

        } catch (error: any) {
            console.error("Password change error:", error);
            let description = "An unknown error occurred.";
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                description = "The current password you entered is incorrect.";
            } else if (error.code === 'auth/weak-password') {
                description = "The new password is too weak.";
            }
            toast.error("Update Failed", {
                description: description,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <SubHeader title="Privacy & Security" />
            <main className="p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your password here. It's a good practice to use a strong, unique password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-sm">
                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Password
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
