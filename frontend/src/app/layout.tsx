import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Instant temporary email',
  description: 'Instant temporary email - Built with Rust + Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
