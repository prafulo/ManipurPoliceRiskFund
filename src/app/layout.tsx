import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'Manipur Police Risk Fund',
  description: 'Membership Subscription Software',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 100"><defs><path id="shield-path" d="M45 2 C20 5, 10 30, 10 50 C10 80, 45 98, 45 98 C45 98, 90 80, 90 50 C90 30, 80 5, 45 2 Z"/><clipPath id="shield-clip"><use href="%23shield-path"/></clipPath></defs><g clipPath="url(%23shield-clip)"><rect width="90" height="50" y="0" fill="%23d92414"/><rect width="90" height="50" y="50" fill="%230033a1"/></g><use href="%23shield-path" fill="none" stroke="%23dcb349" stroke-width="3"/><g><circle cx="45" cy="50" r="30" fill="none" stroke="%23dcb349" stroke-width="2.5"/><g stroke="%23dcb349" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M50 38 C48 35, 42 35, 40 38"/><path d="M41 38 C40 33, 37 32, 37 32 M37 32 L35 30 M37 32 L35 34"/><path d="M49 38 C50 33, 53 32, 53 32 M53 32 L55 30 M53 32 L55 34"/><circle cx="41" cy="42" r="1" stroke-width="1"/><circle cx="45" cy="43" r="1" stroke-width="1"/><circle cx="49" cy="42" r="1" stroke-width="1"/><circle cx="43" cy="42.8" r="1" stroke-width="1"/><circle cx="47" cy="42.8" r="1" stroke-width="1"/><path d="M38 45 C40 55, 60 55, 62 45"/><path d="M62 45 V 65 L 68 70"/><path d="M38 45 V 65 L 32 70"/><path d="M45 55 V 72"/><path d="M55 55 V 72"/><path d="M65 55 Q 70 60 68 65"/></g></g></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
