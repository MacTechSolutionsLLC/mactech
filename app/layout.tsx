import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import ConditionalLayout from '@/components/ConditionalLayout'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'MacTech Solutions | DoD Cybersecurity, Infrastructure & Compliance',
  description: 'Veteran-owned consulting firm specializing in RMF, ATO, infrastructure engineering, and audit readiness for federal programs and defense contractors.',
  keywords: ['DoD', 'RMF', 'ATO', 'Cybersecurity', 'SDVOSB', 'Federal Contractor', 'STIG', 'Compliance'],
  metadataBase: new URL('https://mactech-solutions.com'),
  openGraph: {
    title: 'MacTech Solutions | DoD Cybersecurity, Infrastructure & Compliance',
    description: 'Veteran-owned consulting firm specializing in RMF, ATO, infrastructure engineering, and audit readiness for federal programs and defense contractors.',
    url: 'https://mactech-solutions.com',
    siteName: 'MacTech Solutions',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MacTech Solutions | DoD Cybersecurity, Infrastructure & Compliance',
    description: 'Veteran-owned consulting firm specializing in RMF, ATO, infrastructure engineering, and audit readiness for federal programs and defense contractors.',
  },
  alternates: {
    canonical: 'https://mactech-solutions.com',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MacTech Solutions LLC',
  url: 'https://mactech-solutions.com',
  logo: 'https://mactech-solutions.com/mactech.png',
  description: 'Veteran-owned consulting firm specializing in DoD cybersecurity, infrastructure engineering, and compliance for federal programs and defense contractors.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'contact@mactech-solutions.com',
    url: 'https://mactech-solutions.com/contact',
  },
  sameAs: [],
  foundingDate: '2024',
  legalName: 'MacTech Solutions LLC',
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    value: 'Small Business',
  },
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
  knowsAbout: [
    'Risk Management Framework',
    'Authorization to Operate',
    'Cybersecurity',
    'Infrastructure Engineering',
    'Compliance',
    'STIG Compliance',
    'DoD Contracting',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <SessionProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  )
}

