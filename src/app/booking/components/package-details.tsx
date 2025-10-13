
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { CreditCard, Wallet, CheckCircle, Lock, User, Phone, ChevronRight, Clock, Armchair, Loader2, AirVent, Wifi, Zap, Music, GlassWater, Cookie, Car } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useFirestore, useDoc } from "@/firebase";
import { doc, onSnapshot, updateDoc, deleteField, Timestamp, FieldValue } from 'firebase/firestore';
import type { ScheduledTrip, Vehicle, VehicleShowcaseImage } from "@/lib/data";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import type { OperationsSettings } from "@/lib/settings";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { RealSeatIcon } from "@/components/icons/real-seat-icon";
import { PhoneInput } from "@/components/ui/phone-input";
import { Skeleton } from "@/components/ui/skeleton";
import { Countdown } from "react-day-picker";

const packageFormSchema = z.object({
  passengerName: z.string().min(2, "Name is required."),
  passengerPhone: z.string().min(10, "Please enter a valid phone number."),
  seats: z.array(z.number()).min(1, "Please select at least one seat."),
  passengers: z.array(z.object({ name: z.string().min(2, "Passenger name is required.") })).optional(),
  paymentMethod: z.string({ required_error: "Please select a payment method." }),
});

export type PackageFormData = z.infer<typeof packageFormSchema>;

interface PackageDetailsProps {
  onNext: (data: PackageFormData) => void;
  onBack: () => void;
  initialData: Partial<PackageFormData>;
  updateFormData: (data: Partial<PackageFormData>) => void;
  scheduledTrip: ScheduledTrip;
  opsSettings: OperationsSettings | null;
  countdown: { days: number; hours: number; minutes: number; seconds: number; isFinished: boolean };
  seatHoldExpires: Date | null;
  setSeatHoldExpires: (date: Date | null) => void;
  currentTripState: ScheduledTrip | null;
  setCurrentTripState: (trip: ScheduledTrip | null) => void;
  guestId: string | null;
}

