
"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, User, CheckCircle, Car, Key, FileUp, Library, Camera, ShieldOff } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { nigeriaData } from "@/lib/nigeria-data";
import Image from "next/image";
import { PhoneInput } from "@/components/ui/phone-input";
import { getOperationsSettings, type OperationsSettings } from "@/lib/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Preloader } from "@/components/preloader";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    phoneNumber: z.string().min(10, "Please enter a valid phone number."),
    address: z.string().min(10, "Please enter your full residential address."),
    driversLicenseNumber: z.string().min(5, "Please enter a valid license number."),
    licenseIssuingState: z.string({ required_error: "Please select a state." }),
    nin: z.string().min(11, "Please enter your 11-digit NIN.").max(11, "NIN cannot be more than 11 digits."),
    licensePhotoDataUri: z.string().optional(),
    driverPhotoDataUri: z.string().optional(),
});

type FormSchemaType = z.infer<typeof formSchema>;

const ProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
    <div className="flex w-full gap-2 px-4">
        {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full bg-muted/50 transition-colors duration-300 ${i < currentStep ? 'bg-primary' : ''}`} />
        ))}
    </div>
);

const PhotoUpload = ({ label, onFileChange, preview }: { label: string, onFileChange: (dataUri: string) => void, preview: string | null }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onFileChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-2">
            <FormLabel>{label}</FormLabel>
            <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50">
                    {preview ? (
                        <Image src={preview} alt="Preview" width={96} height={96} className="object-cover rounded-md" />
                    ) : (
                        <Camera className="h-8 w-8 text-muted-foreground" />
                    )}
                </div>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <FileUp className="mr-2 h-4 w-4" /> Upload
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
        </div>
    );
};

export default function DriverSignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [settings, setSettings] = useState<OperationsSettings | null>(null);

     useEffect(() => {
        getOperationsSettings().then(setSettings);
    }, []);

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", email: "", phoneNumber: "", address: "", driversLicenseNumber: "", licenseIssuingState: "", nin: "" },
    });

    const handleApplicationSubmit = async (values: FormSchemaType) => {
        setIsLoading(true);
        
        try {
            const response = await fetch('/api/signup/driver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to submit application.");
            }

            setStep(prev => prev + 1);

        } catch (error: any) {
            toast.error("Application Failed", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const totalAppSteps = 3;

    const nextStep = async () => {
        let fieldsToValidate: (keyof FormSchemaType)[] = [];
        let isValid = true;
        switch (step) {
            case 1:
                fieldsToValidate = ['name', 'email', 'phoneNumber', 'address'];
                break;
            case 2:
                fieldsToValidate = ['driversLicenseNumber', 'licenseIssuingState', 'nin'];
                break;
            case 3:
                isValid = await form.trigger(); // Validate all fields before final submission
                if (isValid) await handleApplicationSubmit(form.getValues());
                return;
        }
        isValid = await form.trigger(fieldsToValidate);
        if (isValid) setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev > 1 ? prev - 1 : 1);
    const handleBack = () => step === 1 ? router.push('/signup') : prevStep();
    
    if (settings === null) {
        return <Preloader />;
    }

    if (!settings.driverRegistrationOpen) {
        return (
             <div className="flex h-dvh w-full items-center justify-center bg-background p-4">
                 <Button variant="ghost" size="icon" asChild className="absolute top-4 left-4">
                    <Link href="/signup">
                        <ArrowLeft />
                    </Link>
                </Button>
                <Card className="max-w-md text-center">
                    <CardContent className="p-8">
                        <ShieldOff className="h-12 w-12 text-destructive mx-auto mb-4"/>
                        <h2 className="text-xl font-bold">Applications Closed</h2>
                        <p className="text-muted-foreground mt-2">
                            We are not currently accepting new driver applications. Please check back later.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="p-8 w-full max-w-md">
                        <div className="text-center mb-8"><User className="h-10 w-10 text-primary mx-auto mb-4 p-2 bg-primary/20 rounded-full" /><h1 className="text-2xl font-extrabold tracking-tight">Personal Details</h1><p className="mt-2 text-muted-foreground">Let's start with your basic information.</p></div>
                        <Form {...form}>
                            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><PhoneInput control={form.control} {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Residential Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <Button type="submit" className="mt-6 h-12 w-full text-lg font-semibold">Continue</Button>
                            </form>
                        </Form>
                    </div>
                );
            case 2:
                return (
                    <div className="p-8 w-full max-w-md">
                        <div className="text-center mb-8"><Library className="h-10 w-10 text-primary mx-auto mb-4 p-2 bg-primary/20 rounded-full" /><h1 className="text-2xl font-extrabold tracking-tight">Licensing & Identity</h1><p className="mt-2 text-muted-foreground">Provide your official identification details.</p></div>
                        <Form {...form}>
                            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                                <FormField control={form.control} name="driversLicenseNumber" render={({ field }) => (<FormItem><FormLabel>Driver's License Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="licenseIssuingState" render={({ field }) => (
                                    <FormItem><FormLabel>Issuing State</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger></FormControl><SelectContent>{nigeriaData.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="nin" render={({ field }) => (<FormItem><FormLabel>National Identification Number (NIN)</FormLabel><FormControl><Input inputMode="numeric" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <Button type="submit" className="mt-6 h-12 w-full text-lg font-semibold">Continue</Button>
                            </form>
                        </Form>
                    </div>
                );
            case 3:
                return (
                    <div className="p-8 w-full max-w-md">
                        <div className="text-center mb-8"><FileUp className="h-10 w-10 text-primary mx-auto mb-4 p-2 bg-primary/20 rounded-full" /><h1 className="text-2xl font-extrabold tracking-tight">Document Uploads</h1><p className="mt-2 text-muted-foreground">Please upload clear photos of the following.</p></div>
                        <Form {...form}>
                            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
                                <PhotoUpload label="Driver's License Photo" onFileChange={(uri) => form.setValue('licensePhotoDataUri', uri)} preview={form.getValues('licensePhotoDataUri') || null} />
                                <PhotoUpload label="Your Photo (Passport)" onFileChange={(uri) => form.setValue('driverPhotoDataUri', uri)} preview={form.getValues('driverPhotoDataUri') || null} />
                                <Button type="submit" className="mt-6 h-12 w-full text-lg font-semibold" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : "Submit Application"}</Button>
                            </form>
                        </Form>
                    </div>
                );
            case 4:
                return (
                    <div className="flex flex-col h-full text-center text-foreground px-8">
                        <div className="flex-1 flex flex-col justify-center items-center"><div className="p-4 bg-green-500/20 rounded-full mb-8"><CheckCircle className="h-10 w-10 text-green-500" /></div><h1 className="text-2xl font-bold tracking-tight">Application Submitted!</h1><p className="mt-4 text-muted-foreground max-w-sm">Thank you for applying. We will review your application and get back to you shortly.</p></div>
                        <div className="p-8 w-full"><Button onClick={() => router.push('/')} className="h-14 w-full text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">Back to Home</Button></div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="flex flex-col h-dvh w-full bg-background text-foreground">
            <div className="absolute top-5 left-0 right-0 z-10 px-4 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleBack} className="text-foreground hover:bg-muted"><ArrowLeft className="h-5 w-5" /></Button>
                {step > 0 && step < 4 && (<p className="text-sm text-muted-foreground">Already a driver? <Link href="/signin" className="font-semibold text-primary">Sign In</Link></p>)}
            </div>
            <div className="pt-12 flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-md h-full flex flex-col items-center justify-center">
                    {step > 0 && step < 4 && (<div className="w-full px-4 mb-8"><ProgressIndicator currentStep={step} totalSteps={totalAppSteps} /></div>)}
                    <div className="flex-1 w-full flex flex-col items-center justify-center">{renderStep()}</div>
                </div>
            </div>
        </div>
    );
}
