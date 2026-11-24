import { allServices, faq } from './content'
import { contacts } from './config'

export function structuredData(siteUrl: string) {
  const id = `${siteUrl}/#studio`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': id,
        name: 'Magical Fox Studio',
        description: 'Розробка сайтів, інтернет-магазинів, ботів, парсерів, CRM, автоматизація бізнесу та кібербезпека.',
        areaServed: 'UA',
        ...(siteUrl && { url: `${siteUrl}/`, logo: `${siteUrl}/apple-touch-icon.png`, image: `${siteUrl}/og.png` }),
        ...(contacts.email && { email: contacts.email }),
        ...(contacts.phone && { telephone: contacts.phone }),
        ...(contacts.telegram && { sameAs: [`https://t.me/${contacts.telegram}`] }),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Послуги',
          itemListElement: allServices.map((s) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: s.name, description: s.text },
          })),
        },
      },
      {
        '@type': 'WebSite',
        name: 'Magical Fox Studio',
        inLanguage: 'uk',
        publisher: { '@id': id },
        ...(siteUrl && { url: `${siteUrl}/` }),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  }
}
