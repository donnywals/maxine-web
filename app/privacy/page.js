import { PublicFooter } from "../../components/PublicFooter";
import { PublicHeader } from "../../components/PublicHeader";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Maxine.",
  alternates: {
    canonical: "https://maxine-app.com/privacy/",
  },
  other: {
    "apple-itunes-app":
      "app-id=6615073254, app-argument=https://apps.apple.com/nl/app/maxine-one-rep-max-tracker/id6615073254",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <PublicHeader current="privacy" />
      <main className="mx-auto max-w-4xl px-6 py-16 text-white lg:px-8">
        <div className="rounded-3xl bg-white/5 p-8 ring-1 ring-white/20 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Maxine
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight">
            Privacy Policy
          </h1>
          <div className="mt-8 space-y-6 text-white/80">
            <p>
              Maxine is designed to keep workout tracking simple and respectful of your privacy. Information you enter is used to provide the app and related features.
            </p>
            <p>
              The website uses analytics to understand page visits and improve the product. The app may store workout, goal, and exercise information needed to show your progress.
            </p>
            <p>
              If you have questions about privacy or data associated with Maxine, contact the app owner through the support channel listed in the App Store.
            </p>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
