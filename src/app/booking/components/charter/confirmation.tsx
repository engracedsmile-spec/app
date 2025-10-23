

"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Calendar, User, Car, Hash, ChevronRight, Tag, CreditCard, Sparkles } from "lucide-react";
import type { BookingFormData } from "../../booking-flow";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const DetailCard = ({ icon, title, value, onEdit, children }: { icon: React.ReactNode, title: string, value?: string, onEdit?: () => void, children?: React.ReactNode }) => (
    <div onClick={onEdit} className={cn("flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border/50", onEdit && "cursor-pointer hover:bg-muted")}>
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div className="flex-1">
            <p className="font-bold">{title}</p>
            {value && <p className="text-sm text-muted-foreground">{value}</p>}
            {children}
        </div>
         {onEdit && <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />}
    </div>
);

interface CharterConfirmationProps {
  data: BookingFormData;
  onConfirm: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
  isCalculatingPrice: boolean;
  onCouponChange: (coupon: string) => void;
}

export const CharterConfirmation = ({ data, onConfirm, onBack, onEdit, isCalculatingPrice, onCouponChange }: CharterConfirmationProps) => {
  const basePrice = data.charterBasePrice || 0;
  const dailyRate = data.charterDailyRate || 0;
  const days = data.charterDays || 1;
  const optionalFeatures = data.features?.filter(f => f.status === 'optional' && (f as any).selected) || [];
  const addonsPrice = optionalFeatures.reduce((acc, feat) => acc + feat.price, 0);

  const finalPrice = data.price || 0;

  return (
    <div className="h-full flex flex-col bg-card">
        <main className="flex-1 space-y-4 p-4 md:p-6 overflow-y-auto">
            <DetailCard
                icon={<Car className="text-primary h-6 w-6" />}
                title={data.charterPackageName || "Charter Package"}
                value="Your selected premium package."
                onEdit={() => onEdit(0)}
            />
            <DetailCard
                icon={<User className="text-primary h-6 w-6" />}
                title={data.passengerName || "Booking Contact"}
                value={data.passengerPhone || "Not set"}
                onEdit={() => onEdit(1)}
            />
            <DetailCard
                icon={<Calendar className="text-primary h-6 w-6" />}
                title="Trip Start Date"
                value={data.travelDate ? new Date(data.travelDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}) : "Not set"}
                onEdit={() => onEdit(1)}
            />
            <DetailCard
                icon={<Hash className="text-primary h-6 w-6" />}
                title="Duration"
                value={`${data.charterDays || 1} day(s)`}
                onEdit={() => onEdit(1)}
            />
            {optionalFeatures.length > 0 && (
                <DetailCard
                    icon={<Sparkles className="text-primary h-6 w-6" />}
                    title="Selected Add-ons"
                    onEdit={() => onEdit(1)}
                >
                    <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                        {optionalFeatures.map(f => (
                             <li key={f.id} className="flex justify-between">
                                <span>{f.name}</span>
                                <span className="font-semibold text-foreground/80">+ {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN'}).format(f.price)}</span>
                             </li>
                        ))}
                    </ul>
                </DetailCard>
            )}
             <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-2">
                <label className="font-bold flex items-center gap-2"><Tag className="text-primary h-5 w-5" /> Coupon Code</label>
                <Input placeholder="Enter coupon code (optional)" onChange={(e) => onCouponChange(e.target.value)} defaultValue={data.couponCode} />
            </div>
        </main>
        <footer className="p-4 border-t border-border/50 bg-card space-y-3 shrink-0">
             <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Quoted Fare</p>
                <p className="text-3xl font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN'}).format(finalPrice)}</p>
                <p className="text-xs text-muted-foreground">
                    (Base: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN'}).format(basePrice)}
                    {days > 1 && ` + ${days - 1} extra day(s)`}
                    {addonsPrice > 0 && ` + Add-ons`}
                    )
                </p>
            </div>
            <Button onClick={onConfirm} className="h-14 w-full text-lg font-bold" disabled={isCalculatingPrice}>
                {isCalculatingPrice ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</>
                ) : (
                    "Confirm & Get Quote"
                )}
            </Button>
        </footer>
    </div>
  );
};
