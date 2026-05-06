import { PublicFooter } from "../components/PublicFooter";
import { PublicHeader } from "../components/PublicHeader";

export const metadata = {
  title: "Maxine - Strength training made simple",
  description:
    "Track your gym progress, set exercise goals, and get useful insights that help you continuously improve.",
  alternates: {
    canonical: "https://maxine-app.com",
  },
  openGraph: {
    title: "Maxine - Strength training made simple",
    description:
      "Use Maxine to track your one rep max, set workout goals, and stay motivated with clear insights for every lift.",
    url: "https://maxine-app.com",
    images: ["https://maxine-app.com/assets/images/og_image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maxine - Strength training made simple",
    description:
      "A simple one rep max tracker that helps you set and focus on your workout goals.",
    images: ["https://maxine-app.com/assets/images/og_image.png"],
  },
  other: {
    "apple-itunes-app":
      "app-id=6615073254, app-argument=https://apps.apple.com/nl/app/maxine-one-rep-max-tracker/id6615073254",
  },
};

const features = [
  {
    title: "Easily track workouts",
    image: "/assets/images/feature-1.png",
    body: "Use a paired Apple Watch to track heart rate and burned calories while logging reps, sets, and weights.",
  },
  {
    title: "Set clear goals",
    image: "/assets/images/feature-2.png",
    body: "Keep every goal next to the exercise it belongs to so your next set always has a purpose.",
  },
  {
    title: "Understand progress",
    image: "/assets/images/feature-3.png",
    body: "See useful one rep max estimates and trends without turning every workout into spreadsheet work.",
  },
];

const faqs = [
  {
    q: "What is Maxine?",
    a: "Maxine is an iPhone and Apple Watch app for tracking strength training, goals, and one rep max estimates.",
  },
  {
    q: "Do I need an Apple Watch?",
    a: "No. You can log workouts on iPhone, and the Apple Watch adds automatic workout duration, calories, and heart rate data.",
  },
  {
    q: "Can I use workout plans?",
    a: "Yes. Public plans can be opened on the web, and signed-in users can create and manage their own plans.",
  },
];

export default function HomePage() {
  return (
    <>
      <PublicHeader current="home" />
      <main>
        <section className="relative overflow-hidden py-20 sm:py-16 lg:pb-16 xl:pb-18">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#491964] to-[#37124F]" />
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-20">
              <div className="relative z-10 mx-auto max-w-2xl lg:col-span-7 lg:max-w-none lg:pt-6 xl:col-span-6">
                <div className="mb-6 flex justify-center lg:justify-start">
                  <img
                    src="/assets/images/logos/maxine-app-icon.png"
                    alt="Maxine app icon"
                    className="h-[100px] w-[100px] shrink-0 object-contain drop-shadow-lg lg:h-[150px] lg:w-[150px]"
                  />
                </div>
                <h1 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
                  Maxine - Strength training made simple.
                </h1>
                <p className="mt-6 text-lg text-gray-100">
                  Track your gym progress and set goals for your exercises. Maxine provides useful insights to help you continuously improve your performance.
                </p>
                <p className="mt-4 text-lg text-gray-100">
                  The first step towards reaching your goals is writing them down and tracking your progress. Maxine makes this as straightforward as possible.
                </p>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4">
                  <a
                    href="https://apps.apple.com/nl/app/maxine-one-rep-max-tracker/id6615073254"
                    className="inline-flex items-center"
                  >
                    <img
                      src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-US?size=200x65"
                      alt="Download on the App Store"
                      className="h-[52px] w-auto"
                    />
                  </a>
                </div>
              </div>
              <div className="relative mt-10 sm:mt-20 lg:col-span-5 lg:row-span-2 lg:mt-0 lg:flex lg:items-center lg:justify-center xl:col-span-6">
                <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[44px] sm:max-w-[380px] lg:max-w-[480px]">
                  <img
                    className="h-auto w-full object-contain"
                    src="/assets/images/maxine-app-pic.png"
                    alt="Maxine app preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">
                What makes Maxine great
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Everything you need to consistently improve your workout performance and reach your lifting goals.
              </p>
            </div>
            <div className="mt-12 grid gap-10 lg:grid-cols-3">
              {features.map((feature) => (
                <article
                  className="rounded-3xl bg-white/5 p-8 shadow-sm ring-1 ring-white/20"
                  key={feature.title}
                >
                  <img
                    src={feature.image}
                    alt=""
                    className="mx-auto h-auto w-full max-w-[320px] object-contain"
                  />
                  <h3 className="mt-6 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-white/80">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="why-maxine" className="py-16">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white/5 p-8 text-white ring-1 ring-white/20 lg:p-12">
            <h2 className="text-3xl font-medium tracking-tight">Why Maxine</h2>
            <p className="mt-4 text-lg text-white/80">
              Maxine keeps the logging experience fast so you can stay focused on the workout, then turns the data into simple feedback you can act on next time.
            </p>
          </div>
        </section>

        <section id="faq" className="py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <h2 className="text-3xl font-medium tracking-tight text-white">
              Frequently asked questions
            </h2>
            <div className="mt-8 space-y-4">
              {faqs.map((faq) => (
                <details
                  className="rounded-2xl bg-white/5 p-6 text-white ring-1 ring-white/20"
                  key={faq.q}
                >
                  <summary className="cursor-pointer font-semibold">
                    {faq.q}
                  </summary>
                  <p className="mt-3 text-white/80">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
