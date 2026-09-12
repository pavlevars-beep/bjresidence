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
  app/
    (site)/              postojeći sajt: početna, /privacy, /terms (Header/Footer/WhatsApp/CTA layout)
    infopult/            /infopult — kiosk info tabla (bez sajt navigacije, vidi "Info Board")
    admin/                /admin — prijava + upravljanje Info Board sadržajem
    api/booking/          prima upite sa forme, šalje Telegram notifikaciju
    api/availability/      vraća trenutnu dostupnost (čita je BookingForm)
    api/telegram/webhook/  prima komande od Telegram bota (/dostupnost)
    api/info-board/        javni GET config + weather/traffic proxy za /infopult
    api/admin/              login/logout + zaštićen GET/PUT za Info Board config
    layout.tsx             koren layout (html/body/fontovi) — bez sajt navigacije
  components/
    layout/               Header, Footer, WhatsApp dugme, mobilni sticky CTA (koristi (site) layout)
    sections/               svih sekcija sajta (Hero, Gallery, BookingForm, FAQ...)
    ui/                     reusable elementi (Button, Container, SectionHeading, Reveal)
    info-board/             komponente /infopult table (WeatherCard, CleaningCard, QRCard...)
    admin/                  komponente /admin panela (login, sekcije forme)
  config/
    site.ts                JEDINO mesto za kontakt podatke, adresu, kapacitet, cenu, dostupnost, galeriju
  i18n/
    dictionaries.ts         kompletan SR i EN tekst sajta
    LanguageContext.tsx      React context za prebacivanje jezika sajta (localStorage)
    info-board-dictionary.ts SR/EN tekst za /infopult (odvojeno od sajta, svoj jezički izbor)
    InfoBoardLanguageContext.tsx  isto što LanguageContext, ali za /infopult
  lib/
    telegram.ts             slanje poruka botu
    availability-store.ts   čitanje/pisanje trenutne dostupnosti (data/availability.json)
    admin-auth.ts            provera lozinke + potpisana sesija za /admin
    info-board.ts             tipovi + podrazumevane vrednosti Info Board konfiguracije
    info-board-store.ts       čitanje/pisanje Info Board konfiguracije (data/info-board.json)
    weather-codes.ts           mapiranje WMO kodova vremena na ikonicu/tekst
    board-format.ts            formatiranje datuma/vremena za Europe/Belgrade
    use-polled-resource.ts     hook za periodično osvežavanje sa localStorage keš-om
public/
  images/                  placeholder SVG slike (hero, galerija, lokacija, OG slika)
.env.local.example         šablon za TELEGRAM_*/ADMIN_*/GOOGLE_MAPS_API_KEY (vidi "Telegram bot", "Info Board")
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

Broj slobodnih mesta koji `/dostupnost` menja čuva se preko `src/lib/availability-store.ts` — vidi
sekciju "Trajno skladištenje (Vercel Blob)" ispod za detalje o tome gde i kako se to trajno čuva na
produkciji.

## Info Board (/infopult tabla na tabletu + /admin)

