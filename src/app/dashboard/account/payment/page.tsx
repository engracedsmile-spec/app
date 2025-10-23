
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { WalletCard } from "../../wallet-card";

export default function PaymentMethodsPage() {
    const router = useRouter();
    
    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <header className="flex items-center justify-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 absolute left-4">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Payment Methods</h1>
            </header>

            <main className="flex-1 p-4 md:p-6 space-y-8 overflow-y-auto">
                <WalletCard />
            </main>
        </div>
    );
}
