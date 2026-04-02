import type { Metadata } from 'next';
import { Inter, Outfit, Fraunces } from 'next/font/google';
import './globals.css';
import './responsive.css';
import Navbar from '@/components/Navbar';
import NotificationToast from '@/components/NotificationToast';
import GradualBlur from '@/components/GradualBlur';
import PageFooter from '@/components/PageFooter';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-brand', style: 'italic' });

export const metadata: Metadata = {
  title: 'ECOZERO | Organic Drinks & Eco-Fresh Blends',
  description: 'Discover ECOZERO — premium organic smoothies, cold-pressed juices, cold coffees and eco-friendly blends crafted for your body and the planet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: '#ffffff' }}>
      <head>
        {/* Blocking script to prevent FOUC — sets bg before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.style.backgroundColor='#ffffff';document.documentElement.style.color='rgb(4,28,11)';`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} ${fraunces.variable} theme-orange`}
        suppressHydrationWarning
        style={{ backgroundColor: '#ffffff', color: 'rgb(4, 28, 11)', margin: 0, padding: 0, overflowX: 'hidden' }}
      >
        <Navbar />
        {children}
        <PageFooter />
        <NotificationToast />
        <GradualBlur preset="footer" target="page" strength={2.5} />
      </body>
    </html>
  );
}

