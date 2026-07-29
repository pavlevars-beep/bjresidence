# BJ Residence

Sajt za BJ Residence, organizovan zajednički smeštaj na adresi Braće Jerković 112g, Beograd.

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
  app/                 stranice (Next.js App Router): početna, /privacy, /terms
    api/booking/        prima upite sa forme, šalje Telegram notifikaciju
    api/availability/    vraća trenutnu dostupnost (čita je BookingForm)
    api/telegram/webhook/ prima komande od Telegram bota (/dostupnost)
  components/
    layout/             Header, Footer, WhatsApp dugme, mobilni sticky CTA
    sections/            svih 11 sekcija sajta (Hero, Gallery, BookingForm, FAQ...)
    ui/                  reusable elementi (Button, Container, SectionHeading, Reveal)
  config/
    site.ts              JEDINO mesto za kontakt podatke, adresu, kapacitet, cenu, dostupnost, galeriju
  i18n/
    dictionaries.ts       kompletan SR i EN tekst sajta
    LanguageContext.tsx    React context za prebacivanje jezika (čuva izbor u localStorage)
  lib/
    telegram.ts           slanje poruka botu
    availability-store.ts čitanje/pisanje trenutne dostupnosti (data/availability.json)
public/
  images/                placeholder SVG slike (hero, galerija, lokacija, OG slika)
.env.local.example       šablon za TELEGRAM_* environment promenljive (vidi "Telegram bot")
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

Slike smeštaja u `public/images/gallery/` i `public/images/hero/` su generisane SVG ilustracije u
boji brenda — služe kao vizuelni placeholder dok ne budu zamenjene pravim fotografijama smeštaja.
Zamenite fajlove istog imena (ili ažurirajte putanje u `src/config/site.ts` → `gallery.categories`)
pravim `.jpg`/`.webp` fotografijama istog naziva i odnosa stranica.

### Fotografije Beograda

`public/images/belgrade/` sadrži dve stvarne fotografije grada (ušće Save i Dunava, i Beograd na
vodi), korišćene u sekciji Lokacija. Preuzete su sa Wikimedia Commons pod CC BY-SA licencom, zato
sekcija ima vidljiv, sitan kredit ("Foto: Lošmi, Kallerna / Wikimedia Commons"). Ako ih zamenite
sopstvenim fotografijama, taj kredit više nije potreban — uklonite ga u `src/components/sections/Location.tsx`.

### Logo

`public/images/brand/icon-mark.png` je simbol iz logotipa (kućica + grančica, providna pozadina) —
koristi se u headeru i footeru pored teksta "BJ Residence". `src/app/icon.png` i
`src/app/apple-icon.png` su generisani iz istog simbola (favicon i ikonica za početni ekran na
telefonu). `public/images/og/og-image.png` koristi pun logotip (simbol + naziv + slogan).

Slogan "Vaš prostor, vaš mir" (iz logotipa) je zvanični slogan sajta — nema više "Worker Living"
nigde. Koristi se u headeru/footeru (`dict.tagline` u `src/i18n/dictionaries.ts`), u hero eyebrow-u
i kao nadnaslov sekcije "Vaš lični prostor", ali namerno ne svuda (npr. `<title>` taga ostaje kratak
i informativan radi SEO-a). Da promenite gde se slogan pojavljuje, pretražite `dict.tagline` po
`src/i18n/dictionaries.ts` i `src/components/`.

Ako ikada dobijete logo i kao pravi vektor (SVG/AI/Figma), zamenite `icon-mark.png` njegovim SVG
izvozom — bilo bi oštrije na svim rezolucijama i manje kao fajl.

## Forma za rezervaciju

Forma šalje POST zahtev na `/api/booking` (`src/app/api/booking/route.ts`). Trenutno je to mock
handler koji loguje upit u konzolu i vraća `{ ok: true }`. Sledeći koraci za povezivanje:

- **Email**: pozvati npr. Resend/SendGrid API unutar `route.ts` i poslati mejl sa `payload` podacima.
- **Supabase**: inicijalizovati Supabase klijent i uraditi `insert` u tabelu `booking_inquiries`.
- **Google Sheets**: koristiti Google Sheets API (service account) i dodati red sa podacima upita.
- **CRM**: poslati `payload` na CRM webhook/API endpoint.

Tip polja i validacija su već definisani u `BookingPayload` interfejsu u `route.ts`, tako da je lako
proširiti bez menjanja frontend forme.

## Telegram bot

Sajt ima ugrađenu Telegram integraciju sa dve funkcije:

1. **Notifikacije** — svaki upit poslat kroz formu za rezervaciju odmah stiže kao poruka na vaš
   Telegram (ime, telefon, email, datum useljenja, trajanje, broj osoba, napomena).
2. **`/dostupnost` komanda** — direktno iz Telegrama, bez ulaska u kod ili redeploy-a, možete da
   promenite broj slobodnih mesta koji se prikazuje na sajtu (sekcija za rezervaciju).

### Podešavanje (jednom)

**1. Napravite bota preko BotFather-a**

- Otvorite Telegram, potražite `@BotFather` i pošaljite `/newbot`.
- Dajte botu ime i username (mora se završavati na `bot`, npr. `bjresidence_bot`).
- BotFather će vam vratiti **token** oblika `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`.

