/**
 * Blog content for the public site. English-only by design (SEO content targeting
 * international, English-searching visitors). Add new posts to `blogPosts` — the
 * index and detail pages, sitemap, and JSON-LD all read from this array.
 */

export type BlogSection =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "cta" }
  | { type: "sources"; items: string[] };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  coverImage: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  sections: BlogSection[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "cheap-accommodation-belgrade-price-guide",
    title: "Cheap Accommodation in Belgrade: A Realistic Price Guide",
    description:
      "What cheap accommodation in Belgrade really costs in 2026 — hostel dorm prices, where the budget beds actually are, and why a private monthly stay can work out cheaper than a dorm bed.",
    excerpt:
      "Dorm beds, private rooms, and monthly stays — what budget accommodation in Belgrade actually costs, and why the center fills up faster than almost anywhere else in Serbia.",
    category: "Budget travel",
    coverImage: "/images/gallery/exterior-1.webp",
    publishedAt: "2026-10-12",
    updatedAt: "2026-10-12",
    readingTime: "7 min read",
    sections: [
      {
        type: "p",
        text:
          "Belgrade has quietly become one of the busiest short-stay markets in the Balkans. More visitors, more listings, and a tourist core that fills up faster each year — which makes finding genuinely cheap accommodation in Belgrade a bit more work than it used to be. Here's what things actually cost right now, where the budget beds are concentrated, and when a private room ends up cheaper than a hostel dorm.",
      },
      { type: "h2", text: "Belgrade's accommodation market right now" },
      {
        type: "p",
        text:
          "Belgrade isn't a quiet secondary city anymore. It already pulls in the largest share of Serbia's overnight stays of any region — close to 29% of the national total — and in the first eleven months of 2025 alone, the city logged roughly 1.18 million foreign visits, more than any other city in the country. Short-term rental supply has grown just as fast: Belgrade added more new listings than any other Serbian city in 2025, and average occupancy on short-stay platforms now sits around 55–60% year-round, higher in spring and autumn. That combination — rising demand, fast-growing supply, and a city center that's a fixed size — is exactly why cheap beds in Belgrade disappear quickly, especially for anything longer than a weekend.",
      },
      { type: "h2", text: "What \"cheap\" actually costs in Belgrade" },
      {
        type: "p",
        text:
          "A dorm bed in a Belgrade hostel typically runs €8–16 a night, with most places clustering around €10–14. A private room in a hostel or budget guesthouse is closer to €20–30 a night. Both numbers climb on weekends, during conferences, and in the busier spring and early-autumn months — some hostels openly list winter or peak-season surcharges of 50% or more over their base rate. Add the city's tourist tax, which most budget places don't fold into the headline price, and the number on the booking page is rarely the number you actually pay.",
      },
      { type: "h2", text: "The catch: cheap for a weekend isn't cheap for a month" },
      {
        type: "p",
        text:
          "Here's the math that trips people up. A €12 dorm bed sounds cheap — until you multiply it by 30 nights and land on roughly €360–420 a month, before tourist tax, before weekend surcharges, and without so much as a lockable room. A private hostel room at €25 a night works out to around €750 a month for a space you're still sharing a bathroom and kitchen in with a rotating cast of short-stay guests. Hostels are built — and priced — for travelers staying two or three nights, not for anyone who needs a bed for a few weeks or a few months. If that's you, the \"cheap\" option on a booking site is often not the cheapest option available in the city.",
      },
      { type: "h2", text: "Where Belgrade's budget hostels actually are" },
      {
        type: "p",
        text:
          "Almost all of the city's cheap hostel beds sit inside a very small radius in Stari Grad, the old town:",
      },
      {
        type: "ul",
        items: [
          "Around Republic Square and the Knez Mihailova pedestrian street — the single densest concentration of hostels in the city, walking distance to everything, and the first area to sell out.",
          "Skadarlija, the old bohemian quarter — quieter at night than Republic Square, but still central, and popular with budget travelers who want character over convenience.",
          "Dorćol, Belgrade's oldest district — a short walk from the center, slightly calmer, with a growing number of budget guesthouses alongside the hostels.",
        ],
      },
      {
        type: "p",
        text:
          "That concentration is great for sightseeing and nightlife, and it's exactly why those same blocks are the first to hit full occupancy during peak weeks — you're competing with every other budget traveler in the city for the same few hundred beds.",
      },
      { type: "h2", text: "The alternative: private accommodation outside the tourist squeeze" },
      {
        type: "p",
        text:
          "If you need somewhere to stay for a month or longer — relocating for work, starting a new job, studying, or just based in Belgrade for a stretch — fighting for a hostel bed in the busiest four blocks of the city stops making sense. BJ Residence is a quiet, privately run shared residence a short ride from the center, in Braće Jerković, built specifically for people staying a month or more: your own private room, a proper kitchen and laundry you're not sharing with strangers checking in and out every two nights, and pricing by the month instead of by the night. For a 30-night stay, that very often costs less than a hostel dorm bed — with none of the noise, lockers, or re-booking.",
      },
      { type: "cta" },
      { type: "h2", text: "Quick answers" },
      { type: "h3", text: "Is Belgrade cheap to stay in?" },
      {
        type: "p",
        text:
          "For short stays, yes — dorm beds from around €10 a night are still inexpensive by European standards. For stays of a month or more, a private monthly residence is usually the cheaper and more comfortable option once you add up nightly hostel rates.",
      },
      { type: "h3", text: "What's the cheapest area to stay in Belgrade?" },
      {
        type: "p",
        text:
          "Stari Grad (Republic Square, Knez Mihailova, Skadarlija) and Dorćol have the highest concentration of budget hostels, but they're also the first areas to fill up during busy periods.",
      },
      { type: "h3", text: "What's cheaper for a month: a hostel or a private residence?" },
      {
        type: "p",
        text:
          "Run the numbers before booking a dorm bed month to month. A €12–14 nightly rate adds up to roughly €360–420 over 30 nights, often before tax and weekend surcharges — frequently more than a dedicated monthly residence charges for a private room.",
      },
      {
        type: "sources",
        items: [
          "AirDNA — Belgrade short-term rental occupancy and seasonality data (2025)",
          "Airbtics — Serbia short-term rental market report (2025)",
          "Statistical Office of the Republic of Serbia (RZS) — tourism and overnight-stay statistics, 2024–2025",
          "BudgetYourTrip.com — Belgrade hostel dorm and private room price averages",
        ],
      },
    ],
  },
  {
    slug: "why-belgrade-hostels-fill-up-fast",
    title: "Why Belgrade Hostels Fill Up So Fast — And What To Do About It",
    description:
      "Belgrade's hostels sell out faster every year. Here's the occupancy data behind it, why the city center fills first, and what to do if you need a bed for longer than a few nights.",
    excerpt:
      "Rising visitor numbers, fast-growing listings, and a tourist core with a fixed number of beds — why cheap hostel beds in Belgrade vanish fast, and what to book instead for longer stays.",
    category: "Belgrade travel",
    coverImage: "/images/gallery/living-room-1.webp",
    publishedAt: "2026-10-12",
    updatedAt: "2026-10-12",
    readingTime: "6 min read",
    sections: [
      {
        type: "p",
        text:
          "Ask anyone who's tried to book a cheap bed in Belgrade on short notice during spring or early autumn: the good hostels are full. That's not bad luck — it's the predictable result of a city that's getting busier every year without getting any bigger in the middle.",
      },
      { type: "h2", text: "Belgrade is having a moment" },
      {
        type: "p",
        text:
          "Belgrade now accounts for close to 29% of all overnight stays recorded in Serbia — the largest share of any region in the country — and in the first eleven months of 2025 it drew about 1.18 million foreign visits, ahead of every other Serbian city. That's a lot of people converging on roughly the same handful of central neighborhoods.",
      },
      { type: "h2", text: "Supply is growing fast — but demand is growing with it" },
      {
        type: "p",
        text:
          "Belgrade added more new short-term rental listings in 2025 than any other city in Serbia, and on paper that should make things easier. In practice, average occupancy on short-stay platforms still sits around 55–60%, with average nightly rates climbing alongside it. More beds are coming online, but they're filling up almost as fast as they appear — which is exactly why availability for the cheapest options disappears first.",
      },
      { type: "h2", text: "The center fills up before anywhere else" },
      {
        type: "p",
        text:
          "Nearly all of Belgrade's budget hostels sit inside a tight cluster in Stari Grad — around Republic Square, the Knez Mihailova pedestrian street, and the old bohemian quarter of Skadarlija — with a second cluster in neighboring Dorćol. It's the most convenient part of the city to stay in, which is precisely why it's also the first to sell out whenever a conference, festival, or simple seasonal peak pushes demand up. If you're booking for the busiest weeks of the year, or booking late, the cheap beds in that cluster are often the first thing to go.",
      },
      { type: "h2", text: "If you need a bed for more than a few nights" },
      {
        type: "p",
        text:
          "Hostels are optimized for fast turnover — new guests checking in every day or two, dorm beds re-sold as soon as they're free. That's great for a weekend trip and genuinely difficult for anything longer: you're re-booking constantly, paying weekend and peak-season surcharges on top of a nightly rate that was never designed to be paid 30 times in a row, and sharing a room with a different set of strangers every few nights. None of that is a problem if you're building the trip around a short stay. It becomes a real problem if you're relocating for work, starting a new job in Belgrade, or staying for a semester.",
      },
      { type: "h2", text: "A quieter, more private option a short ride from the center" },
      {
        type: "p",
        text:
          "For stays of a month or longer, it's worth looking outside the Stari Grad hostel cluster entirely. BJ Residence is a private shared residence in Braće Jerković, a calm residential part of the city a short ride from the center, built around monthly stays rather than nightly turnover — your own room, a shared kitchen and laundry that isn't reset by new guests every two days, and one monthly rate instead of a nightly one that spikes every weekend. It's a practical fit for employees, students, and anyone staying in Belgrade long enough that \"which hostel has a bed tonight\" stops being a sustainable way to live.",
      },
      { type: "cta" },
      {
        type: "sources",
        items: [
          "Statistical Office of the Republic of Serbia (RZS) — tourism and overnight-stay statistics, 2024–2025 (via Tanjug)",
          "AirDNA — Belgrade short-term rental occupancy, seasonality and year-over-year growth data (2025)",
          "Airbtics — Serbia short-term rental market report (2025), new listings growth by city",
        ],
      },
    ],
  },
  {
    slug: "hostel-vs-private-residence-belgrade-monthly-cost",
    title: "Hostel vs. Private Residence in Belgrade: The Real Monthly Cost",
    description:
      "A hostel dorm bed in Belgrade looks cheap by the night. Here's what it actually costs over a 30-night stay, compared to a private monthly residence — and what you get for the difference.",
    excerpt:
      "Nightly hostel rates look cheap until you multiply by 30. Here's the real monthly math for a budget stay in Belgrade, and what a private residence gets you for the same money.",
    category: "Long-term stays",
    coverImage: "/images/gallery/bedroom-1.webp",
    publishedAt: "2026-10-12",
    updatedAt: "2026-10-12",
    readingTime: "6 min read",
    sections: [
      {
        type: "p",
        text:
          "A €12-a-night dorm bed sounds like the cheapest way to stay in Belgrade. For three nights, it probably is. For thirty, the math changes — and it changes in favor of options most budget travelers never compare against a hostel at all.",
      },
      { type: "h2", text: "The sticker price trick" },
      {
        type: "p",
        text:
          "Hostel pricing is built around the nightly rate, because that's how most guests book — two or three nights at a time. Nightly rates for Belgrade dorm beds generally run €8–16, averaging around €12–14 outside of peak weeks. That number is genuinely competitive for a short trip. It stops being the full story the moment you stay long enough that the nightly rate becomes, in effect, a monthly bill.",
      },
      { type: "h2", text: "Doing the math on a 30-night stay" },
      {
        type: "ul",
        items: [
          "Hostel dorm bed (~€12–14/night): roughly €360–420 for 30 nights — before the city's tourist tax and before the weekend or peak-season surcharges many hostels add on top.",
          "Hostel private room (~€20–30/night): roughly €600–900 for 30 nights, for a room you're often still sharing a bathroom and kitchen with short-stay guests.",
          "A dedicated monthly residence: priced as a flat monthly rate rather than a nightly one, which — because it isn't inflated by weekend and peak-season surcharges stacked 30 times — frequently comes out at or below the dorm-bed total above, for a private room.",
        ],
      },
      {
        type: "p",
        text:
          "The gap isn't really about one option being \"cheap\" and the other \"expensive.\" It's that nightly pricing is built to extract a premium from short stays, and that premium compounds badly over a full month.",
      },
      { type: "h2", text: "What you actually get for the money" },
      {
        type: "p",
        text:
          "Beyond the raw total, a monthly stay in a private residence and a month of hostel-hopping are different experiences. A private room means your things, your sleep schedule, and your space aren't reset every time a new dorm-mate checks in. A kitchen and laundry that belong to the same small group of long-term residents, rather than a revolving set of two-night guests, tends to actually stay usable. And a fixed address for a month or more also matters practically — for work, for deliveries, and for the kind of local registration and paperwork that a hostel booking confirmation generally can't help with.",
      },
      { type: "h2", text: "Who this actually matters for" },
      {
        type: "p",
        text:
          "If you're in Belgrade for a long weekend or a week of sightseeing, a hostel bed in Stari Grad near Republic Square or Skadarlija is still the right call — central, sociable, and genuinely cheap at that length of stay. The comparison above is for the much more common situation that budget-travel pricing ignores: relocating employees, remote workers, students on a semester abroad, or anyone whose stay in Belgrade is measured in weeks or months rather than nights. At that length, it's worth pricing out a private monthly residence before defaulting to a hostel out of habit.",
      },
      {
        type: "p",
        text:
          "BJ Residence runs exactly this kind of monthly setup — private rooms, a shared kitchen and laundry used by a stable group of residents rather than overnight guests, and a quiet residential location in Braće Jerković a short ride from the center. If a hostel's running total for a month has you doing this same math, it's worth getting a quote before you book.",
      },
      { type: "cta" },
      {
        type: "sources",
        items: [
          "BudgetYourTrip.com — Belgrade hostel dorm and private room price averages",
          "Hostelz.com — Serbia hostel pricing overview",
          "CityExpert — Belgrade rental market overview (2025)",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
