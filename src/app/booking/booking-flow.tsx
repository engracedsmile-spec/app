
"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Confirmation } from "./components/confirmation";
import { ShipmentCreated } from "./components/shipment-created";
import { BookingLocationPicker } from "./components/location-picker";
import { DepartureSelection } from "./components/departure-selection";
import { PackageDetails, type PackageFormData } from "./components/package-details";
import { CharterPackageSelection } from "./components/charter/package-selection";
import { CharterTripDetails, type CharterDetailsFormData } from "./components/charter/trip-details";
import type { Booking, ScheduledTrip, CharterPackage, Route, Terminal, Draft, PaymentSettings } from '@/lib/data';
import { doc, onSnapshot, collection, setDoc, getDoc, serverTimestamp, deleteDoc, updateDoc, deleteField, Timestamp, FieldValue, runTransaction } from "firebase/firestore";
import { findAvailableDepartures } from "./actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useDebounce } from "use-debounce";
import { usePaystackPayment } from "react-paystack";
import { getPaymentSettings, getOperationsSettings, type OperationsSettings } from "@/lib/settings";
import { Card, CardContent } from "@/components/ui/card";
import { usePreloader } from "@/context/preloader-context";
import { useCountdown } from "@/hooks/use-countdown";
import { CharterConfirmation } from "./components/charter/confirmation";


export type CreatedBooking = {
  code: string;
  passengerName: string;
  passengerPhone: string;
  passengers: string[];
  pickupAddress: string;
  destinationAddress: string;
  itemDescription: string;
  travelDate?: string;
  driverName?: string;
  wifiPassword?: string;
  wifiSSID?: string;
  title?: string;
  bookingType?: 'seat_booking' | 'charter';
};

export type BookingFormData = {
  passengerName?: string;
  passengerEmail?: string;
  passengerPhone?: string;
  passengers?: { name: string }[];
  travelDate?: string;
  specialInstructions?: string;
  seats?: number[];
  paymentMethod?: string;
  price?: number;
  pickupAddress?: string;
  destinationAddress?: string;
  routeId?: string;
  bookingType: 'seat_booking' | 'charter';
  charterPackageId?: string;
  charterPackageName?: string;
  charterDays?: number;
  charterBasePrice?: number;
  charterDailyRate?: number;
  couponCode?: string;
  bookingId?: string;
};

const removeUndefined = (obj: any) => {
  const out: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
};

const LOCAL_STORAGE_KEY = 'bookingFlowProgress';

