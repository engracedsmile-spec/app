
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

const defaultPrivacyPolicy = `
# Privacy Policy

**Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}**

Engraced Smiles ("us", "we", or "our") operates the Engraced Smiles mobile application and website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.

## Information Collection and Use

We collect several different types of information for various purposes to provide and improve our Service to you.

### Types of Data Collected

* **Personal Data:** While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to: Email address, First name and last name, Phone number, Address, State, Province, ZIP/Postal code, City.

* **Usage Data:** We may also collect information that your browser sends whenever you visit our Service or when you access the Service by or through a mobile device ("Usage Data").

* **Location Data:** We may use and store information about your location if you give us permission to do so (“Location Data”). We use this data to provide features of our Service, to improve and customize our Service.

## Use of Data

Engraced Smiles uses the collected data for various purposes:

* To provide and maintain the Service
* To notify you about changes to our Service
* To allow you to participate in interactive features of our Service when you choose to do so
* To provide customer care and support
* To provide analysis or valuable information so that we can improve the Service
* To monitor the usage of the Service
* To detect, prevent and address technical issues

## Security of Data

The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.

## Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

## Contact Us

If you have any questions about this Privacy Policy, please contact us by email: support@engracedsmiles.com
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


export default function PrivacyPolicyPage() {
    const router = useRouter();
    const [content, setContent] = useState<LegalPageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const db = getFirestore(firebaseApp);
            const docRef = doc(db, "settings", "privacyPolicy");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setContent(docSnap.data() as LegalPageContent);
            } else {
                const defaultContent = { title: "Privacy Policy", body: defaultPrivacyPolicy };
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
                    <h1 className="text-xl font-bold">{content?.title || "Privacy Policy"}</h1>
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
