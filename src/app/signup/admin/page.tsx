
"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AnimatedLogoIcon } from "@/components/icons/animated-logo-icon";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});


export default function AdminSignupPage() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const handleSignup = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            await signUp(values.name, values.email, values.password, 'admin');
            toast.success("Admin Account Created", {
                description: "You have been successfully registered as an admin.",
            });
            router.push('/admin/dashboard');
        } catch (error: any) {
            toast.error("Sign Up Failed", {
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-dvh w-full items-center justify-center p-4">
            <Button variant="ghost" size="icon" asChild className="absolute top-4 left-4">
                <Link href="/">
                    <ArrowLeft />
                </Link>
            </Button>
            
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <AnimatedLogoIcon className="h-16 w-auto mx-auto mb-4" />
                    <h1 className="text-3xl font-extrabold tracking-tight">Admin Registration</h1>
                    <p className="mt-2 text-muted-foreground">
                       Create a new administrative account.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                            <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" className="mt-4 h-12 w-full text-lg font-semibold" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Admin Account"}
                        </Button>
                    </form>
                </Form>
                 <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already an admin?{" "}
                    <Link href="/signin" className="font-semibold text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
