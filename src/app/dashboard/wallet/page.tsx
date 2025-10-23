
"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { WalletCard } from "@/components/wallet-card";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getFirestore, collection, query, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';
import type { Transaction } from "@/lib/data";
import { SubHeader } from "@/components/sub-header";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
    const isCredit = transaction.type === 'credit';
    const amountColor = isCredit ? 'text-green-400' : 'text-red-400';
    const Icon = isCredit ? ArrowUpCircle : ArrowDownCircle;
    const date = transaction.date ? new Date((transaction.date as any).seconds * 1000).toLocaleDateString() : 'N/A';

    return (
        <div className="flex items-center p-4">
            <div className={cn("flex items-center justify-center h-10 w-10 rounded-full mr-4", isCredit ? "bg-green-500/10" : "bg-red-500/10")}>
                 <Icon className={cn("h-5 w-5", isCredit ? "text-green-500" : "text-red-500")} />
            </div>
            <div className="flex-1">
                <p className="font-semibold">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">{date} &bull; <span className="capitalize">{transaction.status}</span></p>
            </div>
            <p className={`font-bold ${amountColor}`}>
                {isCredit ? '+' : '-'}
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(transaction.amount)}
            </p>
        </div>
    )
}

export default function WalletPage() {
    const { user, firestore } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const transactionsRef = collection(firestore, `users/${user.id}/transactions`);
        const q = query(transactionsRef, orderBy('date', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTransactions: Transaction[] = [];
            snapshot.forEach((doc) => {
                fetchedTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
            });
            setTransactions(fetchedTransactions);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching transactions in real-time:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, firestore]);

    return (
        <>
            <SubHeader title="My Wallet" />
            <main className="p-4 md:p-6 space-y-8">
                <WalletCard />
                
                <Card>
                    <CardHeader>
                        <CardTitle>Wallet Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/wallet/pin">
                             <div className="flex items-center p-4 rounded-lg hover:bg-muted cursor-pointer -m-4">
                                <Settings className="h-5 w-5 mr-4 text-muted-foreground" />
                                <span className="font-semibold">Manage PIN</span>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                <div>
                    <h2 className="text-lg font-semibold tracking-tight mb-4 px-1">Transaction History</h2>
                    <Card>
                        <CardContent className="p-0">
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
                                <p className="text-muted-foreground text-center p-8">No transactions yet. Fund your wallet to get started.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}
