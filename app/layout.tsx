import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Web3Provider } from '@/components/providers/web3-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pngx.io'),
  title: {
    default: 'PNGX | Secure Steganography Vault',
    template: '%s | PNGX'
  },
  description: 'Military-grade encryption hidden inside images. Zero-knowledge, client-side, and blockchain-verified steganography tool.',
  keywords: ['steganography', 'encryption', 'privacy', 'security', 'blockchain', 'AES-256', 'cryptography', 'secure file sharing'],
  authors: [{ name: 'PNGX Team' }],
  creator: 'PNGX',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pngx.secure',
    title: 'PNGX | Secure Steganography Vault',
    description: 'Hide anything inside any image. Military-grade encryption meets invisible steganography.',
    siteName: 'PNGX',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'PNGX Secure Vault',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PNGX | Secure Steganography Vault',
    description: 'Hide anything inside any image. Zero-knowledge encryption.',
    images: ['/opengraph-image'],
    creator: '@pngx_secure',
  },
  icons: {
    icon: '/assets/pngx-icon.svg',
    shortcut: '/assets/pngx-icon.svg',
    apple: '/assets/pngx-icon.svg',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Web3Provider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
