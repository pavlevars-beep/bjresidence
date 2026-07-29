import { siteConfig } from "@/config/site";

export function LodgingSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: siteConfig.brand.name,
    description: "Organizovan zajednički smeštaj za zaposlene, studente i ljude na privremenom boravku u Beogradu.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Braće Jerković 112g",
      addressLocality: "Beograd",
      addressCountry: "RS",
    },
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    url: siteConfig.location.googleMapsUrl,
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
      { "@type": "LocationFeatureSpecification", name: "Kitchen", value: true },
      { "@type": "LocationFeatureSpecification", name: "Washing machine", value: true },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
