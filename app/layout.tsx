import './globals.css';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AIAssistant from '@/components/ai/AIAssistant';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WandrAI — Plan Your Dream Journey with AI',
  description:
    'AI-powered trip planning with real-time safety scores, budget optimization, and cinematic 3D visuals. Plan smarter, travel safer, discover the world.',
  keywords: ['AI trip planner', 'travel planning', 'itinerary generator', 'travel safety', 'budget travel'],
  authors: [{ name: 'WandrAI' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'WandrAI — Plan Your Dream Journey with AI',
    description: 'AI-powered trip planning with real-time safety, budget optimization, and 3D Earth visuals.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WandrAI — Plan Your Dream Journey with AI',
    description: 'AI-powered trip planning with real-time safety, budget optimization, and 3D Earth visuals.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
        <AIAssistant />
      </body>
    </html>
  );
}
