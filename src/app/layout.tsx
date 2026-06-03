import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PawPal - AI Pet Assistant',
  description: 'WhatsApp-first AI pet health assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
