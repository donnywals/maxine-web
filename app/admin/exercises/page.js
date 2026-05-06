import Link from "next/link";
import { AdminShell } from "../../../components/AdminShell";
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
            Owner-only list imported from defaults202603.json and served from SQLite.
          </p>
        </div>
        <Link
          className="rounded-full bg-[#491964] px-5 py-3 text-sm font-semibold text-white hover:bg-[#37124F]"
          href="/admin/exercises/new"
        >
          New exercise
        </Link>
      </div>
      <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="divide-y divide-gray-200">
          {exercises.map((exercise) => (
            <Link
              className="block p-5 hover:bg-gray-50"
              href={`/admin/exercises/${exercise.id}`}
              key={exercise.id}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-950">{exercise.name}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {[exercise.measurement, exercise.type].filter(Boolean).join(" · ") || "No metadata"}
                  </p>
                </div>
                <span className="text-sm text-gray-500">{exercise.aliases.length} aliases</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
