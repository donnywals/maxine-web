import Link from "next/link";
import { AdminShell } from "../../../../components/AdminShell";
import { PlanEditor } from "../../../../components/PlanEditor";
import { requireUser } from "../../../../lib/auth";
import { listExercises } from "../../../../lib/db";
import { createPlanAction } from "../../actions";

export const metadata = {
  title: "New Plan",
};

export default async function NewPlanPage() {
  const user = await requireUser();
  const exercises = listExercises();

  return (
    <AdminShell user={user}>
      <Link className="text-sm font-semibold text-gray-600 hover:text-gray-950" href="/admin">
        &lt;- Back to plans
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950">
        New workout plan
      </h1>
      <div className="mt-8">
        <PlanEditor action={createPlanAction} exercises={exercises} />
      </div>
    </AdminShell>
  );
}
