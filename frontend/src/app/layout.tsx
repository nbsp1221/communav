import { type Metadata, type Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AppBar } from './AppBar';

const pretendard = localFont({
  src: [
    { path: './fonts/pretendard/pretendard-100.woff2', weight: '100' },
    { path: './fonts/pretendard/pretendard-200.woff2', weight: '200' },
    { path: './fonts/pretendard/pretendard-300.woff2', weight: '300' },
    { path: './fonts/pretendard/pretendard-400.woff2', weight: '400' },
    { path: './fonts/pretendard/pretendard-500.woff2', weight: '500' },
    { path: './fonts/pretendard/pretendard-600.woff2', weight: '600' },
    { path: './fonts/pretendard/pretendard-700.woff2', weight: '700' },
    { path: './fonts/pretendard/pretendard-800.woff2', weight: '800' },
    { path: './fonts/pretendard/pretendard-900.woff2', weight: '900' },
  ],
});

export const metadata: Metadata = {
  title: 'KW Everytime Helper',
};

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={pretendard.className}>
        <header>
          <AppBar />
        </header>
        {children}
      </body>
    </html>
  );
}
