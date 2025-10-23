
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Clock, Armchair, User, AlertTriangle } from "lucide-react";
import type { ScheduledTrip } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DepartureSelectionProps {
  onNext: (departure: ScheduledTrip) => void;
  onBack: () => void;
  trips: ScheduledTrip[];
  loading: boolean;
  error: string | null;
}

const DepartureCard = ({ trip, onSelect, selected }: { trip: ScheduledTrip, onSelect: () => void, selected: boolean }) => {
    const availableSeats = 7 - (trip.bookedSeats?.length || 0);

    return (
        <Card 
            onClick={onSelect}
            className={cn(
                "cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200",
                selected && "border-primary ring-2 ring-primary"
            )}
        >
            <CardContent className="p-4 grid grid-cols-3 items-center gap-4">
                <div className="col-span-2 flex items-center gap-4">
                     <div className="p-3 bg-primary/10 rounded-full hidden sm:block">
                        <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                             <p className="font-bold text-lg">{trip.departurePeriod}</p>
                             {trip.status === 'Boarding' && <Badge variant="outline" className="text-xs border-indigo-500/50 bg-indigo-500/10 text-indigo-500">Boarding</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5"><User className="h-4 w-4"/>Driver: {trip.driverName}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-lg flex items-center gap-2 justify-end"><Armchair className="h-4 w-4"/> {availableSeats}</p>
                    <p className="text-xs text-muted-foreground">seats left</p>
                </div>
            </CardContent>
        </Card>
    );
};


export const DepartureSelection = ({ onNext, onBack, trips, loading, error }: DepartureSelectionProps) => {
    const [selectedDeparture, setSelectedDeparture] = useState<ScheduledTrip | null>(null);

    return (
        <div className="w-full h-full flex flex-col bg-card">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {loading ? (
                    Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                ) : error ? (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Fetching Departures</AlertTitle>
                        <AlertDescription>
                           <p>We couldn't load available trips. Here's the error from the server:</p>
                           <pre className="mt-2 text-xs bg-muted/50 p-2 rounded-md whitespace-pre-wrap font-mono">
                               {error}
                           </pre>
                        </AlertDescription>
                    </Alert>
                ) : trips.length > 0 ? (
                    trips.map(trip => (
                        <DepartureCard 
                            key={trip.id} 
                            trip={trip}
                            onSelect={() => setSelectedDeparture(trip)}
                            selected={selectedDeparture?.id === trip.id}
                        />
                    ))
                ) : (
                    <div className="text-center py-16 text-muted-foreground h-full flex flex-col items-center justify-center">
                        <Car className="h-16 w-16 mx-auto text-primary/20"/>
                        <p className="text-lg font-semibold mt-4">No Trips Available</p>
                        <p className="mt-1">There are no scheduled trips for this route on the selected date.</p>
                        <Button onClick={onBack} variant="outline" className="mt-4">Change Date or Route</Button>
                    </div>
                )}
            </div>
             <footer className="p-4 border-t border-border/50 bg-card shrink-0">
                <Button onClick={() => selectedDeparture && onNext(selectedDeparture)} disabled={!selectedDeparture} className="h-14 w-full text-lg font-bold">
                    Continue
                </Button>
            </footer>
        </div>
    )
}
