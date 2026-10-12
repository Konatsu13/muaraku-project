
import Link from "next/link";

const lostItems = [
  {
    name: "Scientific Calculator",
    category: "Electronics",
    location: "Room XI PPLG 4",
    date: "Today",
    icon: "🧮",
  },
  {
    name: "Blue Water Bottle",
    category: "Personal Items",
    location: "School Library",
    date: "Yesterday",
    icon: "🧴",
  },
  {
    name: "Black Pencil Case",
    category: "Stationery",
    location: "Classroom",
    date: "2 days ago",
    icon: "✏️",
  },
];

const foundItems = [
  {
    name: "Wireless Earbuds Case",
    category: "Electronics",
    location: "School Canteen",
    date: "Today",
    icon: "🎧",
  },
  {
    name: "Student ID Card",
    category: "Identification",
    location: "Main Hall",
    date: "Yesterday",
    icon: "🪪",
  },
  {
    name: "Black Umbrella",
    category: "Personal Items",
    location: "School Gate",
    date: "2 days ago",
    icon: "☂️",
  },
];

function BrandLogo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF5E36] text-xl font-black text-white">
        M
      </div>
      <span className="text-xl font-extrabold tracking-tight text-[#302923]">
        MuaraKu<span className="text-[#FF5E36]">.id</span>
      </span>
    </Link>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#FF5E36]">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-extrabold tracking-tight text-[#302923] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 leading-7 text-[#756B63]">{description}</p>
    </div>
  );
}

