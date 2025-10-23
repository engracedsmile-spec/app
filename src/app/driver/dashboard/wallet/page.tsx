
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { Transaction } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
    const isCredit = transaction.type === 'credit';
    const amountColor = isCredit ? 'text-green-400' : 'text-foreground';
    const Icon = isCredit ? ArrowUpCircle : ArrowDownCircle;

    const date = transaction.date ? new Date((transaction.date as Timestamp).seconds * 1000).toLocaleDateString() : 'N/A';

    return (
        <div className="flex items-center p-4">
            <div className={cn("flex items-center justify-center h-10 w-10 rounded-full mr-4", isCredit ? "bg-green-500/10" : "bg-muted")}>
                 <Icon className={cn("h-5 w-5", isCredit ? "text-green-500" : "text-muted-foreground")} />
            </div>
            <div className="flex-1">
                <p className="font-semibold">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">{date}</p>
            </div>
            <p className={`font-bold ${amountColor}`}>
                {isCredit ? '+' : '-'}
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(transaction.amount)}
            </p>
        </div>
    )
}

const DriverWalletCard = () => {
    const { user } = useAuth();
    const router = useRouter();
    const formattedBalance = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
    }).format(user?.walletBalance || 0);

    return (
        <Card className="relative overflow-hidden bg-primary/5 border-primary/20 shadow-lg">
             <div className="absolute -top-4 -right-4 w-24 h-24 text-primary/10">
                <Wallet className="w-full h-full" strokeWidth={1} />
            </div>
             <CardContent className="p-6 space-y-4 relative z-10">
                 <div>
                    <p className="text-sm text-muted-foreground font-medium">Available Balance</p>
                    <p className="text-3xl font-bold tracking-tight mt-1">{formattedBalance}</p>
                 </div>
                 <Button className="w-full h-12 text-base" onClick={() => router.push('/driver/dashboard/expenses')}>
                    <ArrowDownCircle className="mr-2 h-5 w-5"/>
                    Request Withdrawal
                </Button>
            </CardContent>
        </Card>
    )
}


export default function RiderWalletPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const db = getFirestore(firebaseApp);
        const transactionsRef = collection(db, `users/${user.id}/transactions`);
        const q = query(transactionsRef, orderBy('date', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTransactions: Transaction[] = [];
            snapshot.forEach((doc) => {
                fetchedTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
            });
            setTransactions(fetchedTransactions);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching transactions: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <header className="flex items-center justify-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 absolute left-4">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">My Earnings</h1>
            </header>
            <ScrollArea className="flex-1">
                <main className="p-4 md:p-6 space-y-8">
                    <DriverWalletCard />
                    
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight mb-4">Payout History</h2>
                        <Card>
                            {loading ? (
                                <div className="space-y-2 p-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-4 p-2">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                            <Skeleton className="h-5 w-20" />
                                        </div>
                                    ))}
                                </div>
                            ) : transactions.length > 0 ? (
                                <div className="divide-y divide-border/50">
                                    {transactions.map(tx => (
                                        <TransactionItem key={tx.id} transaction={tx} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-muted-foreground">
                                    <Wallet className="h-16 w-16 mx-auto text-primary/20"/>
                                    <p className="text-lg font-semibold mt-4">No Payout History</p>
                                    <p className="mt-1">Your completed payouts will appear here.</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </main>
            </ScrollArea>
        </div>
    );
}
