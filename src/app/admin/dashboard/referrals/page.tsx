
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Gift, Share2, TrendingUp, Users, Wallet, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { User, Transaction } from "@/lib/data";
import { SubHeader } from "@/components/sub-header";
import { collection, query, where, orderBy, onSnapshot, limit, getDocs, collectionGroup } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const StatCard = ({ title, value, icon: Icon, loading }: { title: string, value: string, icon: React.ElementType, loading: boolean }) => (
    <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{value}</div>}
        </CardContent>
    </Card>
);

export default function ReferralsAnalyticsPage() {
    const router = useRouter();
    const { firestore } = useAuth();
    const [loading, setLoading] = useState(true);
    const [referralTransactions, setReferralTransactions] = useState<Transaction[]>([]);
    const [topReferrers, setTopReferrers] = useState<User[]>([]);

    useEffect(() => {
        const referralBonusPrefix = 'Referral bonus';
        const endPrefix = referralBonusPrefix + '\uf8ff';

        // This query is more efficient if you have a composite index on (description, date)
        const transactionsQuery = query(
            collectionGroup(firestore, 'transactions'),
            where('description', '>=', referralBonusPrefix),
            where('description', '<', endPrefix),
            orderBy('description'),
            orderBy('date', 'desc')
        );

        const usersQuery = query(
            collection(firestore, 'users'),
            where('referralCount', '>', 0),
            orderBy('referralCount', 'desc'),
            limit(5)
        );

        const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
            setReferralTransactions(snapshot.docs.map(doc => doc.data() as Transaction));
            setLoading(false);
        }, (error) => {
             console.error("Error fetching referral transactions:", error);
             setLoading(false);
        });

        const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
            setTopReferrers(snapshot.docs.map(doc => doc.data() as User));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching top referrers:", error);
            setLoading(false);
        });

        return () => {
            unsubTransactions();
            unsubUsers();
        };

    }, [firestore]);
    
    const totalBonusPaid = useMemo(() => {
        return referralTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    }, [referralTransactions]);

    const totalReferrals = useMemo(() => {
        // Summing up from top referrers list. For a full count, a separate aggregation would be needed.
        return topReferrers.reduce((acc, user) => acc + (user.referralCount || 0), 0);
    }, [topReferrers])

    return (
        <>
            <SubHeader title="Referral Analytics">
                 <div className="flex items-center gap-2">
                    <Button asChild variant="outline"><Link href="/admin/dashboard/payouts"><DollarSign className="mr-2 h-4 w-4"/> Manage Payouts</Link></Button>
                    <Button asChild variant="outline"><Link href="/admin/dashboard/settings/referrals"><Share2 className="mr-2 h-4 w-4"/> Referral Settings</Link></Button>
                 </div>
            </SubHeader>
            <main className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard title="Total Referrals Tracked" value={totalReferrals.toString()} icon={Users} loading={loading} />
                    <StatCard title="Total Bonus Paid" value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalBonusPaid)} icon={Wallet} loading={loading} />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Referrers</CardTitle>
                            <CardDescription>Users who have referred the most new customers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead className="text-right">Referrals</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? Array.from({length: 3}).map((_, i) => <TableRow key={i}><TableCell colSpan={2}><Skeleton className="h-12 w-full"/></TableCell></TableRow>) :
                                     topReferrers.length > 0 ? topReferrers.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8"><AvatarImage src={user.profilePictureUrl} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar>
                                                {user.name}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">{user.referralCount || 0}</TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={2} className="text-center h-24">No referral data yet.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Recent Referral Payouts</CardTitle>
                             <CardDescription>A log of the most recent referral bonuses paid out.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                     {loading ? Array.from({length: 3}).map((_, i) => <TableRow key={i}><TableCell colSpan={2}><Skeleton className="h-12 w-full"/></TableCell></TableRow>) :
                                      referralTransactions.length > 0 ? referralTransactions.slice(0, 5).map(tx => (
                                        <TableRow key={tx.id}>
                                            <TableCell>
                                                {tx.description}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-green-500">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(tx.amount)}</TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={2} className="text-center h-24">No referral payouts yet.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

            </main>
        </>
    );
}

    