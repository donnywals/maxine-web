import Link from "next/link";
import { AdminShell } from "../../../../components/AdminShell";
import { ExerciseForm } from "../../../../components/ExerciseForm";
import { requireOwner } from "../../../../lib/auth";

export const metadata = {
  title: "New Exercise",
};

export default async function NewExercisePage({ searchParams }) {
  const query = await searchParams;
  const user = await requireOwner();

  return (
    <AdminShell user={user}>
      <Link className="text-sm font-semibold text-gray-600 hover:text-gray-950" href="/admin/exercises">
        &lt;- Back to exercises
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950">
        New exercise
      </h1>
      <div className="mt-8">
        <ExerciseForm error={query?.error} />
      </div>
    </AdminShell>
  );
}
