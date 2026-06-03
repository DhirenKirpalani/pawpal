import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PawPal - AI Pet Assistant',
  description: 'WhatsApp-first AI pet health assistant',
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
