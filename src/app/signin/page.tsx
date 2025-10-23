
"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AuthAnimation } from "../auth-animation";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import firebaseApp from '@/firebase/config';
import { Separator } from "@/components/ui/separator";
import { AnimatedLogoIcon } from "@/components/icons/animated-logo-icon";
import { Preloader } from "@/components/preloader";
import type { User } from '@/lib/data';
import { toast } from "sonner";
import { getOperationsSettings, defaultOperationsSettings, OperationsSettings } from "@/lib/settings";

const formSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(1, "Password is required."),
});

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

function SignInFormComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [opsSettings, setOpsSettings] = useState<OperationsSettings | null>(null);
    const tripId = searchParams.get('tripId');

    useEffect(() => {
        getOperationsSettings().then(settings => {
            setOpsSettings(settings);
        });
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleSuccessfulLogin = async (loggedInUser: User) => {
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

    const handleSignin = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            await signIn(values.email, values.password);
            // On success, useEffect will handle redirection with the loggedInUser object
        } catch (error: any) {
            toast.error("Sign In Failed", { description: error.message });
            setIsSubmitting(false); // Only set to false on error
        }
    };
    
    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        try {
            await signInWithGoogle();
             // On success, useEffect will handle redirection
        } catch (error: any) {
            toast.error("Google Sign-In Failed", { description: error.message });
            setIsSubmitting(false);
        }
    };
    
    if (authLoading || user || !opsSettings) {
        return <Preloader />;
    }

    return (
        <div className="flex h-dvh w-full text-foreground md:grid md:grid-cols-2">
            <div className="relative hidden h-full flex-1 md:flex items-center justify-center bg-muted/30">
                <AuthAnimation />
            </div>
            <div className="relative flex flex-1 flex-col items-center justify-center p-4">
                 <Button variant="ghost" size="icon" asChild className="absolute top-4 left-4">
                    <Link href="/">
                        <ArrowLeft />
                    </Link>
                </Button>
                
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <AnimatedLogoIcon className="h-16 w-auto mx-auto mb-4" />
                        <h1 className="text-2xl font-extrabold tracking-tight">Welcome Back</h1>
                        <p className="mt-2 text-muted-foreground">
                            {tripId ? "Sign in to manage your newly booked trip." : "Sign in to book a trip."}
                        </p>
                    </div>

                    {opsSettings.authMethods.email && (
                         <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSignin)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="john.doe@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="********" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="mt-4 h-12 w-full text-lg font-semibold"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                    Sign In
                                </Button>
                            </form>
                        </Form>
                    )}
                   

                    {opsSettings.authMethods.email && opsSettings.authMethods.google && (
                        <div className="relative my-6">
                            <Separator />
                            <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">OR</span>
                        </div>
                    )}
                    
                    {opsSettings.authMethods.google && (
                        <Button variant="outline" className="w-full h-12 text-base font-semibold" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><GoogleIcon className="mr-2 h-5 w-5"/> Sign In with Google</>}
                        </Button>
                    )}


                     <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href={`/signup${tripId ? `?tripId=${tripId}` : ''}`} className="font-semibold text-primary hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SigninPage() {
    return (
        <Suspense fallback={<Preloader />}>
            <SignInFormComponent />
        </Suspense>
    )
}
