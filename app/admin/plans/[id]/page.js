import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../../components/AdminShell";
import { CopyPlanLinkButton } from "../../../../components/CopyPlanLinkButton";
import { PlanEditor } from "../../../../components/PlanEditor";
import { requireUser } from "../../../../lib/auth";
import { getPlan, listExercises } from "../../../../lib/db";
import { deletePlanAction, updatePlanAction } from "../../actions";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Edit Plan ${id}`,
  };
}

export default async function EditPlanPage({ params }) {
  const { id } = await params;
  const user = await requireUser();
  const plan = getPlan(id, user.id);

  if (!plan) {
    notFound();
  }

  const exercises = listExercises();

  return (
    <AdminShell user={user}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link className="text-sm font-semibold text-gray-600 hover:text-gray-950" href="/admin">
            &lt;- Back to plans
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950">
            Edit {plan.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {plan.is_public ? (
              <Link
                className="text-sm font-semibold text-[#491964]"
                href={`/plans/${plan.slug}`}
              >
                View public page
              </Link>
            ) : (
              <p className="text-sm text-gray-500">
                Link will work publicly after this plan is marked public.
              </p>
            )}
            <CopyPlanLinkButton planSlug={plan.slug} />
          </div>
        </div>
        <form action={deletePlanAction.bind(null, plan.id)}>
          <button className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
            Delete plan
          </button>
        </form>
      </div>
      <div className="mt-8">
        <PlanEditor
          action={updatePlanAction.bind(null, plan.id)}
          exercises={exercises}
          plan={plan}
        />
      </div>
    </AdminShell>
  );
}
