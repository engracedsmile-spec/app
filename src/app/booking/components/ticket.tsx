
"use client";

import React from 'react';
import QRCode from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogoFull } from '@/components/icons/logo-full';
import { Separator } from '@/components/ui/separator';
import type { CreatedBooking } from '../booking-flow';
import { Car, User, Armchair, Calendar, Bell, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/data';

interface TicketProps {
  booking: CreatedBooking | Booking;
}

const TicketDetail = ({ label, value, icon: Icon }: { label: string; value: string | undefined, icon: React.ElementType }) => (
  <div>
    <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Icon className="h-3 w-3" /> {label}</p>
    <p className="font-bold text-base">{value || 'N/A'}</p>
  </div>
);

export const Ticket = React.forwardRef<HTMLDivElement, TicketProps>(({ booking }, ref) => {
  const travelDate = booking.travelDate ? new Date(booking.travelDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'N/A';
  
  const travelTime = booking.travelDate ? new Date(booking.travelDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }) : 'N/A'

  // This is the fix: use 'id' if 'code' is not present.
  const bookingCode = 'id' in booking ? booking.id : (booking as any).code;

  // A simple data URI for the logo to embed in the QR code.
  const logoImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMC43NCAxNS4yNiI+PGcgZmlsbD0iIzAwMCI+PHBhdGggZD0iTTQuNTUgMTUuMjZjMC4zNSwtMC40NiAwLjcyLC0wLjk5IDEuMDgsLTEuNTVsLTEuMiAwLjI3IC0wLjAxIC0wLjQ1IDEuNiAtMC40MyAwLjEgLTAuMTYgLTEuNjUgMC40MSAtMC4wMSAtMS4wMiAyLjQyIC0wLjcyIC0wLjAxIDAuMDRjMC4wNiwtMC4xMSAwLjEyLC0wLjIyIDAuMTgsLTAuMzRsLTEuNzUgMC40NCAtMC4wMyAtMC42NSAyLjIxIC0wLjY3YzAuMDQsLTAuMDcgMC4wNywtMC4xNSAwLjEsLTAuMjJsLTIuMjcgMC42NCAtMC4wNiAtMS40OCAzLjA5IC0xLjAxYzAuNDMsLTEuMjMgMC42OSwtMi40NSAwLjY5LC0zLjU1IDAsLTAuMTcgLTAuMDEsLTAuMzMgLTAuMDMsLTAuNDkgLTAuMDgsMC4wMSAtMC4xNiwwLjAxIC0wLjI3LC0wIDAsMC4wNyAwLjAxLDAuMTUgMC4wMSwwLjIyIDAsMi4xNCAtMS43MywzLjg3IC0zLjg3LDMuODcgLTIuMTQsMCAtMy44NywtMS43MyAtMy44NywtMy44NyAwLC0yLjE0IDEuNzMsLTMuODcgMy44NywtMy44NyAwLjQ3LDAgMC45MywwLjA5IDEuMzUsMC4yNCAwLC0wLjA5IC0wLC0wLjE5IC0wLjAxLC0wLjI4IC0wLjUyLC0wLjIxIC0xLjA5LC0wLjMzIC0xLjY5LC0wLjMzIC0yLjIzLDAgLTQuMDcsMS42MSAtNC40NSwzLjczIC0wLjI5LDEuNjMgMC41OCw0LjAzIDEuNjksNi4yOWwzLjMgLTAuOTEgMC4wNCAwLjYgLTIuODggMC44MyAwLjEgMC4yOCAyLjc4IC0wLjAzIDAuMDQgMC42NSAtMi42OSAwLjcyYzAuMDQsMC4wOCAwLjA5LDAuMTYgMC4xMywwLjI0bDIuNTYgLTAuNzQgMC4wMyAwLjYyIC0yLjI4IDAuNjggMC4xMyAwLjIyIDEuMzIgLTAuMzIgMC4wMiAwLjQyIC0xLjEyIDAuMjkgMC4xIDAuMTcgMS4wMSAtMC4yNyAwLjAxIDAuNDUgLTAuOCAwLjE5IDAuMDkgMC4xNCAwLjcyIC0wLjE5IDAuMDEgMC40MyAtMC41IDAuMTNjMC4yNiwwLjQzIDAuNSwwLjgxIDAuNywxLjE0em0xLjg2IC0yLjgxYzAuMDQsLTAuMDggMC4wOSwtMC4xNSAwLjEzLC0wLjIzbC0xLjU0IDAuMzkgLTAgMC4xOSAxLjQgLTAuMzcgMCAwLjAyem0xLjQ4IC0yLjk2YzAuMDQsLTAuMSAwLjA4LC0wLjE5IDAuMTIsLTAuMjlsLTEuOTYgMC41NiAwLjAxIDAuMjcgMS44MyAtMC41M3oiIC8+PHBhdGggZD0iTTYuOTcgMGMwLjM0LDIuNCAxLjc5LDMuMTMgMy43NywzLjA4IC0yLjQxLDAuMTcgLTMuNzYsMS4xMSAtMy43NywzLjA4IDAuMjcsLTIuMyAtMS41OCwtMi44MiAtMy43NywtMy4wOCAyLjIsMC4xNSAzLjQ0LC0wLjg4IDMuNzcsLTMuMTh6IiAvPjwvZz48L3N2Zz4=";
  
  const isVerified = 'status' in booking && ['Boarding', 'In Transit', 'Completed'].includes(booking.status);

  const content = (
    <div className="p-4 bg-background text-foreground" style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
        <Card className="w-full border-2 border-primary/50 shadow-2xl shadow-primary/20 bg-card overflow-hidden">
            {isVerified && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="border-8 border-green-500 rounded-full p-4">
                         <span className="text-5xl font-black text-green-500 transform -rotate-15">VERIFIED</span>
                    </div>
                </div>
            )}
            <CardHeader className="text-center bg-primary/10 p-6">
                <LogoFull className="h-10 w-auto mx-auto mb-2"/>
                <CardTitle className="text-2xl">Boarding Pass</CardTitle>
                <CardDescription>Keep this ticket safe. You will need it to board.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="flex justify-center">
                    <div className="p-2 bg-white rounded-md">
                        <QRCode
                            value={bookingCode}
                            size={128}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                            imageSettings={{
                                src: logoImage,
                                x: undefined,
                                y: undefined,
                                height: 24,
                                width: 24,
                                excavate: true,
                            }}
                        />
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Booking ID</p>
                    <p className="font-mono text-lg tracking-widest">{bookingCode.slice(0, 10).toUpperCase()}</p>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <TicketDetail label="Passenger(s)" value={(booking as any).passengers?.join(', ')} icon={User} />
                    <div className="grid grid-cols-2 gap-4">
                        <TicketDetail label="From" value={booking.pickupAddress?.split(',')[0]} icon={Car} />
                        <TicketDetail label="To" value={booking.destinationAddress?.split(',')[0]} icon={Car} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <TicketDetail label="Seat(s)" value={booking.itemDescription} icon={Armchair}/>
                        <TicketDetail label="Date & Time" value={`${travelDate}, ${travelTime}`} icon={Calendar} />
                     </div>
                </div>
                 {booking.wifiPassword && (
                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 flex items-start gap-3">
                        <Wifi className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                        <div>
                            <p className="text-xs font-semibold">Onboard WiFi</p>
                            <p className="text-xs font-medium">Password: <span className="font-bold">{booking.wifiPassword}</span></p>
                        </div>
                    </div>
                )}
                 <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 flex items-start gap-3">
                    <Bell className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                    <p className="text-xs font-medium">
                        {'driverName' in booking && booking.driverName ? `Your driver is ${booking.driverName}.` : "A driver will be assigned closer to your departure time. Log in to your account to receive live notifications."}
                    </p>
                 </div>

                <Separator />

                <p className="text-xs text-center text-muted-foreground pt-4">
                    Please arrive at the terminal at least 30 minutes before departure. Have a safe trip!
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

Ticket.displayName = 'Ticket';