const Seat = ({ number, label, status, onSelect, className }: { number: number, label: string, status: 'available' | 'taken' | 'selected' | 'held', onSelect: (seat: number) => void, className?: string }) => {
    const baseClasses = "relative flex flex-col items-center justify-center aspect-square w-full rounded-lg font-semibold transition-all duration-200 transform";
    const statusClasses = {
        available: "border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/10 text-muted-foreground cursor-pointer hover:scale-105",
        taken: "bg-muted text-muted-foreground/50 cursor-not-allowed",
        selected: "bg-primary border-primary text-primary-foreground cursor-default scale-110 shadow-lg shadow-primary/40",
        held: "bg-yellow-500/20 text-yellow-500 cursor-not-allowed border-yellow-500/50",
    };
    
    const isSelectable = status === 'available';

    return (
        <button type="button" onClick={() => isSelectable && onSelect(number)} disabled={!isSelectable} className={cn(baseClasses, statusClasses[status], className)}>
            <RealSeatIcon className={cn("w-3/4 h-3/4", status === 'selected' ? 'text-white' : 'text-current')} />
            <span className="text-[10px] sm:text-xs mt-1">{label}</span>
            {status === 'taken' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-3/4 h-0.5 bg-destructive/50 rotate-45 absolute"></div><div className="w-3/4 h-0.5 bg-destructive/50 -rotate-45 absolute"></div></div>}
        </button>
    )
}

const PaymentSheet = ({
    isOpen,
    onOpenChange,
    selectedValue,
    onSelect,
    userBalance,
    isGuest
  }: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    selectedValue: string | undefined;
    onSelect: (value: string) => void;
    userBalance: number;
    isGuest: boolean;
  }) => {
    const paymentOptions = [
        { 
            name: "Wallet", 
            icon: Wallet, 
            details: isGuest ? "Login Required" : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(userBalance),
            disabled: isGuest
        },
        { name: "Pay with Paystack", icon: CreditCard, details: "Card, Bank, or USSD" },
    ];
    
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="rounded-t-2xl bg-card">
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-xl">Choose Payment Method</SheetTitle>
            </SheetHeader>
            <div className="space-y-2">
              {paymentOptions.map((option) => (
                <button
                  type="button"
                  key={option.name}
                  onClick={() => !option.disabled && onSelect(option.name)}
                  disabled={option.disabled}
                  className={cn(
                    "flex w-full items-center rounded-lg p-4 text-left transition-colors hover:bg-muted",
                    selectedValue === option.name && "bg-primary/10 border-primary/50 border",
                    option.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <option.icon className={cn("h-6 w-6 text-primary mr-4", option.disabled && "text-muted-foreground")} />
                  <div className="flex-1">
                    <p className="font-semibold text-base">{option.name}</p>
                    <p className="text-sm text-muted-foreground">{option.details}</p>
                  </div>
                   {option.disabled ? <Lock className="h-5 w-5 text-muted-foreground"/> : (selectedValue === option.name && <CheckCircle className="h-6 w-6 text-primary" />)}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
    )
};

const toJsDate = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) return date;
    }
    if (timestamp.seconds !== undefined && timestamp.nanoseconds !== undefined) {
        return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
    }
    return null;
}

export const PackageDetails = ({ onNext, onBack, initialData, scheduledTrip, opsSettings, updateFormData, countdown, seatHoldExpires, setSeatHoldExpires, currentTripState, setCurrentTripState, guestId }: PackageDetailsProps) => {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [seatToConfirm, setSeatToConfirm] = useState<number | null>(null);
  const [isConfirmingSeat, setIsConfirmingSeat] = useState(false);
  const timerRef = useRef<HTMLDivElement>(null);
  const [isTimerFloating, setIsTimerFloating] = useState(false);
  
  const { data: vehicleShowcaseData, loading: showcaseLoading } = useDoc<{images: VehicleShowcaseImage[]}>('settings/vehicleShowcase');

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: initialData
  });
  
  useEffect(() => {
    form.reset(initialData);
  }, [initialData, form]);

  const selectedSeats = form.watch("seats") || [];
  
  const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "passengers",
  });

  useEffect(() => {
    const numSeats = selectedSeats?.length || 0;
    const requiredPassengers = numSeats > 1 ? numSeats - 1 : 0;

    if (fields.length < requiredPassengers) {
      for (let i = fields.length; i < requiredPassengers; i++) {
        append({ name: "" });
      }
    } else if (fields.length > requiredPassengers) {
      for (let i = fields.length - 1; i >= requiredPassengers; i--) {
        remove(i);
      }
    }
  }, [selectedSeats, fields.length, append, remove]);


  const releaseHolds = useCallback(async (seatsToRelease: number[]) => {
    if (seatsToRelease.length > 0 && firestore) {
      const tripRef = doc(firestore, 'scheduledTrips', scheduledTrip.id);
      const updates: { [key: string]: any } = {};
      seatsToRelease.forEach(seat => {
        updates[`seatHolds.${seat}`] = deleteField();
      });
      try {
        await updateDoc(tripRef, updates);
      } catch (e) {
        console.error("Failed to release holds on cleanup:", e);
      }
    }
  }, [firestore, scheduledTrip.id]);

  const getStatus = useCallback((seatNumber: number): 'available' | 'taken' | 'selected' | 'held' => {
    const trip = currentTripState || scheduledTrip;
    if (trip.bookedSeats?.includes(seatNumber)) return 'taken';
    if (selectedSeats?.includes(seatNumber)) return 'selected';
    
    const holds = trip.seatHolds || {};
    const holdInfo = holds[seatNumber];
    
    if (holdInfo) {
        const expires = toJsDate(holdInfo.expires);
        if (expires && expires > new Date()) {
            return 'held';
        }
    }
    
    return 'available';
  }, [selectedSeats, scheduledTrip, currentTripState]);

  const onSelectSeat = useCallback((seatNumber: number) => {
    const status = getStatus(seatNumber);
    if (status === 'available') {
      setSeatToConfirm(seatNumber);
    } else if (status === 'selected') {
        const newSeats = selectedSeats.filter(s => s !== seatNumber);
        updateFormData({ seats: newSeats });
        releaseHolds([seatNumber]);
    }
  }, [getStatus, selectedSeats, updateFormData, releaseHolds]);

  const handleConfirmSeat = useCallback(async () => {
    if (seatToConfirm === null) return;
    setIsConfirmingSeat(true);

    const tripRef = doc(firestore, 'scheduledTrips', scheduledTrip.id);
    const fieldPath = `seatHolds.${seatToConfirm}`;
    const sessionUserId = user?.id || guestId;
    if (!sessionUserId) {
        toast.error("Session expired", { description: "Please refresh the page and try again."})
        setIsConfirmingSeat(false);
        return;
    }

    try {
        let expirationTime = seatHoldExpires;
        if (!expirationTime || countdown.isFinished) {
            const durationMinutes = opsSettings?.seatHoldDuration || 5;
            expirationTime = new Date(new Date().getTime() + durationMinutes * 60000);
            setSeatHoldExpires(expirationTime);
        }
        await updateDoc(tripRef, { [fieldPath]: { userId: sessionUserId, expires: Timestamp.fromDate(expirationTime) } });
        updateFormData({ seats: [...selectedSeats, seatToConfirm] });
        setSeatToConfirm(null);
    } catch(e) {
      console.error(e)
      toast.error("Seat Selection Failed", { description: "Could not update seat status. Please try again."})
    } finally {
        setIsConfirmingSeat(false);
    }
  }, [seatToConfirm, firestore, scheduledTrip.id, user, guestId, seatHoldExpires, countdown.isFinished, opsSettings, setSeatHoldExpires, updateFormData, selectedSeats]);

  useEffect(() => {
    const tripRef = doc(firestore, 'scheduledTrips', scheduledTrip.id);
    const unsubscribe = onSnapshot(tripRef, (doc) => {
        if(doc.exists()) {
            const tripData = { id: doc.id, ...doc.data() } as ScheduledTrip;
            setCurrentTripState(tripData);
            
            const sessionUserId = user?.id || guestId;

            const validUserHolds = Object.entries(tripData.seatHolds || {})
              .filter(([_, hold]) => {
                  const expires = toJsDate(hold.expires);
                  return hold.userId === sessionUserId && expires && expires > new Date();
              })
              .map(([seatNumber]) => parseInt(seatNumber));

            const currentFormSeats = selectedSeats || [];
            
            if (JSON.stringify(currentFormSeats.sort()) !== JSON.stringify(validUserHolds.sort())) {
                updateFormData({ seats: validUserHolds });
            }
            
            if (validUserHolds.length > 0) {
                const firstHold = tripData.seatHolds?.[validUserHolds[0]];
                const expiration = toJsDate(firstHold?.expires);
                if(expiration && expiration > new Date()){
                    setSeatHoldExpires(expiration);
                }
            } else {
                setSeatHoldExpires(null);
            }
        }
    });
    return () => unsubscribe();
  }, [scheduledTrip.id, firestore, user, guestId, updateFormData, setSeatHoldExpires, selectedSeats, setCurrentTripState]);

  useEffect(() => {
    if (countdown.isFinished && seatHoldExpires) {
        toast.info("Seat hold expired", { description: "Your selected seats have been released." });
        releaseHolds(selectedSeats);
        updateFormData({ seats: [] });
        setSeatHoldExpires(null);
    }
  }, [countdown.isFinished, seatHoldExpires, releaseHolds, updateFormData, selectedSeats]);

  useEffect(() => {
    const observer = new IntersectionObserver(
        ([entry]) => {
            setIsTimerFloating(!entry.isIntersecting);
        },
        { root: null, threshold: 0 }
    );
    const currentTimerRef = timerRef.current;
    if (currentTimerRef) {
        observer.observe(currentTimerRef);
    }
    return () => {
        if (currentTimerRef) {
            observer.unobserve(currentTimerRef);
        }
    };
  }, []);
  
  const onSubmit = useCallback((data: PackageFormData) => {
    updateFormData(data);
    onNext(data);
  }, [onNext, updateFormData]);
  
  const watchPaymentMethod = form.watch("paymentMethod");
  const totalFare = (selectedSeats?.length || 0) * ((currentTripState || scheduledTrip)?.fare || 0);

  return (
    <div className="h-full flex flex-col bg-card">
      {seatHoldExpires && !countdown.isFinished && isTimerFloating && (
          <div className="fixed top-20 right-4 z-50 p-2 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 flex items-center justify-center h-16 w-16 shadow-lg">
              <div className="flex flex-col items-center">
                  <span className="font-bold text-lg leading-none">{countdown.minutes}:{String(countdown.seconds).padStart(2, '0')}</span>
                  <span className="text-[10px]">left</span>
              </div>
          </div>
      )}
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
            <div className="flex-1 space-y-6 p-4 md:p-6 overflow-y-auto">
                
                <div ref={timerRef}>
                  {seatHoldExpires && !countdown.isFinished && (
                      <div className="p-4 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-center">
                          <div className="flex items-center justify-center gap-2 font-bold text-base">
                              <Clock className="h-5 w-5"/> Seats reserved for {countdown.minutes}:{String(countdown.seconds).padStart(2, '0')}
                          </div>
                      </div>
                  )}
                </div>

                <Carousel
                    plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
                    className="w-full"
                >
                    <CarouselContent>
                        {showcaseLoading ? (
                           <CarouselItem><Skeleton className="aspect-video w-full" /></CarouselItem>
                        ) : (vehicleShowcaseData?.images && vehicleShowcaseData.images.length > 0) ? vehicleShowcaseData.images.map((image) => (
                            <CarouselItem key={image.id}>
                                <div className="aspect-video relative rounded-xl overflow-hidden">
                                     <Image 
                                        src={image.src} 
                                        alt={image.alt} 
                                        fill 
                                        className="object-cover" 
                                        data-ai-hint={image.hint}
                                        unoptimized
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                parent.innerHTML = '<div class="flex items-center justify-center h-full bg-muted"><svg class="h-16 w-16 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                                            }
                                        }}
                                     />
                                </div>
                            </CarouselItem>
                        )) : (
                            <CarouselItem>
                                 <div className="aspect-video relative rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                                    <Car className="h-16 w-16 text-muted-foreground" />
                                 </div>
                            </CarouselItem>
                        )}
                    </CarouselContent>
                </Carousel>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Vehicle Details</CardTitle>
                        <CardDescription>{scheduledTrip.routeName}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs text-muted-foreground">
                        <div className="flex flex-col items-center gap-1"><Music/> Music</div>
                        <div className="flex flex-col items-center gap-1"><GlassWater/> Bottled Water</div>
                        <div className="flex flex-col items-center gap-1"><Cookie/> Snack Pack</div>
                        <div className="flex flex-col items-center gap-1"><Zap/> Charging Port</div>
                    </CardContent>
                </Card>

                <FormField
                  control={form.control}
                  name="seats"
                  render={() => (
                    <FormItem>
                      <div className="text-center bg-muted/30 rounded-xl p-4">
                            <h3 className="font-bold flex items-center justify-center gap-2"><Armchair className="h-5 w-5"/> Select Your Seat(s)</h3>
                            <p className="text-sm text-muted-foreground">Tap a seat to reserve it.</p>
                        </div>
                        <CardContent className="p-4 sm:p-6 flex flex-col items-center gap-6">
                            <div className="p-4 bg-muted/50 rounded-xl w-full max-w-[280px] sm:max-w-xs mx-auto">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="relative flex flex-col items-center justify-center aspect-square w-full rounded-lg font-semibold bg-muted text-muted-foreground/50 cursor-not-allowed">
                                        <RealSeatIcon className="w-3/4 h-3/4 text-current" />
                                        <span className="text-[10px] sm:text-xs mt-1">Driver</span>
                                    </div>
                                    <div />
                                    <Seat number={1} label="Front" status={getStatus(1)} onSelect={() => onSelectSeat(1)} />

                                    <Seat number={2} label="P1" status={getStatus(2)} onSelect={() => onSelectSeat(2)} />
                                    <Seat number={3} label="P2" status={getStatus(3)} onSelect={() => onSelectSeat(3)} />
                                    <Seat number={4} label="P3" status={getStatus(4)} onSelect={() => onSelectSeat(4)} />

                                    <Seat number={5} label="P4" status={getStatus(5)} onSelect={() => onSelectSeat(5)} />
                                    <Seat number={6} label="P5" status={getStatus(6)} onSelect={() => onSelectSeat(6)} />
                                    <Seat number={7} label="P6" status={getStatus(7)} onSelect={() => onSelectSeat(7)} />
                                </div>
                            </div>
                        </CardContent>
                      <FormMessage className="text-center pt-2" />
                    </FormItem>
                  )}
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Lead Passenger & Contact</CardTitle>
                        <CardDescription>This person's details will be used for all trip communication and they will be counted as the first passenger.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="passengerName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="passengerPhone" render={({ field }) => (
                           <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <PhoneInput {...field} control={form.control} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </CardContent>
                </Card>

                 {fields.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Passenger Details</CardTitle>
                            <CardDescription>Please provide the names for each additional passenger.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((field, index) => (
                                <FormField
                                    key={field.id}
                                    control={form.control}
                                    name={`passengers.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Passenger {index + 2} Name</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}
                
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={() => (
                      <FormItem>
                           <Card className="cursor-pointer hover:bg-muted" onClick={() => setIsPaymentSheetOpen(true)}>
                               <CardContent className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold flex items-center gap-2"><CreditCard className="h-5 w-5"/> Payment Method</h3>
                                            <p className="text-sm text-muted-foreground">{watchPaymentMethod || "Select a payment method"}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                               </CardContent>
                           </Card>
                          <FormMessage className="text-center pt-2" />
                      </FormItem>
                  )}
                />
            </div>
            <footer className="p-4 border-t border-border/50 bg-card shrink-0 space-y-3">
                 <div className="flex justify-between items-center text-center w-full">
                    <p className="text-sm text-muted-foreground">Total Fare ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})</p>
                    <p className="text-xl font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN'}).format(totalFare)}</p>
                </div>
                <Button type="submit" className="h-14 w-full text-lg font-bold">
                    Continue to Confirmation
                </Button>
            </footer>
          </form>
        </Form>
      <AlertDialog open={seatToConfirm !== null} onOpenChange={(open) => !open && setSeatToConfirm(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirm Seat Selection</AlertDialogTitle>
                <AlertDialogDescription>Once confirmed, this seat will be locked and cannot be unselected until the timer expires. Do you wish to proceed?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSeatToConfirm(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmSeat} disabled={isConfirmingSeat}>
                    {isConfirmingSeat && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <PaymentSheet 
          isOpen={isPaymentSheetOpen} 
          onOpenChange={setIsPaymentSheetOpen}
          selectedValue={watchPaymentMethod}
          onSelect={(value) => {
              form.setValue("paymentMethod", value, { shouldValidate: true });
              setIsPaymentSheetOpen(false);
          }}
          userBalance={user?.walletBalance || 0}
          isGuest={!user}
      />
    </div>
  );
}