**2. Saznajte svoj chat ID**

- Pošaljite botu bilo koju poruku (npr. "zdravo") da se "otvori" razgovor.
- U browseru otvorite (zamenite `<TOKEN>`):
  `https://api.telegram.org/bot<TOKEN>/getUpdates`
- U odgovoru potražite `"chat":{"id":123456789,...}` — taj broj je vaš `TELEGRAM_CHAT_ID`.

**3. Popunite environment promenljive**

Kopirajte `.env.local.example` u `.env.local` i popunite:

```bash
cp .env.local.example .env.local
```

```
TELEGRAM_BOT_TOKEN=123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_CHAT_ID=123456789
TELEGRAM_WEBHOOK_SECRET=neki-dugacak-nasumican-string-koji-vi-izmislite
```

`.env.local` se ne komituje u git. Kada deploy-ujete sajt (Vercel, VPS...), iste ove promenljive
unesite u podešavanjima hostinga (environment variables).

**4. Povežite webhook (samo za `/dostupnost` komandu)**

Notifikacije rade čim popunite `.env.local` — ništa dodatno nije potrebno. Da bi radila i
`/dostupnost` komanda, Telegram mora znati gde da šalje vaše poruke botu. Pošto to zahteva da sajt
već bude dostupan na javnom URL-u, ovaj korak radite **nakon deploy-a**:

```bash
curl -F "url=https://VAS-DOMEN.com/api/telegram/webhook" \
     -F "secret_token=<isti string kao TELEGRAM_WEBHOOK_SECRET>" \
     https://api.telegram.org/bot<TOKEN>/setWebhook
```

Za lokalno testiranje `/dostupnost` komande potreban je javno dostupan tunel (npr. `ngrok http 3000`)
i webhook URL koji pokazuje na taj tunel — notifikacije pri slanju forme rade i bez ovoga.

### Korišćenje

U razgovoru sa botom na Telegramu:

- `/dostupnost` — prikazuje trenutni broj slobodnih mesta
- `/dostupnost 3` — postavlja 3 slobodna mesta (sajt će odmah prikazivati "3 / 6")
- `/dostupnost 0` — postavlja da nema slobodnih mesta (sekcija dostupnosti se sakriva na sajtu)
- `/pomoc` — lista komandi

Bot odgovara i prihvata komande **samo** od chat ID-a upisanog u `TELEGRAM_CHAT_ID` — svi drugi
zahtevi na webhook se ignorišu. Dodatno, webhook proverava `secret_token` header, tako da niko ko ne
zna vaš `TELEGRAM_WEBHOOK_SECRET` ne može da šalje lažne komande.

### Napomena o skladištenju

Broj slobodnih mesta koji `/dostupnost` menja čuva se u fajlu `data/availability.json` (kreira se
automatski, nije u git-u). Ovo radi pouzdano ako sajt hostujete kao dugotrajan Node proces (VPS,
Railway, Render, Docker). Ako deploy-ujete na potpuno serverless platformu gde fajl sistem nije
trajan između zahteva, zamenite `src/lib/availability-store.ts` sa pravom bazom (Supabase, Vercel KV
ili slično) — funkcije `getAvailability`/`setAvailability` su jedino mesto koje treba izmeniti.

## SR/EN podrška

Jezik se bira preko dugmadi u headeru (`SR` / `EN`) i pamti se u `localStorage`. Svi tekstovi se
učitavaju iz `src/i18n/dictionaries.ts` preko `useLanguage()` hook-a — nema hardkodovanog teksta u
komponentama.

## SEO

- Meta title/description i Open Graph podaci: `src/app/layout.tsx`
- `robots.txt`: `src/app/robots.ts`
- `sitemap.xml`: `src/app/sitemap.ts`
- JSON-LD `LodgingBusiness` schema: `src/components/Schema.tsx`
- OG slika: `public/images/og/og-image.png` (1200×630), generisana od pravog logotipa. Ako
  redizajnirate logo, ponovo generišite ovu sliku (logo centriran na `#F7F4EE` pozadini).

## Sledeći koraci (predlog)

1. **Prave fotografije** — zameniti SVG placeholdere u `public/images/` pravim fotografijama smeštaja.
2. **Povezati formu** sa email servisom, Supabase ili Google Sheets (vidi sekciju iznad).
3. **Pravi kalendar dostupnosti** — dostupnost se sada može menjati preko Telegram bota (vidi
   sekciju "Telegram bot" iznad); za nešto ozbiljnije potrebe zameniti `data/availability.json`
   pravom bazom (Supabase, Google Calendar, ili slično), po potrebi sa kalendarskim prikazom.
4. **Domen i deploy** — deploy na Vercel (ili sličan hosting), povezati pravi domen, ažurirati
   `metadataBase` URL u `src/app/layout.tsx` i URL-ove u `robots.ts`/`sitemap.ts`.
5. **Google Maps embed** — ako se obezbedi API ključ, zameniti statični placeholder u sekciji
   lokacije pravom interaktivnom mapom.
6. **Analytics** — dodati Google Analytics / Plausible po potrebi.
