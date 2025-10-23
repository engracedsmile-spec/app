"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAvailableRoutes, type Route } from "@/lib/routes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const senderReceiverSchema = z.object({
  senderName: z.string().min(2, "Sender name is required."),
  senderPhone: z.string().min(10, "Please enter a valid phone number."),
  senderAddress: z.string().min(3, "Please enter a sender address."),
  receiverName: z.string().min(2, "Receiver name is required."),
  receiverPhone: z.string().min(10, "Please enter a valid phone number."),
  receiverAddress: z.string().min(3, "Please enter a receiver address."),
});

export type SenderReceiverFormData = z.infer<typeof senderReceiverSchema>;

interface SenderReceiverProps {
  onNext: (data: SenderReceiverFormData) => void;
  onBack: () => void;
  initialData: Partial<SenderReceiverFormData>;
}

const AddressInput = ({ field, placeholder }: { field: any, placeholder: string }) => {
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);

  useEffect(() => {
    getAvailableRoutes().then(setAvailableRoutes);
  }, []);

  return (
    <Select onValueChange={field.onChange} value={field.value}>
      <SelectTrigger className="h-12 text-base">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {availableRoutes.map(route => <SelectItem key={route.name} value={route.name}>{route.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
};


export const SenderReceiverDetails = ({ onNext, onBack, initialData }: SenderReceiverProps) => {
  const form = useForm<SenderReceiverFormData>({
    resolver: zodResolver(senderReceiverSchema),
    defaultValues: initialData,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="h-full flex flex-col">
        <header className="p-4 flex items-center gap-2 border-b border-border/50 bg-card/80 backdrop-blur-sm">
          <Button type="button" variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Sender & Receiver</h1>
        </header>
        <div className="flex-1 space-y-6 p-4 md:p-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Sender Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="senderName" render={({ field }) => (<FormItem><FormLabel>Sender Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="senderPhone" render={({ field }) => (<FormItem><FormLabel>Sender Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="senderAddress" render={({ field }) => (<FormItem><FormLabel>Pickup Location</FormLabel><FormControl><AddressInput field={field} placeholder="Select pickup location" /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Receiver Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="receiverName" render={({ field }) => (<FormItem><FormLabel>Receiver Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="receiverPhone" render={({ field }) => (<FormItem><FormLabel>Receiver Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="receiverAddress" render={({ field }) => (<FormItem><FormLabel>Drop-off Location</FormLabel><FormControl><AddressInput field={field} placeholder="Select drop-off location" /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>
        </div>
        <footer className="p-4 border-t border-border/50 bg-card">
          <Button type="submit" className="h-14 w-full text-lg font-bold">
            Continue to Package Details
          </Button>
        </footer>
      </form>
    </Form>
  );
};
