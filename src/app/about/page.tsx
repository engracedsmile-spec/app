/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Award, Globe, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AboutUsPage = () => {
    const router = useRouter();

    return (
        <div className="bg-background text-foreground min-h-screen">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 h-16 flex items-center">
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push('/')}>
                        <ArrowLeft />
                    </Button>
                    <h1 className="text-xl font-bold">About Us</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <section className="relative h-64 rounded-xl overflow-hidden mb-8">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <h2 className="text-4xl font-extrabold text-white">Your Journey, Our Passion.</h2>
                    </div>
                </section>
                
                <section className="grid md:grid-cols-2 gap-8 mb-12">
                    <div>
                        <h3 className="text-2xl font-bold text-primary mb-4">Our Mission</h3>
                        <p className="text-lg text-muted-foreground">
                            To provide safe, reliable, and comfortable transportation services across Nigeria, connecting cities and people with a smile. We are committed to leveraging technology to create seamless travel experiences for everyone.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-primary mb-4">Our Vision</h3>
                        <p className="text-lg text-muted-foreground">
                            To be the leading tech-driven transportation company in Africa, renowned for our exceptional service, customer satisfaction, and commitment to innovation.
                        </p>
                    </div>
                </section>
                
                <section className="text-center mb-12">
                    <h3 className="text-3xl font-bold mb-6">Our Core Values</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <Award className="h-8 w-8 text-primary" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Safety First</h4>
                            <p className="text-muted-foreground">Your safety is our top priority. Our vehicles are well-maintained and our drivers are thoroughly vetted.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Customer-Centric</h4>
                            <p className="text-muted-foreground">We are obsessed with providing an exceptional experience for our passengers and clients.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <Globe className="h-8 w-8 text-primary" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Innovation</h4>
                            <p className="text-muted-foreground">We continuously seek innovative solutions to make travel and logistics simpler and better.</p>
                        </div>
                    </div>
                </section>
                 <footer className="text-center pt-8 border-t">
                    <p className="text-muted-foreground">&copy; {new Date().getFullYear()} Engraced Smiles. All Rights Reserved.</p>
                    <div className="mt-2">
                         <Link href="/privacy-policy" className="text-sm text-primary hover:underline">Privacy Policy</Link>
                         <span className="mx-2 text-muted-foreground">|</span>
                         <Link href="/terms-of-service" className="text-sm text-primary hover:underline">Terms of Service</Link>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default AboutUsPage;

/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
    