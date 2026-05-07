import Link from "next/link";
import { logoutAction } from "../app/admin/actions";

export function AdminShell({ user, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <Link className="flex items-center gap-2 font-semibold text-gray-950" href="/admin">
            <img
              src="/assets/images/logos/maxine-app-icon.png"
              alt=""
              className="h-8 w-8 rounded-lg"
            />
            Maxine Admin
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link className="font-medium text-gray-700 hover:text-gray-950" href="/admin">
              Plans
            </Link>
            {user.role === "owner" ? (
              <>
                <Link className="font-medium text-gray-700 hover:text-gray-950" href="/admin/exercises">
                  Exercises
                </Link>
                <Link className="font-medium text-gray-700 hover:text-gray-950" href="/admin/users">
                  Users
                </Link>
              </>
            ) : null}
            <Link className="font-medium text-gray-700 hover:text-gray-950" href="/">
              Site
            </Link>
            <form action={logoutAction}>
              <button className="rounded-full bg-gray-950 px-4 py-2 font-semibold text-white hover:bg-gray-800">
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8">{children}</main>
    </div>
  );
}
