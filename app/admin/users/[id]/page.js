import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../../components/AdminShell";
import { UserForm } from "../../../../components/UserForm";
import { requireOwner } from "../../../../lib/auth";
import { getUser } from "../../../../lib/db";
import { updateUserAction } from "../../actions";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Edit User ${id}`,
  };
}

export default async function EditUserPage({ params, searchParams }) {
  const { id } = await params;
  const currentUser = await requireOwner();
  const user = getUser(id);
  const query = await searchParams;

  if (!user) {
    notFound();
  }

  return (
    <AdminShell user={currentUser}>
      <div>
        <div>
          <Link className="text-sm font-semibold text-gray-600 hover:text-gray-950" href="/admin/users">
            &lt;- Back to users
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950">
            Edit {user.username}
          </h1>
        </div>
      </div>
      <div className="mt-8">
        <UserForm
          action={updateUserAction.bind(null, user.id)}
          error={query?.error}
          user={user}
        />
      </div>
    </AdminShell>
  );
}
