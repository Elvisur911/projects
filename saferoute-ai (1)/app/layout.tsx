// ============================================================
// SafeRoute AI — Root Layout
// ============================================================

import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SafeRoute AI — Intelligent Disaster-Safe Routing',
  description:
    'AI-powered routing platform that detects floods, landslides, and road hazards — predicting the safest route, not just the shortest.',
  keywords: ['disaster routing', 'safe route', 'flood detection', 'AI routing', 'emergency navigation'],
  openGraph: {
    title: 'SafeRoute AI',
    description: 'Navigate safely through disaster zones with real-time AI routing',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
