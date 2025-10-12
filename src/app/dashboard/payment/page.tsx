"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { WalletCard } from "@/components/wallet-card";
import { SubHeader } from "@/components/sub-header";

export default function PaymentMethodsPage() {
    const router = useRouter();
    
    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <SubHeader title="Payment Methods" />
            <main className="flex-1 p-4 md:p-6 space-y-8 overflow-y-auto">
                <WalletCard />
            </main>
        </div>
    );
}
