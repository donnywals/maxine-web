import Link from "next/link";
import { AdminShell } from "../../../components/AdminShell";
import { ExerciseCatalogBrowser } from "../../../components/ExerciseCatalogBrowser";
import { requireOwner } from "../../../lib/auth";
import { listExercises } from "../../../lib/db";

export const metadata = {
  title: "Exercises",
};

export default async function ExercisesPage() {
  const user = await requireOwner();
  const exercises = listExercises();

  return (
    <AdminShell user={user}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
            Exercise catalog
          </h1>
          <p className="mt-2 text-gray-600">
            Owner-only catalog stored in SQLite and exported at /defaults202603.json.
          </p>
        </div>
        <Link
          className="rounded-full bg-[#491964] px-5 py-3 text-sm font-semibold text-white hover:bg-[#37124F]"
          href="/admin/exercises/new"
        >
          New exercise
        </Link>
      </div>
      <ExerciseCatalogBrowser exercises={exercises} />
    </AdminShell>
  );
}
