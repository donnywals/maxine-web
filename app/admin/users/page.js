import Link from "next/link";
import { AdminShell } from "../../../components/AdminShell";
import { requireOwner } from "../../../lib/auth";
import { listUsers } from "../../../lib/db";

export const metadata = {
  title: "Users",
};

export default async function UsersPage() {
  const user = await requireOwner();
  const users = listUsers();

  return (
    <AdminShell user={user}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
            Users
          </h1>
          <p className="mt-2 text-gray-600">
            Owner-only account management for people who can log in to Maxine Admin.
          </p>
        </div>
        <Link
          className="rounded-full bg-[#491964] px-5 py-3 text-sm font-semibold text-white hover:bg-[#37124F]"
          href="/admin/users/new"
        >
          New user
        </Link>
      </div>
      <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="divide-y divide-gray-200">
          {users.map((account) => (
            <Link
              className="block p-5 hover:bg-gray-50"
              href={`/admin/users/${account.id}`}
              key={account.id}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-950">{account.username}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Created {new Date(account.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                  {account.role}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
