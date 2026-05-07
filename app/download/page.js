import { redirect } from "next/navigation";

export const metadata = {
  title: "Download Maxine",
  robots: {
    index: false,
    follow: true,
  },
  other: {
    "apple-itunes-app":
      "app-id=6615073254, app-argument=https://apps.apple.com/nl/app/maxine-one-rep-max-tracker/id6615073254",
  },
};

export default function DownloadPage() {
  redirect("https://apps.apple.com/nl/app/maxine-one-rep-max-tracker/id6615073254");
}
