import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PawPal.ID - Asisten Kesehatan Hewan AI di WhatsApp | AI Pet Health Assistant',
  description: 'Dapatkan panduan instan untuk kesehatan, perilaku, dan nutrisi hewan peliharaan Anda di WhatsApp. Layanan AI dalam Bahasa Indonesia & English. Konsultasi gratis untuk anjing, kucing, dan hewan peliharaan lainnya.',
  keywords: ['asisten hewan AI', 'kesehatan hewan', 'konsultasi hewan WhatsApp', 'AI pet health', 'dokter hewan online', 'pet care Indonesia', 'kesehatan anjing', 'kesehatan kucing', 'PawPal Indonesia'],
  authors: [{ name: 'PawPal.ID' }],
  creator: 'PawPal.ID',
  publisher: 'PawPal.ID',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://pawpal.id'),
  alternates: {
    canonical: '/',
    languages: {
      'id-ID': '/id',
      'en-US': '/en',
    },
  },
  openGraph: {
    title: 'PawPal.ID - Asisten Kesehatan Hewan AI di WhatsApp',
    description: 'Dapatkan panduan instan untuk kesehatan, perilaku, dan nutrisi hewan peliharaan Anda di WhatsApp. Layanan AI dalam Bahasa Indonesia & English.',
    url: 'https://pawpal.id',
    siteName: 'PawPal.ID',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PawPal.ID - Asisten Kesehatan Hewan AI di WhatsApp',
    description: 'Dapatkan panduan instan untuk kesehatan hewan peliharaan Anda di WhatsApp. AI dalam Bahasa Indonesia & English.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
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
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PawPal.ID',
    description: 'AI Pet Health Assistant on WhatsApp for Indonesia',
    url: 'https://pawpal.id',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Indonesia',
    },
    availableLanguage: ['Indonesian', 'English'],
    provider: {
      '@type': 'Organization',
      name: 'PawPal.ID',
      url: 'https://pawpal.id',
    },
  };

  return (
    <html lang="id">
      <head>
        <meta name="facebook-domain-verification" content="cf9fla32ce4ez60wzbr7z5kvxfvjyu" />
        <meta name="geo.region" content="ID" />
        <meta name="geo.placename" content="Indonesia" />
        <meta name="geo.position" content="-6.2088;106.8456" />
        <meta name="ICBM" content="-6.2088, 106.8456" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