function ItemCard({
  item,
  type,
}: {
  item: (typeof lostItems)[number];
  type: "lost" | "found";
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-[#F0E5DE] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-900/5">
      <div className="relative flex h-48 items-center justify-center bg-[#FFF0E7]">
        <span className="text-7xl transition-transform duration-300 group-hover:scale-110">
          {item.icon}
        </span>

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold ${
            type === "lost"
              ? "bg-[#FFE4DB] text-[#B94427]"
              : "bg-[#E1F5E8] text-[#217A45]"
          }`}
        >
          {type === "lost" ? "Lost item" : "Found item"}
        </span>
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#FF5E36]">
          {item.category}
        </p>
        <h3 className="mt-2 text-lg font-bold text-[#302923]">
          {item.name}
        </h3>

        <div className="mt-4 space-y-2 text-sm text-[#756B63]">
          <p>📍 {item.location}</p>
          <p>🕒 {item.date}</p>
        </div>

        <Link
          href={`/items?type=${type}`}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-[#FF5E36] px-4 py-3 text-sm font-bold text-[#FF5E36] transition hover:bg-[#FF5E36] hover:text-white"
        >
          View items <span className="ml-2">↗</span>
        </Link>
      </div>
    </article>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FFFCF9] text-[#302923]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#F0E5DE] bg-[#FFFCF9]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <BrandLogo />

          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#756B63] md:flex">
            <Link href="/" className="text-[#FF5E36]">
              Home
            </Link>
            <Link href="/items" className="transition hover:text-[#FF5E36]">
              Find Items
            </Link>
            <Link href="/chat" className="transition hover:text-[#FF5E36]">
              Global Chat
            </Link>
            <a href="#how-it-works" className="transition hover:text-[#FF5E36]">
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-[#756B63] transition hover:text-[#FF5E36] sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-xl bg-[#FF5E36] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#FF5E36]/20 transition hover:bg-[#E94D28]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-28 h-96 w-96 rounded-full bg-[#FFE7D9] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#FFF0E7] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#F4D6C7] bg-white px-4 py-2 text-sm font-semibold text-[#A84A2B]">
              <span className="h-2 w-2 rounded-full bg-[#FF5E36]" />
              A more connected community
            </span>

            <h1 className="mt-7 max-w-2xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Find What
              <br />
              Matters.
              <br />
              <span className="text-[#FF5E36]">Return What&apos;s</span>
              <br />
              Found.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-[#756B63] sm:text-lg">
              MuaraKu.id connects people who have lost their belongings
              with those who find them. Start with your school community
              and help every belonging find its way home.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/items"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF5E36] px-6 py-4 font-bold text-white shadow-xl shadow-[#FF5E36]/20 transition hover:-translate-y-0.5 hover:bg-[#E94D28]"
              >
                Find an Item <span>→</span>
              </Link>
              <Link
                href="/report"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E9D8CE] bg-white px-6 py-4 font-bold text-[#302923] transition hover:border-[#FF5E36] hover:text-[#FF5E36]"
              >
                Report an Item <span>↗</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#756B63]">
              <span>✓ Easy to use</span>
              <span>✓ Community-driven</span>
              <span>✓ Safety-conscious</span>
            </div>
          </div>

          {/* Illustration made with CSS, so no extra image dependency is needed */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-5 rounded-[3rem] bg-[#FFE4D5] rotate-3" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white p-5 shadow-2xl shadow-orange-900/10 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#756B63]">
                    Your community
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold">Lost & Found</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0E7] text-2xl">
                  📍
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-4 rounded-2xl bg-[#FFFCF9] p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#FFE7D9] text-3xl">
                    🎒
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">Lost backpack</p>
                    <p className="mt-1 text-sm text-[#756B63]">
                      School library · Today
                    </p>
                  </div>
                  <span className="rounded-full bg-[#FFE4DB] px-2.5 py-1 text-xs font-bold text-[#B94427]">
                    Lost
                  </span>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-[#FFFCF9] p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#E8F5EB] text-3xl">
                    🔑
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">Set of keys</p>
                    <p className="mt-1 text-sm text-[#756B63]">
                      School hall · Yesterday
                    </p>
                  </div>
                  <span className="rounded-full bg-[#E1F5E8] px-2.5 py-1 text-xs font-bold text-[#217A45]">
                    Found
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[#FF5E36] p-5 text-white">
                <p className="text-sm font-medium text-white/80">
                  One small action can make a difference
                </p>
                <p className="mt-1 text-lg font-extrabold">
                  Help something find its way home.
                </p>
              </div>

              <div className="absolute -right-2 top-36 hidden h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-xl sm:flex">
                💬
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-[#F0E5DE] bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionTitle
            eyebrow="Simple and meaningful"
            title="How It Works"
            description="Three simple steps to help lost belongings return to their rightful owners."
          />

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: "📝",
                title: "Report",
                description:
                  "Report a lost or found item with the details that matter.",
              },
              {
                number: "02",
                icon: "🔎",
                title: "Find",
                description:
                  "Search by keyword, category, location, and other useful filters.",
              },
              {
                number: "03",
                icon: "🤝",
                title: "Return",
                description:
                  "Verify ownership privately and coordinate a safer return.",
              },
            ].map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-[#F0E5DE] bg-[#FFFCF9] p-7 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold tracking-widest text-[#FF5E36]">
                    {step.number}
                  </span>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0E7] text-3xl">
                    {step.icon}
                  </span>
                </div>
                <h3 className="mt-7 text-2xl font-extrabold">{step.title}</h3>
                <p className="mt-3 leading-7 text-[#756B63]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Recently lost */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionTitle
            eyebrow="Help someone find it"
            title="Recently Lost"
            description="Items reported missing by members of the community."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lostItems.map((item) => (
              <ItemCard key={item.name} item={item} type="lost" />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/items?type=lost"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E9D8CE] bg-white px-6 py-3 font-bold transition hover:border-[#FF5E36] hover:text-[#FF5E36]"
            >
              View lost items <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recently found */}
      <section className="border-y border-[#F0E5DE] bg-[#FFF8F3] py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionTitle
            eyebrow="Found by the community"
            title="Recently Found"
            description="Help these found belongings reach the people they belong to."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {foundItems.map((item) => (
              <ItemCard key={item.name} item={item} type="found" />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/items?type=found"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E9D8CE] bg-white px-6 py-3 font-bold transition hover:border-[#FF5E36] hover:text-[#FF5E36]"
            >
              View found items <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-[#302923] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
              💬
            </div>
            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold sm:text-4xl">
              More than lost and found.
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-white/70">
              Share announcements, discuss with your community, and help
              create a more caring environment—one connection at a time.
            </p>
            <Link
              href="/chat"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5E36] px-6 py-3.5 font-bold text-white transition hover:bg-[#E94D28]"
            >
              Explore Global Chat <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#F0E5DE] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <BrandLogo />
            <p className="mt-2 text-sm text-[#756B63]">
              Helping every belonging find its way home.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm font-semibold text-[#756B63]">
            <Link href="/items" className="hover:text-[#FF5E36]">
              Find Items
            </Link>
            <Link href="/report" className="hover:text-[#FF5E36]">
              Report Item
            </Link>
            <Link href="/chat" className="hover:text-[#FF5E36]">
              Global Chat
            </Link>
          </div>

          <p className="text-sm text-[#756B63]">
            © {new Date().getFullYear()} MuaraKu.id
          </p>
        </div>
      </footer>
    </main>
  );
}
