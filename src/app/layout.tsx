import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PawPal - AI Pet Assistant',
  description: 'WhatsApp-first AI pet health assistant',
  openGraph: {
    title: 'PawPal - AI Pet Assistant',
    description: 'WhatsApp-first AI pet health assistant',
    url: 'https://pawpal.id',
    siteName: 'PawPal',
    locale: 'id_ID',
    type: 'website',
  },
  other: {
    'facebook-domain-verification': 'cf9fla32ce4ez60wzbr7z5kvxfvjyu',
  },
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
