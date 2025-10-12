
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { SubHeader } from "@/components/sub-header";

const pinSchema = z.object({
    pin: z.string().length(4, "PIN must be 4 digits."),
    confirmPin: z.string().length(4, "Please confirm your PIN."),
}).refine(data => data.pin === data.confirmPin, {
    message: "PINs do not match",
    path: ["confirmPin"],
});

export default function PinManagementPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [hasPin, setHasPin] = useState(false);
    const { user, firestore } = useAuth();

    useEffect(() => {
        if(user?.walletPin) {
            setHasPin(true);
        }
    }, [user]);

    const form = useForm<z.infer<typeof pinSchema>>({
        resolver: zodResolver(pinSchema),
        defaultValues: { pin: "", confirmPin: "" },
    });

    const onSubmit = async (data: z.infer<typeof pinSchema>) => {
        if (!user) return;
        setIsLoading(true);
        
        // This is a placeholder for a server-side hashing operation.
        // In a real app, you would send the PIN to your backend to be hashed.
        const hashedPin = `hashed_${data.pin}_${new Date().getTime()}`;
        
        const userRef = doc(firestore, 'users', user.id);
        
        const updateData = { walletPin: hashedPin };
        updateDoc(userRef, updateData)
            .then(() => {
                // The onSnapshot listener in AuthProvider will handle updating the user state
                setHasPin(true);
                toast.success(hasPin ? "PIN Updated!" : "PIN Set Successfully!", {
                    description: hasPin ? "Your wallet PIN has been changed." : "Your wallet is now secured with your new PIN.",
                });
                form.reset();
            })
            .catch(error => {
                toast.error("Update failed", { description: "Could not set your PIN." });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }
    
    return (
        <>
            <SubHeader title="Manage Wallet PIN" />
            <main className="p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{hasPin ? "Change Your PIN" : "Create a PIN"}</CardTitle>
                        <CardDescription>
                            {hasPin 
                                ? "Enter your new 4-digit PIN to secure your wallet."
                                : "Create a 4-digit PIN to authorize all transactions from your wallet."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-sm mx-auto">
                                <FormField
                                    control={form.control}
                                    name="pin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Enter {hasPin ? "New" : ""} 4-Digit PIN</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="password"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    maxLength={4} 
                                                    className="h-16 text-center text-3xl tracking-[1.5rem]" 
                                                    {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="confirmPin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm {hasPin ? "New" : ""} PIN</FormLabel>
                                            <FormControl>
                                                 <Input 
                                                    type="password"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    maxLength={4} 
                                                    className="h-16 text-center text-3xl tracking-[1.5rem]" 
                                                    {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : (hasPin ? "Update PIN" : "Create PIN")}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
