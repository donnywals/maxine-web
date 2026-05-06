import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../../components/AdminShell";
import { ExerciseForm } from "../../../../components/ExerciseForm";
import { requireOwner } from "../../../../lib/auth";
import { getExercise } from "../../../../lib/db";
import { deleteExerciseAction } from "../../actions";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Edit Exercise ${id}`,
  };
}

export default async function EditExercisePage({ params }) {
  const { id } = await params;
  const user = await requireOwner();
  const exercise = getExercise(id);

  if (!exercise) {
    notFound();
  }

  return (
    <AdminShell user={user}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link className="text-sm font-semibold text-gray-600 hover:text-gray-950" href="/admin/exercises">
            &lt;- Back to exercises
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950">
            Edit {exercise.name}
          </h1>
        </div>
        <form action={deleteExerciseAction.bind(null, exercise.id)}>
          <button className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
            Delete exercise
          </button>
        </form>
      </div>
      <div className="mt-8">
        <ExerciseForm exercise={exercise} />
      </div>
    </AdminShell>
  );
}
