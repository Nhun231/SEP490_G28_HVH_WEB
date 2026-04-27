import SupabaseProvider from './supabase-provider';
import { PropsWithChildren } from 'react';
import { Roboto } from 'next/font/google';
import '../styles/globals.css';
import AppClientServices from '@/components/AppClientServices';
import { SpeedInsights } from '@vercel/speed-insights/next';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <title>
          Hà Nội Thiện Nguyện - Nền tảng kết nối tình nguyện viên và tổ chức từ
          thiện
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="keywords"
          content="Hà Nội Thiện Nguyện, thiện nguyện, tình nguyện viên, tổ chức từ thiện, cộng đồng"
        />
        <meta
          name="description"
          content="Nền tảng kết nối tình nguyện viên với các tổ chức từ thiện và chương trình cộng đồng tại Hà Nội."
        />
        <meta itemProp="name" content="Hà Nội Thiện Nguyện" />
        <meta
          itemProp="description"
          content="Nền tảng kết nối hoạt động thiện nguyện, tình nguyện và tổ chức từ thiện."
        />
        <meta itemProp="image" content="/img/apple-touch-icon.png" />
        <meta name="twitter:card" content="product" />
        <meta name="twitter:title" content="Hà Nội Thiện Nguyện" />
        <meta
          name="twitter:description"
          content="Nền tảng kết nối tình nguyện viên với các tổ chức từ thiện và chương trình cộng đồng tại Hà Nội."
        />
        <meta name="twitter:image" content="/img/apple-touch-icon.png" />
        <meta property="og:title" content="Hà Nội Thiện Nguyện" />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://your-website.com" />
        <meta property="og:image" content="/img/apple-touch-icon.png" />
        <meta
          property="og:description"
          content="Nền tảng kết nối tình nguyện viên với các tổ chức từ thiện và chương trình cộng đồng tại Hà Nội."
        />
        <meta property="og:site_name" content="Hà Nội Thiện Nguyện" />
        <link rel="canonical" href="https://your-website.com" />
        <link rel="icon" href="/img/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/img/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/img/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/img/apple-touch-icon.png"
        />
      </head>
      <body
        id={'root'}
        className={`loading bg-white overflow-y-scroll ${roboto.className}`}
        suppressHydrationWarning
      >
        <SupabaseProvider>
          <AppClientServices />
          <main id="skip">{children}</main>
        </SupabaseProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
