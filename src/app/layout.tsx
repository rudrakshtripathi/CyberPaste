import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CyberPaste - Cyberpunk Pastebin',
  description: 'A cyberpunk-themed code sharing website. Create, share, and view pastes anonymously.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground" suppressHydrationWarning>
        <div className="scanline-overlay" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto py-8 px-4 md:px-8">
            {children}
          </main>
          <footer className="py-4 px-4 md:px-8 border-t border-primary/10 text-center text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} CyberPaste. Signal integrity at 99.9%.{' '}
              <Link href="mailto:contact@cyberpaste.dev" className="text-accent hover:underline">
                Contact
              </Link>
            </p>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
