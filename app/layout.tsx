import AuthInitializer from '@/src/components/AuthInitializer';
import { Providers } from './providers';

export const metadata = {
  title: 'Event Ticket System',
  description: 'Login and Dashboard demo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        {/* <AuthInitializer /> */}
        <Providers>
          <AuthInitializer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
