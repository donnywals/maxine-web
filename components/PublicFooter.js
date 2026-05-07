import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>&copy; {new Date().getFullYear()} Maxine. All rights reserved.</p>
        <div className="flex gap-5">
          <Link className="hover:text-white" href="/privacy/">
            Privacy
          </Link>
          <Link className="hover:text-white" href="/terms/">
            Terms
          </Link>
          <Link className="hover:text-white" href="/download/">
            Download
          </Link>
        </div>
      </div>
    </footer>
  );
}
