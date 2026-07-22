# BJ Residence — Worker Living

Sajt za BJ Residence, organizovan zajednički smeštaj na adresi Braće Jerković 112, Beograd.

## Tehnologije

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- Tailwind CSS
- Framer Motion (animacije, poštuje `prefers-reduced-motion`)
- lucide-react (ikonice)

## Pokretanje projekta

```bash
npm install
npm run dev
```

Sajt će biti dostupan na [http://localhost:3000](http://localhost:3000).

Ostale komande:

```bash
npm run build   # produkcioni build
npm run start   # pokreće produkcioni build lokalno
npm run lint    # ESLint provera
```

## Struktura projekta

```
src/
  app/                 stranice (Next.js App Router): početna, /privacy, /terms, /api/booking
  components/
    layout/             Header, Footer, WhatsApp dugme, mobilni sticky CTA
    sections/            svih 11 sekcija sajta (Hero, Gallery, BookingForm, FAQ...)
    ui/                  reusable elementi (Button, Container, SectionHeading, Reveal)
  config/
    site.ts              JEDINO mesto za kontakt podatke, adresu, kapacitet, cenu, dostupnost, galeriju
  i18n/
    dictionaries.ts       kompletan SR i EN tekst sajta
    LanguageContext.tsx    React context za prebacivanje jezika (čuva izbor u localStorage)
public/
  images/                placeholder SVG slike (hero, galerija, lokacija, OG slika)
```

## Menjanje sadržaja

**Sve što ćete verovatno menjati često nalazi se na dva mesta:**

1. `src/config/site.ts` — telefon, email, WhatsApp broj, adresa, Google Maps link, broj mesta,
   prikaz cene (`pricing.showPrice`), trenutna dostupnost (`availability`), kategorije/slike galerije.
2. `src/i18n/dictionaries.ts` — svi tekstovi na sajtu, odvojeno za srpski (`sr`) i engleski (`en`).
   Menjajte oba objekta da tekst ostane usklađen na oba jezika.

Kontakt podaci se nigde ne hardkoduju direktno u komponentama — sve čita iz `siteConfig`.

### Prikaz cene

Cena je podrazumevano isključena. Da je uključite, u `src/config/site.ts`:

```ts
pricing: {
  showPrice: true,
  amount: 190,
  currency: "€",
},
```

### Placeholder slike

Sve slike u `public/images/` su generisane SVG ilustracije u boji brenda — služe kao vizuelni
placeholder dok ne budu zamenjene pravim fotografijama. Zamenite fajlove istog imena (ili
ažurirajte putanje u `src/config/site.ts` → `gallery.categories`) pravim `.jpg`/`.webp` fotografijama
istog naziva i odnosa stranica.

## Forma za rezervaciju

Forma šalje POST zahtev na `/api/booking` (`src/app/api/booking/route.ts`). Trenutno je to mock
handler koji loguje upit u konzolu i vraća `{ ok: true }`. Sledeći koraci za povezivanje:

- **Email**: pozvati npr. Resend/SendGrid API unutar `route.ts` i poslati mejl sa `payload` podacima.
- **Supabase**: inicijalizovati Supabase klijent i uraditi `insert` u tabelu `booking_inquiries`.
- **Google Sheets**: koristiti Google Sheets API (service account) i dodati red sa podacima upita.
- **CRM**: poslati `payload` na CRM webhook/API endpoint.

Tip polja i validacija su već definisani u `BookingPayload` interfejsu u `route.ts`, tako da je lako
proširiti bez menjanja frontend forme.

## SR/EN podrška

Jezik se bira preko dugmadi u headeru (`SR` / `EN`) i pamti se u `localStorage`. Svi tekstovi se
učitavaju iz `src/i18n/dictionaries.ts` preko `useLanguage()` hook-a — nema hardkodovanog teksta u
komponentama.

## SEO

- Meta title/description i Open Graph podaci: `src/app/layout.tsx`
- `robots.txt`: `src/app/robots.ts`
- `sitemap.xml`: `src/app/sitemap.ts`
- JSON-LD `LodgingBusiness` schema: `src/components/Schema.tsx`
- OG slika (placeholder): `public/images/og/og-image.svg` — zamenite pravom `.jpg`/`.png` slikom
  1200×630 kada bude dostupna, i ažurirajte putanju u `layout.tsx`.

## Sledeći koraci (predlog)

1. **Prave fotografije** — zameniti SVG placeholdere u `public/images/` pravim fotografijama smeštaja.
2. **Povezati formu** sa email servisom, Supabase ili Google Sheets (vidi sekciju iznad).
3. **Pravi kalendar dostupnosti** — zameniti `siteConfig.availability` pravim izvorom podataka
   (Supabase tabela, Google Calendar, ili slično), po potrebi sa kalendarskim prikazom u
   sekciji dostupnosti.
4. **Domen i deploy** — deploy na Vercel (ili sličan hosting), povezati pravi domen, ažurirati
   `metadataBase` URL u `src/app/layout.tsx` i URL-ove u `robots.ts`/`sitemap.ts`.
5. **Google Maps embed** — ako se obezbedi API ključ, zameniti statični placeholder u sekciji
   lokacije pravom interaktivnom mapom.
6. **Analytics** — dodati Google Analytics / Plausible po potrebi.
