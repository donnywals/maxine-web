import { PublicFooter } from "../../components/PublicFooter";
import { PublicHeader } from "../../components/PublicHeader";

export const metadata = {
  title: "Terms of Use",
  description: "Terms of use for Maxine.",
  alternates: {
    canonical: "https://maxine-app.com/terms/",
  },
  other: {
    "apple-itunes-app":
      "app-id=6615073254, app-argument=https://apps.apple.com/nl/app/maxine-one-rep-max-tracker/id6615073254",
  },
};

export default function TermsPage() {
  return (
    <>
      <PublicHeader current="terms" />
      <main className="mx-auto max-w-4xl px-6 py-16 text-white lg:px-8">
        <div className="rounded-3xl bg-white/5 p-8 ring-1 ring-white/20 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Maxine
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight">
            Terms of Use
          </h1>
          <div className="mt-8 space-y-6 text-white/80">
            <p>
              By using Maxine, you agree to use the app and website responsibly and only for lawful purposes.
            </p>
            <p>
              Workout information and estimates are provided for tracking and educational purposes. They are not medical advice. Train within your ability and consult a professional when needed.
            </p>
            <p>
              Maxine may change over time as new features are added, including web-based workout plan sharing and administration.
            </p>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
