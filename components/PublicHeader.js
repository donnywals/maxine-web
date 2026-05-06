import Link from "next/link";

export function PublicHeader({ current = "home" }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-white lg:px-8">
      <Link className="flex items-center gap-2" href="/">
        <img
          src="/assets/images/logos/maxine-app-icon.png"
          alt="Maxine logo"
          className="h-10 w-10 rounded-xl object-contain"
        />
        <span className="text-lg font-semibold tracking-tight">Maxine</span>
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-medium text-white sm:flex">
        {current === "home" ? (
          <>
            <a className="hover:text-gray-200" href="#features">
              Features
            </a>
            <a className="hover:text-gray-200" href="#why-maxine">
              Why Maxine
            </a>
            <a className="hover:text-gray-200" href="#faq">
              FAQ
            </a>
          </>
        ) : (
          <Link className="hover:text-gray-200" href="/">
            Home
          </Link>
        )}
        <Link className="hover:text-gray-200" href="/blog/">
          Blog
        </Link>
        <Link
          className="rounded-full bg-white px-4 py-2 font-semibold text-[#491964] shadow-sm hover:bg-gray-100"
          href="/admin/login"
        >
          Login
        </Link>
      </nav>
    </header>
  );
}
