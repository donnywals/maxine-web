import Link from "next/link";
import { loginAction } from "../actions";

export const metadata = {
  title: "Admin Login",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const hasError = params?.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-[#491964] to-[#37124F] px-6 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <Link className="flex items-center gap-2 font-semibold text-gray-950" href="/">
          <img
            src="/assets/images/logos/maxine-app-icon.png"
            alt=""
            className="h-10 w-10 rounded-xl"
          />
          Maxine
        </Link>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-gray-950">
          Admin login
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to manage workout plans and exercises.
        </p>
        {hasError ? (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
            Invalid username or password.
          </p>
        ) : null}
        <form action={loginAction} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="username">
              Username
            </label>
            <input
              className="mt-2 block w-full rounded-xl border-gray-300"
              id="username"
              name="username"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              className="mt-2 block w-full rounded-xl border-gray-300"
              id="password"
              name="password"
              required
              type="password"
              autoComplete="current-password"
            />
          </div>
          <button className="w-full rounded-full bg-[#491964] px-5 py-3 font-semibold text-white hover:bg-[#37124F]">
            Log in
          </button>
        </form>
      </div>
    </main>
  );
}
