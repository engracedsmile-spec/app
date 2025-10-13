
"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, User, Phone, CheckCircle, Car } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { WelcomeAnimation } from "./animations";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { getFirestore, doc, updateDoc } from "firebase/firestore";
import firebaseApp from '@/firebase/config';
import { ConfirmationResult } from "firebase/auth";
import { sendOtp, confirmOtp } from "@/lib/otp";
import { Separator } from "@/components/ui/separator";
import { LogoFull } from "@/components/icons/logo-full";
import { Preloader } from "@/components/preloader";
import type { User as UserData } from '@/lib/data';
import { Card, CardContent } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";
import { getOperationsSettings, defaultOperationsSettings, OperationsSettings } from "@/lib/settings";
import { Users } from "lucide-react";


const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    phoneNumber: z.string().min(8, "Please enter a valid phone number.").optional().or(z.literal('')),
    password: z.string().min(8, "Password must be at least 8 characters.").optional().or(z.literal('')),
    confirmPassword: z.string().optional(),
    otp: z.string().optional(),
}).refine(data => {
    // Make password checks conditional on them being provided
    if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});


type FormSchemaType = z.infer<typeof formSchema>;

const ProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
    <div className="flex w-full gap-2 px-4">
        {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full bg-muted/50 transition-colors duration-300 ${i < currentStep ? 'bg-primary' : ''}`} />
        ))}
    </div>
);

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.225 0-9.652-3.808-11.303-8.854l-6.571 4.819C9.656 39.663 16.318 44 24 44z" />
    </svg>
)

async function associateGuestTripToUser(tripId: string, userId: string) {
    const db = getFirestore(firebaseApp);
    const tripRef = doc(db, "shipments", tripId);
    try {
        await updateDoc(tripRef, { userId: userId });
         toast.success("Trip Saved!", {
            description: "Your previous booking has been saved to your account.",
        });
    } catch (error) {
        console.error("Error associating trip:", error);
    }
}


function SignupFormComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const authContext = useAuth();
    const { signUp, user, loading: authLoading, signInWithGoogle, auth } = authContext;
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(0);
    const tripId = searchParams.get('tripId');
    const refCode = searchParams.get('ref');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [opsSettings, setOpsSettings] = useState<OperationsSettings | null>(null);

    useEffect(() => {
        getOperationsSettings().then(setOpsSettings);
    }, []);

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
            otp: "",
        },
    });
    
    const handleSuccessfulLogin = async (loggedInUser: UserData) => {
        if (tripId) {
            await associateGuestTripToUser(tripId, loggedInUser.id);
        }
        const redirectPath = loggedInUser.userType === 'admin' ? '/admin/dashboard' : loggedInUser.userType === 'driver' ? '/driver/dashboard' : '/dashboard';
        router.replace(redirectPath);
    };

    useEffect(() => {
        if (!authLoading && user) {
            handleSuccessfulLogin(user);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading]);

    const handleSignup = async (values: FormSchemaType) => {
        setIsLoading(true);
        try {
             if (opsSettings?.requirePhoneVerification) {
                if (!values.otp) throw new Error("OTP is required.");
                const isOtpVerified = await confirmOtp(confirmationResult, values.otp);
                if (!isOtpVerified) {
                    throw new Error("The OTP you entered is incorrect. Please try again.");
                }
            }
    
            if (!values.password) {
                 throw new Error("Password is required.");
            }
    
            await signUp(values.name, values.email, values.password, 'customer', values.phoneNumber, refCode || undefined);
            
            setStep(prev => prev + 1); 
        } catch (error: any) {
            toast.error("Sign Up Failed", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
        } catch(e: any) {
             toast.error("Google Sign-In Failed", { description: e.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        const phoneNumber = form.getValues("phoneNumber");
        if (!phoneNumber) {
            form.setError("phoneNumber", { type: "manual", message: "Phone number is required to send OTP." });
            return;
        }
        setIsLoading(true);
        try {
            const result = await sendOtp(auth, phoneNumber, 'recaptcha-container');
            setConfirmationResult(result);
            toast.success('OTP Sent', { description: `A verification code has been sent to ${phoneNumber}` });
            setStep(prev => prev + 1);
        } catch (error: any) {
            toast.error("Failed to send OTP", { description: error.message || "Please check the phone number and try again." });
        } finally {
            setIsLoading(false);
        }
    }

    const totalAppSteps = opsSettings?.requirePhoneVerification ? 3 : 2;

    const nextStep = async () => {
        let fieldsToValidate: (keyof FormSchemaType)[] = [];
        let isValid = true;
        
        switch(step) {
            case 1:
                fieldsToValidate = ['name', 'email', 'phoneNumber'];
                isValid = await form.trigger(fieldsToValidate);
                if (isValid) {
                    if (opsSettings?.requirePhoneVerification) {
                        await handleSendOtp();
                    } else {
                        setStep(prev => prev + 1);
                    }
                }
                return;
            case 2:
                 fieldsToValidate = opsSettings?.requirePhoneVerification ? ['otp', 'password', 'confirmPassword'] : ['password', 'confirmPassword'];
                 isValid = await form.trigger(fieldsToValidate);
                 if (isValid) await handleSignup(form.getValues());
                 return;
        }
    };
    
    const prevStep = () => setStep(prev => prev > 0 ? prev - 1 : 0);
    
     const handleBack = () => {
        if (step > 0) {
            prevStep();
        } else {
            router.push('/');
        }
    };

    if (authLoading || user || !opsSettings) {
        return <Preloader />;
    }

    const renderStep = () => {
        switch (step) {
            case 0: 
                return (
                     <div className="flex flex-col md:flex-row h-full text-center text-foreground w-full">
                        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-muted/30 p-8">
                           <WelcomeAnimation className="w-64 h-64 mb-8" />
                           <h1 className="text-2xl font-bold">Welcome to Engraced Smiles</h1>
                           <p className="text-muted-foreground mt-2">Your reliable partner for swift and safe travels.</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                            <LogoFull className="h-16 w-auto" />
                            <div className="max-w-sm text-center">
                                <h1 className="text-2xl font-bold tracking-tight">Create Your Account</h1>
                                <p className="mt-2 text-muted-foreground">Join us for premium passenger trips across Nigeria.</p>
                            </div>
                            <div className="w-full max-w-sm space-y-4">
                                {opsSettings.authMethods.email && (
                                    <Button onClick={() => setStep(1)} className="w-full h-12 text-lg">
                                        Sign Up with Email
                                    </Button>
                                )}
                                {opsSettings.authMethods.email && opsSettings.authMethods.google && (
                                    <div className="relative">
                                        <Separator />
                                        <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">OR</span>
                                    </div>
                                )}
                                {opsSettings.authMethods.google && (
                                    <Button variant="outline" className="w-full h-12 text-base font-semibold" onClick={handleGoogleSignIn} disabled={isLoading}>
                                        {isLoading ? <Loader2 className="animate-spin" /> : <><GoogleIcon className="mr-2 h-5 w-5"/> Sign Up with Google</>}
                                    </Button>
                                )}
                                <div className="text-center pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Are you a driver? <Link href="/signup/driver" className="font-semibold text-primary hover:underline">Apply Here</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="p-8 w-full max-w-md">
                        <div id="recaptcha-container"></div>
                        <div className="text-center mb-8">
                            <div className="inline-block p-4 bg-primary/20 rounded-full mb-4">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight">Tell us about yourself</h1>
                            <p className="mt-2 text-muted-foreground">
                               {tripId ? "Create an account to save your trip details." : "This information will be used to create your profile."}
                            </p>
                        </div>
                        <Form {...form}>
                            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl><PhoneInput {...field} control={form.control} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" className="mt-6 h-12 w-full text-lg font-semibold" disabled={isLoading}>
                                    {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending OTP...</> : "Continue"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                );
            case 2:
                return (
                    <div className="p-8 w-full max-w-md">
                        <div className="text-center mb-8">
                            <div className="inline-block p-4 bg-primary/20 rounded-full mb-4">
                                <Phone className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight">Verify & Secure</h1>
                            <p className="mt-2 text-muted-foreground">
                                {opsSettings.requirePhoneVerification 
                                    ? `Enter the 6-digit code sent to ${form.getValues("phoneNumber")} and create your password.`
                                    : "Create a secure password for your new account."
                                }
                            </p>
                        </div>
                        <Form {...form}>
                            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                                {opsSettings.requirePhoneVerification && (
                                     <FormField
                                        control={form.control}
                                        name="otp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Verification Code</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        maxLength={6}
                                                        className="h-16 text-center text-3xl tracking-[1.5rem]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" className="mt-6 h-12 w-full text-lg font-semibold" disabled={isLoading}>
                                    {isLoading ? <><Loader2 className="animate-spin mr-2"/> Creating Account...</> : "Create Account"}
                                </Button>
                                {opsSettings.requirePhoneVerification && (
                                    <Button type="button" variant="link" onClick={handleSendOtp} disabled={isLoading}>
                                        {isLoading ? 'Resending...' : 'Resend Code'}
                                    </Button>
                                )}
                            </form>
                        </Form>
                    </div>
                );
             case 3: 
                return (
                    <div className="flex flex-col h-full text-center text-foreground px-8">
                        <div className="flex-1 flex flex-col justify-center items-center">
                             <div className="p-4 bg-green-500/20 rounded-full mb-8">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                             </div>
                             <h1 className="text-2xl font-bold tracking-tight">
                                Registration Successful!
                            </h1>
                            <p className="mt-4 text-muted-foreground max-w-sm">
                                Your account has been created. Let's head to your dashboard.
                            </p>
                        </div>
                        <div className="p-8 w-full">
                            <Button
                                onClick={() => handleSuccessfulLogin(user!)}
                                className="h-14 w-full text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                Go to Dashboard
                            </Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="flex flex-col h-dvh w-full bg-background text-foreground">
             <div className={cn("absolute top-5 left-0 right-0 z-10 px-4 flex items-center", step > 0 ? "justify-between" : "justify-start")}>
                 <Button variant="ghost" size="icon" onClick={handleBack} className="text-foreground hover:bg-muted disabled:opacity-50">
                    <ArrowLeft className="h-5 w-5"/>
                </Button>
                {step > 0 && step < 3 && (
                    <p className="text-sm text-muted-foreground">Already have an account? <Link href="/signin" className="font-semibold text-primary">Sign In</Link></p>
                )}
            </div>

            <div className="pt-12 flex-1 flex flex-col items-center justify-center">
                <div className="w-full h-full flex flex-col items-center justify-center">
                     {step > 0 && step < 3 && (
                        <div className="w-full max-w-md px-4 mb-8">
                           <ProgressIndicator currentStep={step} totalSteps={totalAppSteps} />
                        </div>
                    )}
                    <div className="flex-1 w-full flex flex-col items-center justify-center">
                        {renderStep()}
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function SignupPage() {
    return (
        <Suspense fallback={<Preloader />}>
            <SignupFormComponent />
        </Suspense>
    )
}
