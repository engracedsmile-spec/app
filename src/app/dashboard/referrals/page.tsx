
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Gift, UserPlus, Copy, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Preloader } from "@/components/preloader";
import { SubHeader } from "@/components/sub-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoc } from "@/firebase/firestore/use-collection";
import type { User } from "@/lib/data";

const StatCard = ({ title, value, icon: Icon, loading }: { title: string, value: string, icon: React.ElementType, loading: boolean }) => (
    <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{value}</div>}
        </CardContent>
    </Card>
);

export default function ReferralsPage() {
    const router = useRouter();
    const { user: authUser, loading: authLoading } = useAuth();
    const { data: user, loading: userLoading } = useDoc<User>(authUser ? `users/${authUser.id}` : null);
    const [referralLink, setReferralLink] = useState("");

    const loading = authLoading || userLoading;

    useEffect(() => {
        if (user?.referralCode) {
            setReferralLink(`${window.location.origin}/signup?ref=${user.referralCode}`);
        }
    }, [user]);
    
    if (loading || !user) {
        return <Preloader />
    }

    const copyToClipboard = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        toast.success("Referral Link Copied!");
    };
    
    const handleShare = async () => {
        if (!referralLink) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join me on Engraced Smiles!',
                    text: `Sign up for Engraced Smiles using my link and get a bonus!`,
                    url: referralLink,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            copyToClipboard();
            toast.info("Sharing not supported, link copied instead.");
        }
    };

    return (
        <>
            <SubHeader title="Refer & Earn"/>
            <main className="p-4 md:p-6 space-y-6">
                <Card>
                    <CardHeader className="items-center text-center">
                        <Gift className="h-12 w-12 text-primary mx-auto mb-2"/>
                        <CardTitle>Invite Friends, Get Rewarded</CardTitle>
                        <CardDescription>Share your unique referral link. When your friend signs up, you both get a bonus in your wallet!</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <StatCard title="Your Referrals" value={user?.referralCount?.toString() || '0'} icon={UserPlus} loading={loading} />
                        
                        <div>
                            <p className="text-sm font-semibold mb-2">Your Unique Referral Link</p>
                            <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                                {loading || !referralLink ? <Skeleton className="h-5 w-full" /> : referralLink}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={copyToClipboard} className="h-12 text-base" disabled={!referralLink}>
                                <Copy className="mr-2 h-4 w-4"/> Copy Link
                            </Button>
                            <Button onClick={handleShare} className="h-12 text-base" disabled={!referralLink}>
                                <Share2 className="mr-2 h-4 w-4"/> Share
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