const BookingFlowComponent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, firestore, firebaseUser } = useAuth();
  const { showPreloader } = usePreloader();

  const bookingTypeFromUrl = useMemo(() => {
    try {
      const t = searchParams?.get('bookingType') ?? null;
      return (t === 'seat_booking' || t === 'charter') ? (t as 'seat_booking' | 'charter') : 'seat_booking';
    } catch {
      return 'seat_booking';
    }
  }, [searchParams]);

  const draftId = useMemo(() => {
    try {
      return searchParams?.get('draftId') ?? null;
    } catch {
      return null;
    }
  }, [searchParams]);

  const [step, setStep] = useState<number>(0);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [finalBooking, setFinalBooking] = useState<CreatedBooking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [departureFetchError, setDepartureFetchError] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [availableDepartures, setAvailableDepartures] = useState<ScheduledTrip[]>([]);
  const [charterPackages, setCharterPackages] = useState<CharterPackage[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<ScheduledTrip | null>(null);
  const [currentTripState, setCurrentTripState] = useState<ScheduledTrip | null>(null);
  const [opsSettings, setOpsSettings] = useState<OperationsSettings | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [seatHoldExpires, setSeatHoldExpires] = useState<Date | null>(null);
  const [guestId] = useState(() => user ? null : `guest_${Math.random().toString(36).substring(2, 10)}`);

  const [formData, setFormData] = useState<BookingFormData>({
    bookingType: bookingTypeFromUrl,
    paymentMethod: 'Pay with Paystack',
  });
  
  const updateFormData = useCallback((newData: Partial<BookingFormData>) => {
    setFormData(prev => ({...prev, ...newData}));
  }, []);

  const [debouncedFormData] = useDebounce(formData, 1000);
  
  const countdown = useCountdown(seatHoldExpires);
  
  const releaseHolds = useCallback(async (seatsToRelease: number[]) => {
    if (seatsToRelease.length > 0 && firestore && selectedTrip) {
      const tripRef = doc(firestore, 'scheduledTrips', selectedTrip.id);
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
  }, [firestore, selectedTrip]);

  useEffect(() => {
    return () => {
      if (formData.seats && formData.seats.length > 0) {
        releaseHolds(formData.seats);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteDraft = useCallback(async () => {
    if (!user || !firestore) return;
    try {
      const draftRef = doc(firestore, 'drafts', `${user.id}_${formData.bookingType}`);
      await deleteDoc(draftRef).catch(err => console.error("Could not delete draft:", err));
    } catch (e) {
      console.warn("deleteDraft error:", e);
    }
  }, [user, firestore, formData.bookingType]);

  const onPaymentSuccess = useCallback(async (paymentReference: { reference: string }, bookingId: string, type: 'seat_booking' | 'charter') => {
    setIsProcessing(true);
    setError(null);
    
    if (!bookingId) {
      setError("Booking ID is missing. Please contact support.");
      setIsProcessing(false);
      return;
    }

    const verificationUrl = type === 'charter' ? '/api/verify-charter-payment' : '/api/verify-payment';

    try {
        const idToken = await firebaseUser?.getIdToken();
        const response = await fetch(verificationUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(idToken && { 'Authorization': `Bearer ${idToken}` }),
            },
            body: JSON.stringify({
                reference: paymentReference.reference,
                bookingId: bookingId,
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || "Payment verification failed.");
        }
        
        if (user) await deleteDraft();
        if (typeof window !== "undefined") localStorage.removeItem(LOCAL_STORAGE_KEY);
        setFinalBooking(result.bookingDetails as CreatedBooking);
        toast.success("Booking Confirmed!", { description: `Your trip ${result.bookingDetails.code.slice(0,10)} has been scheduled.` });
        setStep(prev => prev + 1);

    } catch (err: any) {
        console.error("Payment verification/finalization error:", err);
        setError(err?.message || "There was an issue finalizing your booking. Please contact support.");
    } finally {
        setIsProcessing(false);
    }
  }, [firebaseUser, user, deleteDraft]);


  const onPaymentClose = useCallback(() => {
    setIsProcessing(false);
    toast.info("Payment Cancelled", { description: "Your booking is still pending. You can try to pay again from the confirmation screen."});
  }, []);

 const loadInitialData = useCallback(async () => {
    if (!firestore) return { unsubscribes: [] };

    const unsubscribes: (() => void)[] = [];
    try {
        const settingsPromise = getOperationsSettings();
        const paymentPromise = getPaymentSettings();
        
        const routesAndTerminalsPromise = fetch('/api/routes').then(res => {
            if (!res.ok) throw new Error('Failed to fetch routes');
            return res.json();
        });

        const charterPromise = new Promise<CharterPackage[]>((resolve, reject) => {
            const unsub = onSnapshot(doc(firestore, 'settings', 'charter'), 
                (docSnap) => resolve((docSnap.data()?.packages ?? []) as CharterPackage[]),
                reject);
            unsubscribes.push(unsub);
        });

        const [settings, payment, routesAndTerminals, fetchedCharterPackages] = await Promise.all([
            settingsPromise, paymentPromise, routesAndTerminalsPromise, charterPromise
        ]);
        
        setOpsSettings(settings);
        setPaymentSettings(payment);
        setRoutes(routesAndTerminals.routes);
        setTerminals(routesAndTerminals.terminals);
        setCharterPackages(fetchedCharterPackages);

        let initialFormData: Partial<BookingFormData> = {
            passengerName: user?.name || '',
            passengerPhone: user?.phone || '',
            passengerEmail: user?.email || '',
            paymentMethod: 'Pay with Paystack',
            bookingType: bookingTypeFromUrl
        };
        let initialStep = 0;

        if (draftId && user) {
            const draftRef = doc(firestore, 'drafts', draftId);
            const docSnap = await getDoc(draftRef);
            if (docSnap.exists() && docSnap.data().userId === user.id) {
                const draftData = docSnap.data() as Draft;
                initialFormData = { ...initialFormData, ...(draftData.formData ?? {}) };
                initialStep = draftData.step ?? 0;
            } else {
                toast.error("Draft not found or access denied.");
                router.replace('/book-trip');
            }
        } else if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.formData.bookingType === bookingTypeFromUrl) {
                        initialFormData = { ...initialFormData, ...parsed.formData };
                        initialStep = parsed.step ?? 0;
                    } else {
                        localStorage.removeItem(LOCAL_STORAGE_KEY);
                    }
                }
            } catch (err) {
                console.warn("Could not read from localStorage:", err);
            }
        }

        updateFormData(initialFormData);
        setStep(initialStep);

    } catch (err: any) {
        console.error("Error during initial data load:", err);
        setError(err.message || "Failed to load booking session. Please check your connection and try again.");
    } finally {
        setIsLoading(false);
    }
    return { unsubscribes };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, user, draftId, bookingTypeFromUrl]);

  useEffect(() => {
    let unsubscribes: (() => void)[] = [];
    setIsLoading(true);
    loadInitialData().then(res => {
        unsubscribes = res.unsubscribes;
    });
    return () => unsubscribes.forEach(unsub => unsub());
}, [loadInitialData]);


  useEffect(() => {
    if (isLoading || finalBooking || typeof window === "undefined") return;

    try {
      const progress = { formData: debouncedFormData, step };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
    } catch (err) {
      console.error("Could not save booking progress to localStorage", err);
    }
  }, [debouncedFormData, step, finalBooking, isLoading]);


  useEffect(() => {
    if (!user || !firestore || isLoading || finalBooking) return;

    const sanitized = removeUndefined(debouncedFormData);
    const draftData: Draft = {
      id: `${user.id}_${sanitized.bookingType}`,
      userId: user.id,
      type: sanitized.bookingType,
      lastSaved: serverTimestamp(),
      formData: sanitized,
      step: step
    };

    const draftRef = doc(firestore, 'drafts', draftData.id);
    setDoc(draftRef, draftData, { merge: true }).catch(err => {
      console.error("Failed to save draft:", err);
    });
  }, [debouncedFormData, step, user, firestore, finalBooking, isLoading]);

  const paystackConfig = useMemo(() => {
    if (!paymentSettings) return {};
    
    const publicKey = paymentSettings.paystackLivePublicKey;
    
    return {
        publicKey: publicKey || "",
        email: formData.passengerEmail || 'guest@example.com',
    }
  }, [paymentSettings, formData.passengerEmail]);


  const initializePayment = usePaystackPayment();

  const nextStep = useCallback(() => setStep(prev => prev + 1), []);
  const prevStep = useCallback(() => setStep(prev => prev > 0 ? prev - 1 : 0), []);
  const goToStep = useCallback((s: number) => {
      setError(null); // Clear error when navigating
      setStep(s)
  }, []);

  const handleLocationSubmit = useCallback(async (data: { pickupAddress: string, destinationAddress: string, travelDate: string, routeId: string }) => {
    setIsProcessing(true);
    setDepartureFetchError(null);
    try {
      updateFormData(data);
      const departures = await findAvailableDepartures(data.routeId, data.travelDate);
      setAvailableDepartures(departures || []);
      if (!departures || departures.length === 0) {
        toast.info("No Departures Found", {
          description: "There are no available departures for the selected route and date. Please try another date.",
        });
      }
      nextStep();
    } catch (err: any) {
      console.error("handleLocationSubmit error:", err);
      setDepartureFetchError(err.message || "Could not fetch departures. Please check your connection and try again.");
      toast.error("Error Fetching Departures", { description: err.message });
      nextStep(); // Still go to next step to show the error
    } finally {
      setIsProcessing(false);
    }
  }, [nextStep, updateFormData]);

  const handleDepartureSelect = useCallback((trip: ScheduledTrip) => {
    setSelectedTrip(trip);
    updateFormData({ price: trip.fare, travelDate: trip.departureDate });
    nextStep();
  }, [nextStep, updateFormData]);

  const handleSeatAndContactSubmit = useCallback((data: PackageFormData) => {
    const finalData = { ...data, price: (data.seats?.length || 0) * (selectedTrip?.fare || 0) };
    updateFormData(finalData);
    nextStep();
  }, [nextStep, selectedTrip, updateFormData]);

  const handleCharterPackageSelect = useCallback((pkg: CharterPackage) => {
    updateFormData({
      bookingType: 'charter',
      charterPackageId: pkg.id,
      charterPackageName: pkg.name,
      charterBasePrice: pkg.basePrice,
      charterDailyRate: pkg.dailyRate,
      price: pkg.basePrice,
    });
    nextStep();
  }, [nextStep, updateFormData]);

  const handleCharterDetailsSubmit = useCallback((data: Omit<CharterDetailsFormData, 'travelDate'> & { travelDate: string }) => {
    const basePrice = formData.charterBasePrice || 0;
    const dailyRate = formData.charterDailyRate || 0;
    const days = data.charterDays || 1;
    const calculatedPrice = basePrice + (dailyRate * (days - 1));

    updateFormData({ ...data, price: calculatedPrice });
    nextStep();
  }, [nextStep, updateFormData, formData.charterBasePrice, formData.charterDailyRate]);


  const handleConfirmBooking = useCallback(async (currentFormData: BookingFormData) => {
    setIsProcessing(true);
    setError(null);
    try {
      const idToken = await firebaseUser?.getIdToken();
      const apiUrl = currentFormData.bookingType === 'charter' ? '/api/charter-bookings' : '/api/bookings';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken && { 'Authorization': `Bearer ${idToken}` }),
        },
        body: JSON.stringify({
          formData: currentFormData,
          user,
          scheduledTripId: selectedTrip?.id,
        }),
      });

      const pendingBooking = await response.json();

      if (!response.ok) {
        throw new Error(pendingBooking.message || 'Booking creation failed.');
      }
      
      const newBookingId = pendingBooking.bookingId;
      const finalPrice = pendingBooking.finalPrice;

      updateFormData({ bookingId: newBookingId, price: finalPrice });

      if (currentFormData.paymentMethod === 'Pay with Paystack') {
        if (!paystackConfig.publicKey) {
          throw new Error("Payment gateway is not configured. Please contact support.");
        }

        initializePayment({
            config: {
                ...paystackConfig,
                amount: finalPrice * 100,
                reference: String(new Date().getTime()),
                metadata: {
                    bookingId: newBookingId,
                    bookingType: currentFormData.bookingType,
                    userId: user?.id,
                    customerName: currentFormData.passengerName,
                    customerEmail: currentFormData.passengerEmail,
                    description: `Payment for ${currentFormData.bookingType === 'charter' ? 'Charter' : 'Seat'} booking`
                }
            },
            onSuccess: (ref: any) => onPaymentSuccess({...ref}, newBookingId, currentFormData.bookingType),
            onClose: onPaymentClose,
        });

      } else if (currentFormData.paymentMethod === 'Wallet') {
        throw new Error("Wallet payment is not yet implemented.");
      }

    } catch (err: any) {
      console.error("handleConfirmBooking error:", err);
      setError(err?.message || "An error occurred while creating your booking.");
    } finally {
        if (currentFormData.paymentMethod !== 'Pay with Paystack') {
            setIsProcessing(false);
        }
    }
  }, [firebaseUser, user, selectedTrip, paystackConfig, initializePayment, onPaymentSuccess, onPaymentClose, updateFormData]);

  const handleFinish = useCallback(async () => {
    if (user) await deleteDraft();
    if (typeof window !== "undefined") localStorage.removeItem(LOCAL_STORAGE_KEY);
    showPreloader();
    if (!user) {
      router.push(`/signup?tripId=${finalBooking?.code ?? ''}`);
    } else {
      router.push('/dashboard');
    }
  }, [user, deleteDraft, router, finalBooking, showPreloader]);
  

  const saveAndClose = useCallback(async () => {
    if (user) {
      if (selectedTrip && formData.seats && formData.seats.length > 0 && firestore) {
        const tripRef = doc(firestore, 'scheduledTrips', selectedTrip.id);
        const updates: { [key: string]: any } = {};
        formData.seats.forEach(seat => updates[`seatHolds.${seat}`] = deleteField());
        await updateDoc(tripRef, updates).catch(err => console.error("failed to release seat holds:", err));
      }
      toast.success("Draft Saved!", { description: "Your booking progress has been saved. You can resume from your dashboard."});
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  }, [user, selectedTrip, formData, firestore, router]);


  if (isLoading || !paymentSettings) {
    return null;
  }

  if (error && !isProcessing) {
    const finalizationError = step === (formData.bookingType === 'charter' ? 2 : 3);
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4">
          <header className="p-4 flex items-center justify-center relative border-b border-border/50 shrink-0 w-full max-w-lg">
            <Button type="button" variant="ghost" size="icon" onClick={() => setError(null)} className="absolute left-4 top-1/2 -translate-y-1/2">
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-destructive">Booking Failed</h1>
          </header>
          <div className="flex-1 flex items-center justify-center w-full max-w-lg">
              <Card className="w-full text-center border-destructive/50 bg-destructive/10">
                  <CardContent className="p-8 space-y-4">
                      <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
                      <h2 className="text-xl font-bold">{finalizationError ? 'Booking Finalization Failed' : 'An Error Occurred'}</h2>
                      <p className="text-muted-foreground">
                        {finalizationError 
                            ? "Your payment was successful, but we couldn't finalize your booking. Please see the error details below."
                            : "An unexpected error occurred. Please try again."
                        }
                      </p>
                       <div className="mt-4 p-3 bg-muted/50 rounded-md text-left">
                            <p className="text-sm font-semibold">Error Details:</p>
                            <pre className="text-xs text-destructive-foreground whitespace-pre-wrap font-mono">{error}</pre>
                       </div>
                       <Button onClick={() => setError(null)} className="mt-6">Try Again</Button>
                  </CardContent>
              </Card>
          </div>
      </div>
    );
  }

  const getHeaderTitle = () => {
    if (formData.bookingType === 'charter') {
      switch (step) {
        case 0: return 'Choose Your Charter Package';
        case 1: return 'Charter Details';
        case 2: return 'Confirm Charter Details';
        default: return 'Charter Vehicle';
      }
    }
    switch (step) {
      case 0: return 'Book Your Trip';
      case 1: return 'Choose Departure Time';
      case 2: return 'Select Seats & Details';
      case 3: return 'Confirm Details';
      default: return 'Book a Seat';
    }
  };

  const renderBookingStep = () => {
    if (!opsSettings) {
      return <div className="p-8 text-center text-destructive">Could not load operational settings. Please try again later.</div>;
    }

    if (formData.bookingType === 'charter') {
      switch (step) {
        case 0:
          return <CharterPackageSelection packages={charterPackages} onNext={handleCharterPackageSelect} />;
        case 1:
          return <CharterTripDetails onBack={prevStep} onNext={handleCharterDetailsSubmit} initialData={formData} />;
        case 2:
          return <CharterConfirmation data={formData} onConfirm={() => handleConfirmBooking(formData)} onBack={prevStep} onEdit={goToStep} isCalculatingPrice={isProcessing} onCouponChange={(coupon) => updateFormData({ couponCode: coupon })} />;
        case 3:
          return <ShipmentCreated booking={finalBooking} onFinish={handleFinish} isGuest={!user} />;
        default:
          return null;
      }
    }

    switch (step) {
      case 0:
        return <BookingLocationPicker onNext={handleLocationSubmit} initialData={formData} routes={routes} terminals={terminals} isProcessing={isProcessing} />;
      case 1:
        return <DepartureSelection trips={availableDepartures} onNext={handleDepartureSelect} onBack={prevStep} loading={isProcessing} error={departureFetchError} />;
      case 2:
        return selectedTrip ? <PackageDetails 
            scheduledTrip={selectedTrip}
            opsSettings={opsSettings}
            onNext={handleSeatAndContactSubmit}
            onBack={prevStep}
            initialData={formData}
            updateFormData={updateFormData}
            countdown={countdown}
            seatHoldExpires={seatHoldExpires}
            setSeatHoldExpires={setSeatHoldExpires}
            currentTripState={currentTripState}
            setCurrentTripState={setCurrentTripState}
            guestId={guestId}
        /> : null;
      case 3:
        return <Confirmation data={formData} onConfirm={() => handleConfirmBooking(formData)} onBack={prevStep} onEdit={goToStep} isCalculatingPrice={isProcessing} onCouponChange={(coupon) => updateFormData({ couponCode: coupon })} />;
      case 4:
        return <ShipmentCreated booking={finalBooking} onFinish={handleFinish} isGuest={!user} />;
      default:
        return null;
    }
  };

  const isFinalStep = step === (formData.bookingType === 'charter' ? 3 : 4);
  const showHeader = !isFinalStep && (step > 0 || (step === 0 && formData.bookingType === 'charter'));
  
  return (
    <div className="h-full w-full max-w-lg mx-auto bg-card shadow-2xl flex flex-col">
        {showHeader && (
          <header className="p-4 flex items-center justify-center relative border-b border-border/50 shrink-0">
            <Button type="button" variant="ghost" size="icon" onClick={prevStep} className="absolute left-4 top-1/2 -translate-y-1/2">
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold">{getHeaderTitle()}</h1>
            </div>
            {user && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={saveAndClose}>Save & Close</Button>
              </div>
            )}
          </header>
        )}
        <div className="flex-1 min-h-0">
          {renderBookingStep()}
        </div>
      </div>
  );
};

export const BookingFlow: React.FC = () => {
  return (
    <BookingFlowComponent />
  );
};
