
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, ArrowDownCircle, Eye, EyeOff, Wallet, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePaystackPayment } from "react-paystack";
import { getPaymentSettings } from "@/lib/settings";
import { toast } from "sonner";
import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { getClientApp } from '@/firebase/config';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as bcrypt from 'bcryptjs';
import { useForm } from "react-hook-form";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter } from "@/components/ui/drawer";
import { useRouter } from "next/navigation";


const fundWalletSchema = z.object({
    amount: z.coerce.number().min(100, "Minimum funding amount is ₦100."),
});

const withdrawSchema = z.object({
    amount: z.coerce.number().min(500, "Minimum withdrawal amount is ₦500."),
    pin: z.string().length(4, "PIN must be 4 digits."),
});


const FundWalletDialogContent = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
    const { user, firebaseUser } = useAuth();
    const [paymentSettings, setPaymentSettings] = useState({ paystackPublicKey: "" });
    const [isLoading, setIsLoading] = useState(false);
    const firebaseApp = getClientApp();
    const db = getFirestore(firebaseApp);
     const form = useForm<z.infer<typeof fundWalletSchema>>({
        resolver: zodResolver(fundWalletSchema),
        defaultValues: { amount: 1000 },
    });

    useEffect(() => {
        getPaymentSettings().then(setPaymentSettings);
    }, []);

    const onPaymentSuccess = async (reference: any) => {
        setIsLoading(true);
        if (!user || !firebaseUser) {
             toast.error("Authentication Error", { description: "You must be logged in to fund your wallet."});
             setIsLoading(false);
             return;
        };
        
        try {
            const idToken = await firebaseUser.getIdToken();
            const response = await fetch('/api/wallet/fund', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    amount: form.getValues("amount"),
                    reference: reference.reference
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to process funding.");
            }
            
            toast.success("Payment Successful!", {
                description: "Your wallet has been credited.",
            });
            setOpen(false);

        } catch (error: any) {
            toast.error("Funding Error", {
                description: error.message || "There was an issue processing your payment. Please contact support.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onClose = () => {
        if (isLoading) return; 
        setOpen(false);
    };
    
    const initializePayment = usePaystackPayment({
        reference: new Date().getTime().toString(),
        email: user?.email || '',
        amount: (form.getValues("amount") || 0) * 100, // Amount in kobo
        publicKey: paymentSettings.paystackPublicKey,
    });
    
    const onSubmit = (data: z.infer<typeof fundWalletSchema>) => {
        if (!paymentSettings.paystackPublicKey) {
            toast.error("Payment Gateway Not Configured", {
                description: "The admin has not configured Paystack. Please contact support."
            })
            return;
        }
        
        // This reinitializes with the latest amount before calling Paystack
        initializePayment({ 
            onSuccess, 
            onClose, 
            config: {
                reference: new Date().getTime().toString(),
                email: user?.email || '',
                amount: data.amount * 100,
                publicKey: paymentSettings.paystackPublicKey,
            }
        });
    };

    return (
        <>
            <DrawerHeader>
                <DrawerTitle>Fund Wallet</DrawerTitle>
                <DrawerDescription>Enter the amount you want to add to your wallet.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="fund-wallet-form" className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount (₦)</FormLabel>
                                    <FormControl><Input type="number" min="100" placeholder="e.g., 5000" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading || !paymentSettings.paystackPublicKey}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Proceed to Payment'}
                        </Button>
                    </form>
                </Form>
            </DrawerBody>
        </>
    );
};

const WithdrawDialogContent = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
    const { user, firestore } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof withdrawSchema>>({
        resolver: zodResolver(withdrawSchema),
        defaultValues: { amount: 500, pin: "" },
    });

    const onSubmit = async (data: z.infer<typeof withdrawSchema>) => {
        if (!user) return;
        if (!user.walletPin) {
            toast.error("PIN Not Set", {
                description: "Please create a wallet PIN before making a withdrawal.",
                action: {
                    label: "Create PIN",
                    onClick: () => router.push('/dashboard/wallet/pin'),
                },
            });
            setOpen(false);
            return;
        }
        if (data.amount > (user.walletBalance || 0)) {
            toast.error("Insufficient Funds", { description: "Withdrawal amount cannot be more than your balance." });
            return;
        }
        setIsLoading(true);

        const isPinValid = bcrypt.compareSync(data.pin, user.walletPin);
        if (!isPinValid) {
            toast.error("Invalid PIN", { description: "The PIN you entered is incorrect." });
            setIsLoading(false);
            return;
        }

        const requestData = {
            driverId: user.id,
            driverName: user.name,
            amount: data.amount,
            reason: 'User wallet withdrawal',
            requestedAt: serverTimestamp(),
            status: 'pending',
        };
        const requestsRef = collection(firestore, `fundRequests`);
        
        try {
            await addDoc(requestsRef, requestData);
            toast.success("Withdrawal Request Sent", { description: "Your request is being processed and will be reviewed by an admin." });
            setOpen(false);
        } catch (error) {
            toast.error('Error', { description: 'Could not submit your withdrawal request.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <>
            <DrawerHeader>
                <DrawerTitle>Withdraw Funds</DrawerTitle>
                 <DrawerDescription>Enter the amount to withdraw and your PIN to confirm.</DrawerDescription>
            </DrawerHeader>
             <DrawerBody>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="withdraw-form" className="space-y-4 pt-4">
                        <FormField control={form.control} name="amount" render={({ field }) => (
                            <FormItem><FormLabel>Amount (₦)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
                        )}/>
                        <FormField control={form.control} name="pin" render={({ field }) => (
                             <FormItem><FormLabel>Wallet PIN</FormLabel><FormControl><Input type="password" maxLength={4} {...field} /></FormControl><FormMessage/></FormItem>
                        )}/>
                        <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                             {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm Withdrawal'}
                        </Button>
                    </form>
                </Form>
            </DrawerBody>
        </>
    )
};


export const WalletCard = () => {
    const { user } = useAuth();
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const [fundWalletOpen, setFundWalletOpen] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    
    const formattedBalance = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
    }).format(user?.walletBalance || 0);

    return (
        <Card className="relative overflow-hidden bg-primary/5 border-primary/20 shadow-lg">
            <div className="absolute -top-4 -right-4 w-24 h-24 text-primary/10 pointer-events-none">
                <Wallet className="w-full h-full" strokeWidth={1} />
            </div>
            <CardContent className="p-6 space-y-4 relative z-10">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Wallet Balance</p>
                        <p className="text-3xl font-bold tracking-tight mt-1">
                            {isBalanceVisible ? formattedBalance : '∗∗∗∗∗∗∗'}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 relative z-20">
                         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsBalanceVisible(!isBalanceVisible)}>
                            {isBalanceVisible ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                        </Button>
                         <Link href="/dashboard/wallet">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                     <ResponsiveDialog
                        open={fundWalletOpen}
                        onOpenChange={setFundWalletOpen}
                        trigger={
                            <Button variant="outline" className="h-12 bg-card/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10">
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Fund Wallet
                            </Button>
                        }
                    >
                        <FundWalletDialogContent setOpen={setFundWalletOpen} />
                    </ResponsiveDialog>
                    <ResponsiveDialog
                        open={withdrawOpen}
                        onOpenChange={setWithdrawOpen}
                        trigger={
                            <Button variant="outline" className="h-12 bg-card/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10">
                                <ArrowDownCircle className="mr-2 h-5 w-5" />
                                Withdraw
                            </Button>
                        }
                    >
                        <WithdrawDialogContent setOpen={setWithdrawOpen} />
                    </ResponsiveDialog>
                </div>
            </CardContent>
        </Card>
    );
}
