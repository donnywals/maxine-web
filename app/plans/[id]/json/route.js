import { notFound, redirect } from "next/navigation";
import { getPublicPlanByIdentifier } from "../../../../lib/db";
import { planToPublicJson } from "../../../../lib/plan-json";

export async function GET(_request, { params }) {
  const { id } = await params;
  const plan = getPublicPlanByIdentifier(id);

  if (!plan) {
    notFound();
  }

  if (id === plan.id && plan.slug) {
    redirect(`/plans/${plan.slug}/json`);
  }

  return Response.json(planToPublicJson(plan), {
    headers: {
      "cache-control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
