
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Plus, Fuel } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from "@/firebase";
import type { Expense, FundRequest } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerBody, DrawerFooter, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubHeader } from "@/components/sub-header";

const expenseSchema = z.object({
  type: z.enum(["Fuel", "Repair", "Toll", "Other"]),
  amount: z.coerce.number().min(1, "Amount must be greater than 0."),
  description: z.string().min(3, "Please provide a brief description."),
});

const fundRequestSchema = z.object({
    amount: z.coerce.number().min(1, "Amount must be greater than 0."),
    reason: z.string().min(3, "Please provide a brief reason for the request.")
})

const AddExpenseDialog = ({ onComplete }: { onComplete: () => void }) => {
    const [open, setOpen] = useState(false);
    const { firebaseUser } = useAuth();
    const form = useForm<z.infer<typeof expenseSchema>>({
        resolver: zodResolver(expenseSchema),
        defaultValues: { type: "Fuel", amount: 0, description: "" },
    });

    const onSubmit = async (data: z.infer<typeof expenseSchema>) => {
        if (!firebaseUser) {
            toast.error("You must be logged in to submit an expense.");
            return;
        }

        try {
            const idToken = await firebaseUser.getIdToken();
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to log expense.');
            }
            
            toast.success("Expense Logged", { description: "Your expense has been submitted for review." });
            onComplete();
            setOpen(false);
            form.reset();

        } catch (error: any) {
            toast.error("Error", { description: error.message });
        }
    };
    
    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen} trigger={
            <Button><Plus className="mr-2 h-4 w-4" /> Log Expense</Button>
        }>
            <DrawerHeader>
                <DrawerTitle>Log a New Expense</DrawerTitle>
                <DrawerDescription>
                   Submit a new expense for administrative review.
                </DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="add-expense-form" className="space-y-4">
                       <FormField control={form.control} name="type" render={({ field }) => (
                           <FormItem><FormLabel>Expense Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Fuel">Fuel</SelectItem><SelectItem value="Repair">Repair</SelectItem><SelectItem value="Toll">Toll Fee</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage/></FormItem>
                       )}/>
                       <FormField control={form.control} name="amount" render={({ field }) => (
                           <FormItem><FormLabel>Amount (₦)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
                       )}/>
                       <FormField control={form.control} name="description" render={({ field }) => (
                           <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g., Fuel top-up at Owerri" {...field} /></FormControl><FormMessage/></FormItem>
                       )}/>
                    </form>
                </Form>
            </DrawerBody>
            <DrawerFooter>
                <Button type="submit" form="add-expense-form">Submit for Approval</Button>
            </DrawerFooter>
        </ResponsiveDialog>
    )
}

const AddFundRequestDialog = ({ onComplete }: { onComplete: () => void }) => {
    const [open, setOpen] = useState(false);
    const { firebaseUser } = useAuth();
    const form = useForm<z.infer<typeof fundRequestSchema>>({
        resolver: zodResolver(fundRequestSchema),
        defaultValues: { amount: 0, reason: "" },
    });

    const onSubmit = async (data: z.infer<typeof fundRequestSchema>) => {
        if (!firebaseUser) {
             toast.error("You must be logged in to request funds.");
            return;
        }
        
        try {
            const idToken = await firebaseUser.getIdToken();
            const response = await fetch('/api/fund-requests', {
                 method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(data),
            });
            
             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit request.');
            }
            
            toast.success("Request Sent", { description: "Your fund request has been submitted for review." });
            onComplete();
            setOpen(false);
            form.reset();
        } catch (error: any) {
            toast.error("Error", { description: error.message });
        }
    };
    
    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen} trigger={
            <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Request Funds</Button>
        }>
            <DrawerHeader>
                <DrawerTitle>Request Operational Funds</DrawerTitle>
                <DrawerDescription>
                   Submit a new fund request for administrative review.
                </DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="add-fund-request-form" className="space-y-4">
                       <FormField control={form.control} name="amount" render={({ field }) => (
                           <FormItem><FormLabel>Amount (₦)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
                       )}/>
                       <FormField control={form.control} name="reason" render={({ field }) => (
                           <FormItem><FormLabel>Reason</FormLabel><FormControl><Textarea placeholder="e.g., For upcoming trip fuel" {...field} /></FormControl><FormMessage/></FormItem>
                       )}/>
                    </form>
                </Form>
            </DrawerBody>
             <DrawerFooter>
                <Button type="submit" form="add-fund-request-form">Submit Request</Button>
            </DrawerFooter>
        </ResponsiveDialog>
    )
}

const StatusBadge = ({ status }: { status: string }) => {
    const variants: { [key: string]: string } = {
        'pending': 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10',
        'approved': 'text-green-500 border-green-500/50 bg-green-500/10',
        'rejected': 'text-red-500 border-red-500/50 bg-red-500/10',
    };
    return <Badge variant="outline" className={variants[status]}>{status}</Badge>;
}

export default function DriverExpensesPage() {
    const { user, firebaseUser } = useAuth();
    const firestore = useFirestore();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [requests, setRequests] = useState<FundRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const expensesQuery = query(collection(firestore, 'expenses'), where("driverId", "==", user.id), orderBy("date", "desc"));
        const requestsQuery = query(collection(firestore, 'fundRequests'), where("driverId", "==", user.id), orderBy("requestedAt", "desc"));

        const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
            setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
            setLoading(false);
        });

        const unsubRequests = onSnapshot(requestsQuery, (snapshot) => {
            setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FundRequest)));
            setLoading(false);
        });

        return () => {
            unsubExpenses();
            unsubRequests();
        }
    }, [user, firestore]);
    
    return (
        <>
            <SubHeader title="Expenses & Requests" />
            <main className="p-4 md:p-6">
                 <Tabs defaultValue="expenses" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="expenses">My Expenses</TabsTrigger>
                        <TabsTrigger value="requests">My Fund Requests</TabsTrigger>
                    </TabsList>
                    <TabsContent value="expenses" className="mt-4">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle>Expense History</CardTitle>
                                    <CardDescription>A log of all your submitted operational expenses.</CardDescription>
                                </div>
                                <AddExpenseDialog onComplete={() => {}} />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loading ? <Skeleton className="h-24 w-full" /> : expenses.map(exp => (
                                    <Card key={exp.id} className="bg-muted/50">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-full">
                                                <Fuel className="h-6 w-6 text-primary"/>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold">{exp.type} - {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(exp.amount)}</p>
                                                <p className="text-sm text-muted-foreground">{exp.description}</p>
                                            </div>
                                            <StatusBadge status={exp.status} />
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="requests" className="mt-4">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle>Fund Request History</CardTitle>
                                    <CardDescription>A log of all your submitted fund requests.</CardDescription>
                                </div>
                                <AddFundRequestDialog onComplete={() => {}} />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loading ? <Skeleton className="h-24 w-full" /> : requests.map(req => (
                                    <Card key={req.id} className="bg-muted/50">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="flex-1">
                                                <p className="font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(req.amount)}</p>
                                                <p className="text-sm text-muted-foreground">{req.reason}</p>
                                            </div>
                                            <StatusBadge status={req.status} />
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </>
    )
}
