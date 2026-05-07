import Link from "next/link";
import { AdminShell } from "../../../../components/AdminShell";
import { UserForm } from "../../../../components/UserForm";
import { requireOwner } from "../../../../lib/auth";
import { createUserAction } from "../../actions";

export const metadata = {
  title: "New User",
};

export default async function NewUserPage({ searchParams }) {
  const user = await requireOwner();
  const params = await searchParams;

  return (
    <AdminShell user={user}>
      <Link className="text-sm font-semibold text-gray-600 hover:text-gray-950" href="/admin/users">
        &lt;- Back to users
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950">
        New user
      </h1>
      <div className="mt-8">
        <UserForm action={createUserAction} error={params?.error} />
      </div>
    </AdminShell>
  );
}