`/infopult` je digitalna informativna tabla namenjena tabletu montiranom u hodniku BJ Residence
(landscape orijentacija, otvara se preko kiosk browsera kao [Fully Kiosk
Browser](https://www.fully-kiosk.com/)). Nema navigaciju sajta, ne skroluje se na uobičajenim
tablet rezolucijama i sam se osvežava — jednom otvorena, tableta se ne mora dirati.

Sadržaj (čišćenje, obaveštenje, "ove nedelje", saobraćaj, Wi-Fi/kontakt, QR kod) uređuje se na
`/admin`, zaštićeno lozinkom.

### Podešavanje (jednom)

U `.env.local` (i u environment promenljivama hostinga posle deploy-a) popunite:

```
ADMIN_PASSWORD=maslina-4018-breza
ADMIN_SESSION_SECRET=69b78c53b08bbec4970a01fdb738581cb85f533397221e4913f9a7f2f3b6118b
```

(Ovo su primer vrednosti generisane za vas — možete ih zadržati ili zameniti svojim. Samo
`ADMIN_PASSWORD` je ono što kucate pri prijavi na `/admin`; `ADMIN_SESSION_SECRET` je tehnički
podatak koji server koristi da potpiše sesiju posle prijave, njega nikad ne kucate.)

Bez ova dva, `/admin` odbija prijavu (i login forma to jasno kaže). Isti `ADMIN_PASSWORD` važi za
ceo `/admin` panel — nema odvojenih naloga po sekciji.

### Korišćenje

1. Otvorite `https://VAS-DOMEN.com/admin`, prijavite se sa `ADMIN_PASSWORD`.
2. Popunite/izmenite sekcije (čišćenje, obaveštenje, "ove nedelje", saobraćaj, Wi-Fi/mir/kontakt,
   QR) i kliknite **Sačuvaj izmene**.
3. Na tabletu otvorite `https://VAS-DOMEN.com/infopult` u kiosk browseru (podesite ga da se automatski
   pokreće i osvežava posle restarta uređaja/struje). Izmene iz admina se pojave na tabletu u roku
   od oko 45 sekundi, bez ručnog osvežavanja.
4. Isključene ili prazne sekcije (npr. nema aktivnog obaveštenja, nema stavki za ovu nedelju) se
   automatski sklanjaju sa table — raspored kartica se sam prilagođava.

Jezik na tableti (`SR`/`EN`, dole desno) je nezavisan od jezika glavnog sajta i pamti se lokalno u
tom browseru.

**Šta je automatsko, a šta ručno unosite:**

- **Automatsko, ništa ne dirate** — vreme (temperatura, prognoza) i vremenska prognoza za sutra.
  Osvežava se samo.
- **Automatsko posle jednog podešavanja** — saobraćaj/vreme vožnje. Jednom upišete procenu (npr.
  "Centar" → 22 min) i to ostaje, tabla to ne traži ponovo. Ako kasnije podesite Google API ključ
  (vidi ispod), postaje uživo umesto procene — ali nije obavezno.
- **Ručno unosite kad se nešto promeni** — čišćenje (datum/vreme), važna obaveštenja, i eventualno
  "ove nedelje" stavke. To je jedino što stvarno pratite iz nedelje u nedelju.

### Vreme (weather)

Koristi [Open-Meteo](https://open-meteo.com/) — potpuno besplatno, bez API ključa, bez registracije
i bez ikakve pretplate, preko `src/app/api/info-board/weather/route.ts`. Ne treba vam nalog nigde
niti kartica za plaćanje — samo radi, odmah.

### Saobraćaj (traffic)

Kartica "Saobraćaj sada" prikazuje procenjeno vreme vožnje po odredištu, koje **jednom** unesete u
`/admin` (npr. "Centar" → 22 min) — to je besplatno i dovoljno za svakodnevnu upotrebu, tabla ga ne
traži ponovo. Ako kasnije poželite vreme vožnje uživo (koje se menja sa saobraćajem tokom dana), to
zahteva Google Maps Distance Matrix API: nalog na [Google Cloud
Console](https://console.cloud.google.com/), povezanu karticu za naplatu (Google traži karticu čak
i za besplatni deo — trenutno daju mesečni besplatni kredit koji za jednu tablu s par odredišta
praktično nikad ne potrošite, ali kartica mora biti povezana). Ako podesite `GOOGLE_MAPS_API_KEY`
(server-side, nikad se ne šalje ka tableti/browseru), kartica automatski pređe na to uživo vreme —
ključ nije obavezan, sajt radi ispravno i bez njega, sa unetom procenom.

### Napomena o skladištenju

Info Board konfiguracija čuva se preko `src/lib/info-board-store.ts` — vidi sekciju "Trajno
skladištenje (Vercel Blob)" ispod.

## Trajno skladištenje (Vercel Blob)

Sav sadržaj koji se menja iz `/admin` (Info Board, Info Point, prijave kvarova, dostupnost) i
fotografije uz prijave kvarova čuvaju se preko [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
— privatno skladište povezano sa vašim Vercel projektom, a NE u fajlovima na disku. Ovo je zamena za
raniji pristup (JSON fajlovi u `data/`), koji na Vercel-u ne radi pouzdano jer je fajl-sistem tamo
read-only.

**Podešavanje (jednom, na Vercel-u):**

1. Vercel dashboard → vaš projekat → **Storage** → **Create Database** → izaberite **Blob**
2. Povežite ga sa ovim projektom — Vercel automatski podešava `BLOB_READ_WRITE_TOKEN` za sve
   production i preview deploy-eve. Ne treba ništa ručno da upisujete u environment varijable.
3. To je sve — sledeći deploy će koristiti Blob umesto lokalnih fajlova.

**Lokalni razvoj** (`npm run dev`) ne zahteva ovo — ako `BLOB_READ_WRITE_TOKEN` nije podešen, sajt
automatski koristi lokalne JSON fajlove u `data/` (isto kao ranije), tako da razvoj i dalje radi bez
ikakvog dodatnog podešavanja.

Implementacija je u `src/lib/blob-store.ts` (JSON "baza") i `src/lib/info-point-uploads.ts`
(fotografije) — oba fajla imaju identičnu logiku: koriste Blob ako je token dostupan, inače padaju
nazad na lokalni fajl-sistem.

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
   sekciju "Telegram bot" iznad) i trajno se čuva preko Vercel Blob (vidi sekciju iznad); za nešto
   ozbiljnije potrebe razmisliti o pravom kalendarskom prikazu (Google Calendar ili slično).
4. **Domen i deploy** — deploy na Vercel (ili sličan hosting), povezati pravi domen, ažurirati
   `metadataBase` URL u `src/app/layout.tsx` i URL-ove u `robots.ts`/`sitemap.ts`.
5. **Google Maps embed** — ako se obezbedi API ključ, zameniti statični placeholder u sekciji
   lokacije pravom interaktivnom mapom. (Za saobraćaj na `/infopult` tabli, `GOOGLE_MAPS_API_KEY` je već
   podržan — vidi sekciju "Info Board" iznad.)
6. **Analytics** — dodati Google Analytics / Plausible po potrebi.
7. **Info Board na pravoj bazi** — ako pređete na Supabase/sličnu bazu za dostupnost (tačka 3), po
   istom principu prebaciti i `data/info-board.json` (vidi "Info Board" → "Napomena o skladištenju").
