/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2, Armchair, Tag } from "lucide-react";
import type { BookingFormData } from "../../booking/booking-flow";
import { Car, CreditCard, Calendar, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ConfirmationProps {
  data: BookingFormData;
  onConfirm: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
  isCalculatingPrice: boolean;
  onCouponChange: (coupon: string) => void;
}

const DetailCard = ({ icon, title, value, onEdit }: { icon: React.ReactNode, title: string, value: string, onEdit?: () => void }) => (
    <div onClick={onEdit} className={cn("flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border/50", onEdit && "cursor-pointer hover:bg-muted")}>
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div className="flex-1">
            <p className="font-bold">{title}</p>
            {value && <p className="text-sm text-muted-foreground">{value}</p>}
        </div>
        {onEdit && <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />}
    </div>
);


export const Confirmation = ({ data, onConfirm, onBack, onEdit, isCalculatingPrice, onCouponChange }: ConfirmationProps) => {
    
  const canConfirm = data.paymentMethod && data.seats && data.seats.length > 0;
  
  let seatsDisplay;
  if(data.bookingType === 'charter') {
      seatsDisplay = "Entire Vehicle (Charter)"
  } else {
      seatsDisplay = data.seats && data.seats.length > 0 ? `Seat${data.seats.length > 1 ? 's' : ''} ${data.seats.join(', ')}` : "No seat selected";
  }
  
  const finalPrice = data.price || 0;
  
  const allPassengers = [data.passengerName, ...(data.passengers?.map(p => p.name) || [])].filter(Boolean);

  return (
    <div className="h-full flex flex-col bg-card">
        <main className="flex-1 space-y-4 p-4 md:p-6 overflow-y-auto">
            <DetailCard
                icon={<User className="text-primary h-6 w-6" />}
                title="Passengers"
                value={allPassengers.join(', ') || "Not set"}
                onEdit={() => onEdit(2)}
            />
            {data.bookingType !== 'charter' && (
                <>
                    <DetailCard
                        icon={<MapPin className="text-primary h-6 w-6" />}
                        title={"Pickup"}
                        value={data.pickupAddress || "Not set"}
                        onEdit={() => onEdit(0)}
                    />
                    <DetailCard
                        icon={<MapPin className="text-primary h-6 w-6" />}
                        title={"Destination"}
                        value={data.destinationAddress || "Not set"}
                        onEdit={() => onEdit(0)}
                    />
                </>
            )}
             <DetailCard
                icon={<Calendar className="text-primary h-6 w-6"/>}
                title="Travel Date"
                value={data.travelDate ? new Date(data.travelDate).toLocaleString('en-US', { dateStyle: 'full' }) : "Not set"}
                onEdit={() => onEdit(0)}
            />
             <DetailCard
                icon={<Armchair className="text-primary h-6 w-6"/>}
                title={seatsDisplay}
                value={`${allPassengers.length} passenger(s)`}
                onEdit={() => onEdit(2)}
            />
             <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-2">
                <label className="font-bold flex items-center gap-2"><Tag className="text-primary h-5 w-5" /> Coupon Code</label>
                <Input placeholder="Enter coupon code (optional)" onChange={(e) => onCouponChange(e.target.value)} defaultValue={data.couponCode} />
            </div>
             <DetailCard
                icon={<CreditCard className="text-primary h-6 w-6" />}
                title={data.paymentMethod || "Choose payment method"}
                value=""
                onEdit={() => onEdit(2)}
            />
        </main>
        <footer className="p-4 border-t border-border/50 bg-card space-y-3 shrink-0">
             <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Fare</p>
                <p className="text-3xl font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN'}).format(finalPrice)}</p>
            </div>
            <Button onClick={() => onConfirm()} className="h-14 w-full text-lg font-bold" disabled={isCalculatingPrice || !canConfirm}>
                {isCalculatingPrice ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Confirming...
                    </>
                ) : (
                    "Confirm & Book"
                )}
            </Button>
        </footer>
    </div>
  );
};

/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
    
