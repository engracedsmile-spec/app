import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Engraced Smile Logistics - Premium Transportation & Travel Services',
  description: 'Nigeria\'s leading transportation company offering inter-state travel, luxury car rentals, and flight bookings. Safe, reliable, and comfortable journeys across all states.',
  keywords: 'transportation Nigeria, inter-state travel, luxury car rental, flight booking, Sienna vehicles, Lagos Abuja transport',
  authors: [{ name: 'Engraced Smile Logistics' }],
  creator: 'Engraced Smile Logistics',
  publisher: 'Engraced Smile Logistics',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://engracedsmile.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Engraced Smile Logistics - Premium Transportation Services',
    description: 'Nigeria\'s leading transportation company offering inter-state travel, luxury car rentals, and flight bookings.',
    url: 'https://engracedsmile.com',
    siteName: 'Engraced Smile Logistics',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Engraced Smile Logistics',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engraced Smile Logistics - Premium Transportation Services',
    description: 'Nigeria\'s leading transportation company offering inter-state travel, luxury car rentals, and flight bookings.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#79631b" />
        <meta name="msapplication-TileColor" content="#79631b" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
