import type { Metadata } from "next"
import LandingPage from "@/src/features/marketing/ui/LandingPage"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jjdesertlandscaping.com"

export const metadata: Metadata = {
  title: "Landscaping Services Phoenix AZ | Desert Landscaping, Yard Cleanup & Maintenance",
  description:
    "J&J Desert Landscaping LLC offers professional landscaping in Phoenix, Arizona: desert landscaping, yard cleanup, irrigation, gravel installation, tree trimming, and yard maintenance. Free estimates.",
  keywords: [
    "landscaping Phoenix Arizona",
    "desert landscaping Phoenix",
    "yard cleanup Phoenix AZ",
    "irrigation Phoenix",
    "gravel installation Phoenix",
    "tree trimming Phoenix Arizona",
    "yard maintenance Phoenix",
    "landscaping services Phoenix AZ",
  ],
  openGraph: {
    title: "Landscaping Services Phoenix AZ | J&J Desert Landscaping LLC",
    description:
      "Professional desert landscaping, yard cleanup, irrigation, and yard maintenance in Phoenix, Arizona. Free estimates.",
    locale: "en_US",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Landscaping Phoenix Arizona | J&J Desert Landscaping LLC",
    description: "Professional landscaping services in Phoenix, AZ. Desert landscaping, yard cleanup, irrigation, tree trimming.",
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
}

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "J&J Desert Landscaping LLC",
  description:
    "Professional landscaping services in Phoenix, Arizona. Desert landscaping, yard cleanup, irrigation, gravel installation, tree trimming, and yard maintenance.",
  url: SITE_URL,
  telephone: "+16028242791",
  address: {
    "@type": "PostalAddress",
    addressRegion: "AZ",
    addressLocality: "Phoenix",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 33.4484,
    longitude: -112.074,
  },
  areaServed: {
    "@type": "City",
    name: "Phoenix",
    containedInPlace: { "@type": "State", name: "Arizona" },
  },
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "07:00",
    closes: "18:00",
  },
  sameAs: [],
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <LandingPage />
    </>
  )
}
