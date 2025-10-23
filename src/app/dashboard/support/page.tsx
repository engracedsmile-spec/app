
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubHeader } from "@/components/sub-header";

const faqItems = [
    {
        question: "How do I track my trip?",
        answer: "You can track your trip in real-time from the 'My Trips' tab or using the tracking ID on the homepage. You will see the live location of your vehicle."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept payments via your in-app wallet and credit/debit cards. You can fund your wallet or add a new card in the 'Account' > 'Payment Methods' section."
    },
    {
        question: "How is the trip fare calculated?",
        answer: "Our pricing is dynamically calculated by an AI based on factors like distance, time of day, and current demand to give you the fairest price for your seat."
    },
    {
        question: "What if my trip is delayed?",
        answer: "While we strive for timeliness, unforeseen circumstances can cause delays. You can view the 'Delayed' status on the tracking page. If you need more information, please contact our support team."
    }
]

export default function SupportPage() {
    const router = useRouter();
    
    return (
        <>
            <SubHeader title="Help & Support" />

            <main className="p-4 md:p-6 space-y-8">
                <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircleQuestion className="h-6 w-6 text-primary"/>
                            Frequently Asked Questions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Accordion type="single" collapsible className="w-full">
                           {faqItems.map((item, index) => (
                             <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{item.question}</AccordionTrigger>
                                <AccordionContent>{item.answer}</AccordionContent>
                             </AccordionItem>
                           ))}
                        </Accordion>
                    </CardContent>
                </Card>

                <Card className="bg-card/50">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                            Contact Us
                        </CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <Button asChild variant="outline" className="w-full justify-start h-14 text-base">
                            <Link href="/dashboard/messages">
                                <MessageCircleQuestion className="mr-4 h-5 w-5"/>
                                Chat with Support
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-14 text-base">
                            <Phone className="mr-4 h-5 w-5"/>
                           Call Us
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
