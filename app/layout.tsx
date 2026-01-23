import type { Metadata, Viewport } from 'next';
import AuthInitializer from '@/src/components/AuthInitializer';
import { Providers } from './providers';
import { QueryProvider } from '@/src/providers/QueryProvider';
import { SSEProvider } from '@/src/providers/SSEProvider';

export const metadata: Metadata = {
  title: {
    default: 'Evena - Event Ticket Management System',
    template: '%s | Evena',
  },
  description:
    'Discover, book, and manage tickets for the best events, concerts, festivals, and conferences. Your gateway to unforgettable experiences.',
  keywords: [
    'events',
    'tickets',
    'concerts',
    'festivals',
    'conferences',
    'event management',
    'ticket booking',
    'online tickets',
  ],
  authors: [{ name: 'Evena Team' }],
  creator: 'Evena',
  publisher: 'Evena',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://evena.com',
    title: 'Evena - Event Ticket Management System',
    description: 'Discover and book tickets for the best events. Your gateway to unforgettable experiences.',
    siteName: 'Evena',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evena - Event Ticket Management',
    description: 'Discover and book tickets for the best events',
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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Font Awesome CSS */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }} suppressHydrationWarning>
        <QueryProvider>
          <Providers>
            <SSEProvider>
              <AuthInitializer />
              {children}
            </SSEProvider>
          </Providers>
        </QueryProvider>
      </body>
    </html>
  );
}
