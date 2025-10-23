
"use client";

import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Preloader } from '@/components/preloader';

type LegalPageContent = {
    title: string;
    body: string;
}

const defaultTerms = `
# Terms of Service

**Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}**

Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Engraced Smiles mobile application and website (the "Service") operated by Engraced Smiles ("us", "we", or "our").

## Accounts

When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.

## Bookings and Payments

By making a booking through our service, you agree to pay the specified fare. All payments are handled through our secure payment gateway. Cancellations may be subject to a fee, and refunds are processed according to our cancellation policy, which may require contacting support.

## Limitation Of Liability

In no event shall Engraced Smiles, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.

## Governing Law

These Terms shall be governed and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions.

## Changes

We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect.

## Contact Us

If you have any questions about these Terms, please contact us at support@engracedsmiles.com.
`;

// A simple markdown-to-HTML converter
const SimpleMarkdown = ({ content }: { content: string }) => {
    const html = content
        .split('\n\n') // Split by paragraphs
        .map(paragraph => {
            // Handle headings
            if (paragraph.startsWith('# ')) return `<h2 class="text-2xl font-bold mt-6 mb-2">${paragraph.substring(2)}</h2>`;
            if (paragraph.startsWith('## ')) return `<h3 class="text-xl font-semibold mt-4 mb-2">${paragraph.substring(3)}</h3>`;
            
            // Handle list items
            if (paragraph.startsWith('* ')) {
                const listItems = paragraph.split('\n').map(item => `<li class="ml-4">${item.substring(2)}</li>`).join('');
                return `<ul class="list-disc list-inside space-y-1">${listItems}</ul>`;
            }

            return `<p class="text-base leading-relaxed">${paragraph.replace(/\n/g, '<br/>')}</p>`;
        })
        .join('');

    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}


export default function TermsOfServicePage() {
    const router = useRouter();
    const [content, setContent] = useState<LegalPageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const db = getFirestore(firebaseApp);
            const docRef = doc(db, "settings", "termsOfService");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setContent(docSnap.data() as LegalPageContent);
            } else {
                const defaultContent = { title: "Terms of Service", body: defaultTerms };
                await setDoc(docRef, defaultContent);
                setContent(defaultContent);
            }
            setLoading(false);
        };
        fetchContent();
    }, []);
    
    if (loading) {
        return <Preloader />;
    }

    return (
        <div className="bg-background min-h-dvh">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 h-16 flex items-center">
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
                        <ArrowLeft />
                    </Button>
                    <h1 className="text-xl font-bold">{content?.title || "Terms of Service"}</h1>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                <Card className="max-w-4xl mx-auto shadow-lg">
                    <CardContent className="p-6 md:p-8">
                         <SimpleMarkdown content={content?.body || "Loading content..."} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
