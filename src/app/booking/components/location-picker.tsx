
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MapPin, Calendar, Loader2, ArrowLeft } from 'lucide-react';
import type { Route, Terminal } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIconComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BookingLocationPickerProps {
    onNext: (data: { pickupAddress: string, destinationAddress: string, travelDate: string, routeId: string}) => void;
    initialData: Partial<{ pickupAddress: string, destinationAddress: string, travelDate: string, routeId: string }>;
    routes: Route[];
    terminals: Terminal[];
    isProcessing: boolean;
}

export const BookingLocationPicker = ({ onNext, initialData, routes, terminals, isProcessing }: BookingLocationPickerProps) => {
    const router = useRouter();
    const [fromTerminalId, setFromTerminalId] = useState(initialData.routeId ? routes.find(r => r.id === initialData.routeId)?.originTerminalId || "" : "");
    const [toTerminalId, setToTerminalId] = useState(initialData.routeId ? routes.find(r => r.id === initialData.routeId)?.destinationTerminalId || "" : "");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialData.travelDate ? new Date(initialData.travelDate) : new Date());
    
    
    const availableToTerminals = routes
        .filter(r => r.originTerminalId === fromTerminalId)
        .map(r => terminals.find(t => t.id === r.destinationTerminalId))
        .filter(Boolean)
        .reduce((unique, terminal) => {
            if (!unique.find(t => t.id === terminal.id)) {
                unique.push(terminal);
            }
            return unique;
        }, [] as Terminal[]);
    
    const handleFromChange = (newFromId: string) => {
        setFromTerminalId(newFromId);
        const routeForNewFrom = routes.find(r => r.originTerminalId === newFromId);
        if (routeForNewFrom && routeForNewFrom.destinationTerminalId === toTerminalId) {
            // 'to' is valid, do nothing
        } else {
            setToTerminalId("");
        }
    };
    
    useEffect(() => {
        if (fromTerminalId && availableToTerminals.length === 1 && toTerminalId !== availableToTerminals[0].id) {
            setToTerminalId(availableToTerminals[0].id);
        }
    }, [fromTerminalId, availableToTerminals, toTerminalId]);


    const handleSwapLocations = () => {
       const currentTo = toTerminalId;
       const currentFrom = fromTerminalId;
       
       const correspondingReverseRoute = routes.find(r => r.id === routes.find(route => route.originTerminalId === currentFrom && route.destinationTerminalId === currentTo)?.reverseRouteId)

        if (correspondingReverseRoute) {
             setFromTerminalId(currentTo);
             setToTerminalId(currentFrom);
        } else {
            toast.info("No Reverse Route", { description: "A reverse route is not set up. Please select manually."})
        }
    };

    const handleSearch = async () => {
        if (!fromTerminalId || !toTerminalId || !selectedDate) {
            toast.error("Missing Information", { description: "Please select departure, destination, and date."});
            return;
        }
        
        const route = routes.find(r => r.originTerminalId === fromTerminalId && r.destinationTerminalId === toTerminalId);
        if (!route) {
            toast.info("Route Not Available", { description: "We do not currently operate on the selected route. Please select another." });
            return;
        }

        const fromTerminal = terminals.find(t => t.id === fromTerminalId);
        const toTerminal = terminals.find(t => t.id === toTerminalId);
        
        const searchData = {
            pickupAddress: fromTerminal?.name || fromTerminalId,
            destinationAddress: toTerminal?.name || toTerminalId,
            travelDate: format(selectedDate, 'yyyy-MM-dd'),
            routeId: route.id,
        };

        onNext(searchData);
    };

    return (
        <div className="flex flex-col h-full bg-card">
             <header className="p-4 flex items-center justify-center relative border-b border-border/50 shrink-0">
                <Button type="button" variant="ghost" size="icon" onClick={() => router.push('/')} className="absolute left-4 top-1/2 -translate-y-1/2">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 text-center">
                    <h1 className="text-xl font-bold">Book Your Trip</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col justify-center">
                <div className="w-full max-w-md mx-auto">
                    <div className="space-y-6">
                        <div className="relative">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                From
                            </label>
                            <Select onValueChange={handleFromChange} value={fromTerminalId}>
                                <SelectTrigger className="w-full pl-12 pr-4 py-4 h-16 bg-muted border-2 border-border rounded-2xl text-lg font-semibold text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all flex items-center">
                                    <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 text-primary">
                                        <MapPin size={20} />
                                    </div>
                                    <SelectValue placeholder="Select Terminal" />
                                </SelectTrigger>
                                <SelectContent>
                                    {terminals.map(terminal => <SelectItem key={terminal.id} value={terminal.id}>{terminal.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-center -my-3 relative z-10">
                            <button
                                onClick={handleSwapLocations}
                                className="bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground w-12 h-12 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                            >
                                <ArrowUpDown size={20} />
                            </button>
                        </div>

                        <div className="relative">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                To
                            </label>
                            <Select onValueChange={setToTerminalId} value={toTerminalId} disabled={!fromTerminalId}>
                                <SelectTrigger className="w-full pl-12 pr-4 py-4 h-16 bg-muted border-2 border-border rounded-2xl text-lg font-semibold text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all flex items-center">
                                <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 text-primary">
                                        <MapPin size={20} />
                                    </div>
                                <SelectValue placeholder="Select Terminal" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableToTerminals.map(terminal => <SelectItem key={terminal.id} value={terminal.id} disabled={terminal.id === fromTerminalId}>{terminal.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                    Date
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-12 justify-start text-left font-medium bg-muted border-2 border-border rounded-xl text-foreground">
                                            <Calendar className="mr-2 h-4 w-4 text-primary" />
                                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarIconComponent
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
             <footer className="p-4 border-t border-border/50 bg-card shrink-0">
                 <Button onClick={handleSearch} className="w-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:shadow-primary/40 text-primary-foreground font-bold text-lg py-4 h-16 rounded-2xl shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Search Departures"}
                </Button>
            </footer>
        </div>
    );
};
