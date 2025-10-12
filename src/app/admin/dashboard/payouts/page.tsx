
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { collection, query, where, orderBy, doc, updateDoc, writeBatch, onSnapshot, getDocs, runTransaction, FieldValue, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from "@/firebase";
import type { FundRequest, User } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PERMISSIONS } from "@/lib/permissions";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AdminHelp } from "../help";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubHeader } from "@/components/sub-header";


const StatusBadge = ({ status }: { status: string }) => {
    const variants: { [key: string]: string } = {
        'pending': 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10',
        'approved': 'text-green-500 border-green-500/50 bg-green-500/10',
        'rejected': 'text-red-500 border-red-500/50 bg-red-500/10',
    };
    return <Badge variant="outline" className={variants[status]}>{status}</Badge>;
}

export default function PayoutsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const firestore = useFirestore();

    const [requests, setRequests] = useState<FundRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const userRole = user?.role || 'Support';
    const canManage = PERMISSIONS[userRole]?.includes('managePayouts');

     useEffect(() => {
        if (!canManage) {
            toast.error("Permission Denied", { description: "You don't have sufficient permissions to view this page." });
            router.push('/admin/dashboard');
            return;
        }

        const requestsQuery = query(collection(firestore, 'fundRequests'), orderBy('requestedAt', 'desc'));
        const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
            setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FundRequest)));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [canManage, firestore, router]);


    const handlePayoutAction = async (request: FundRequest, newStatus: 'approved' | 'rejected') => {
        const requestRef = doc(firestore, 'fundRequests', request.id);
        
        try {
            if (newStatus === 'approved') {
                 await runTransaction(firestore, async (transaction) => {
                    const userRef = doc(firestore, 'users', request.driverId);
                    const userDoc = await transaction.get(userRef);
                    if (!userDoc.exists()) throw new Error("User not found");
                    
                    const currentBalance = userDoc.data().walletBalance || 0;
                    if (currentBalance < request.amount) throw new Error("User has insufficient funds for this payout.");
                    
                    // 1. Update user's wallet balance
                    transaction.update(userRef, { walletBalance: FieldValue.increment(-request.amount) });

                    // 2. Mark the fund request as approved
                    transaction.update(requestRef, { status: 'approved' });

                    // 3. Create a debit transaction record for the user
                    const transactionRef = doc(collection(firestore, `users/${request.driverId}/transactions`));
                    transaction.set(transactionRef, {
                        id: transactionRef.id,
                        userId: request.driverId,
                        type: 'debit',
                        amount: request.amount,
                        description: `Wallet withdrawal`,
                        date: serverTimestamp(),
                        status: 'completed',
                        reference: request.id,
                    });
                });

            } else { // It's a rejection
                await updateDoc(requestRef, { status: newStatus });
            }
            toast.success(`Request ${newStatus}`);
        } catch (error: any) {
             console.error(`Failed to process payout request:`, error);
             toast.error("Action Failed", { description: error.message || 'Could not update the payout request.'});
        }
    }
    
    if (!canManage) {
        return null;
    }

    const pendingRequests = useMemo(() => requests.filter(r => r.status === 'pending'), [requests]);
    const processedRequests = useMemo(() => requests.filter(r => r.status !== 'pending'), [requests]);

    return (
        <>
            <SubHeader title="Payouts & Requests">
                <AdminHelp page="payouts" />
            </SubHeader>
            <main className="p-4 md:p-6">
                 <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Withdrawal Requests</CardTitle>
                                <CardDescription>Review and approve/reject fund requests from users.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loading ? <Skeleton className="h-24 w-full" /> : pendingRequests.length > 0 ? pendingRequests.map((req: FundRequest) => (
                                    <Card key={req.id} className="bg-muted/50">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="flex-1 space-y-1">
                                                <p className="font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(req.amount)}</p>
                                                <p className="text-sm text-muted-foreground">{req.reason}</p>
                                                <p className="text-xs text-muted-foreground">{req.driverName} &bull; {req.requestedAt ? new Date((req.requestedAt as any)?.toDate()).toLocaleDateString() : ''}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={req.status}/>
                                                <ResponsiveDialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={e => e.preventDefault()}>Approve</DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handlePayoutAction(req, 'rejected')}>Reject</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <DrawerHeader>
                                                        <DrawerTitle>Approve Payout?</DrawerTitle>
                                                        <DrawerDescription>This will deduct {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(req.amount)} from the user's wallet and mark this request as complete. This action cannot be undone.</DrawerDescription>
                                                    </DrawerHeader>
                                                    <DrawerFooter>
                                                        <AlertDialogAction onClick={() => handlePayoutAction(req, 'approved')}>Yes, Approve</AlertDialogAction>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    </DrawerFooter>
                                                </ResponsiveDialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )) : <p className="text-center text-muted-foreground py-8">No pending requests.</p>}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Processed Requests</CardTitle>
                                <CardDescription>A history of all approved and rejected requests.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loading ? <Skeleton className="h-24 w-full" /> : processedRequests.length > 0 ? processedRequests.map((req: FundRequest) => (
                                    <Card key={req.id} className="bg-muted/50">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="flex-1 space-y-1">
                                                <p className="font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(req.amount)}</p>
                                                <p className="text-sm text-muted-foreground">{req.reason}</p>
                                                <p className="text-xs text-muted-foreground">{req.driverName} &bull; {req.requestedAt ? new Date((req.requestedAt as any)?.toDate()).toLocaleDateString() : ''}</p>
                                            </div>
                                            <StatusBadge status={req.status}/>
                                        </CardContent>
                                    </Card>
                                )) : <p className="text-center text-muted-foreground py-8">No processed requests yet.</p>}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </>
    )
}
