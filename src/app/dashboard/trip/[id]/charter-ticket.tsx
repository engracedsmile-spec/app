
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogoFull } from '@/components/icons/logo-full';
import { Separator } from '@/components/ui/separator';
import type { Booking } from '@/lib/data';
import { Car, User, Calendar, Hash } from 'lucide-react';

interface CharterTicketProps {
  booking: Booking;
}

const TicketDetail = ({ label, value, icon: Icon }: { label: string; value: string | undefined, icon: React.ElementType }) => (
  <div>
    <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Icon className="h-3 w-3" /> {label}</p>
    <p className="font-bold text-base">{value || 'N/A'}</p>
  </div>
);

export const CharterTicket = React.forwardRef<HTMLDivElement, CharterTicketProps>(({ booking }, ref) => {
  
  const travelDate = booking.travelDate ? new Date(booking.travelDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'N/A';
  
  const bookingCode = booking.id;

  const content = (
    <div className="p-4 bg-background text-foreground" style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
        <Card className="w-full border-2 border-primary/50 shadow-2xl shadow-primary/20 bg-card overflow-hidden">
            <CardHeader className="text-center bg-primary/10 p-6">
                <LogoFull className="h-10 w-auto mx-auto mb-2"/>
                <CardTitle className="text-2xl">Charter Confirmation</CardTitle>
                <CardDescription>Your private vehicle hire is confirmed.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Booking ID</p>
                    <p className="font-mono text-lg tracking-widest">{bookingCode.slice(0, 10).toUpperCase()}</p>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <TicketDetail label="Lead Passenger" value={booking.passengerName} icon={User} />
                    <TicketDetail label="Package" value={booking.charterPackageName} icon={Car} />
                    <div className="grid grid-cols-2 gap-4">
                        <TicketDetail label="Start Date" value={travelDate} icon={Calendar}/>
                        <TicketDetail label="Duration" value={`${booking.charterDays} day(s)`} icon={Hash} />
                     </div>
                </div>
                
                <Separator />

                <p className="text-xs text-center text-muted-foreground pt-4">
                    Your driver and vehicle details will be assigned and sent to you shortly. For any inquiries, please contact support.
                </p>

            </CardContent>
        </Card>
    </div>
  );
  
  if (ref) {
    return <div ref={ref}>{content}</div>
  }
  return content;
});

CharterTicket.displayName = 'CharterTicket';
