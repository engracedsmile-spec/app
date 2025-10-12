
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Calendar, User, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIconComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PhoneInput } from '@/components/ui/phone-input';

const charterDetailsSchema = z.object({
  passengerName: z.string().min(2, "Name is too short."),
  passengerPhone: z.string().min(10, "Please enter a valid phone number."),
  travelDate: z.date({ required_error: "A travel date is required." }),
  charterDays: z.coerce.number().min(1, "Charter must be for at least 1 day."),
  specialInstructions: z.string().optional(),
});

export type CharterDetailsFormData = z.infer<typeof charterDetailsSchema>;

interface CharterTripDetailsProps {
  onNext: (data: CharterDetailsFormData & { travelDate: string }) => void;
  onBack: () => void;
  initialData: Partial<CharterDetailsFormData>;
}

export const CharterTripDetails = ({ onNext, onBack, initialData }: CharterTripDetailsProps) => {
  const form = useForm<CharterDetailsFormData>({
    resolver: zodResolver(charterDetailsSchema),
    defaultValues: {
      ...initialData,
      travelDate: initialData.travelDate ? new Date(initialData.travelDate) : new Date(),
      charterDays: initialData.charterDays || 1,
    },
  });

  const onSubmit = (data: CharterDetailsFormData) => {
    onNext({ ...data, travelDate: data.travelDate.toISOString() });
  }

  return (
    <div className="h-full flex flex-col bg-card">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
            <main className="flex-1 space-y-6 p-4 md:p-6 overflow-y-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Booking Contact</CardTitle>
                  <CardDescription>Who should we contact about this booking?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="passengerName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="passengerPhone" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number</FormLabel><FormControl><PhoneInput {...field} control={form.control} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Date & Duration</CardTitle>
                  <CardDescription>When and for how long do you need the vehicle?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="travelDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Travel Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("h-12 w-full justify-start text-left font-normal text-base", !field.value && "text-muted-foreground")}><Calendar className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><CalendarIconComponent mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus /></PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="charterDays" render={({ field }) => (<FormItem><FormLabel>Number of Days</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>Let us know if you have any special requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField control={form.control} name="specialInstructions" render={({ field }) => (<FormItem><FormLabel>Special Instructions (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., Please ensure the vehicle is decorated for a wedding." {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
            </main>
            <footer className="p-4 border-t border-border/50 bg-card shrink-0">
              <Button type="submit" className="h-14 w-full text-lg font-bold">
                Continue to Confirmation
              </Button>
            </footer>
          </form>
        </Form>
    </div>
  );
};
