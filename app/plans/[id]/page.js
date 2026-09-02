import { notFound, redirect } from "next/navigation";
import { PublicFooter } from "../../../components/PublicFooter";
import { PublicHeader } from "../../../components/PublicHeader";
import { getPublicPlanByIdentifier, isAppSharedPlan } from "../../../lib/db";

const APP_STORE_URL =
  "https://apps.apple.com/nl/app/maxine-one-rep-max-tracker/id6615073254";

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (id.endsWith(".json")) {
    return {};
  }

  const plan = getPublicPlanByIdentifier(id);
  if (!plan) return {};

  return {
    title: plan.title,
    description: plan.description || (isAppSharedPlan(plan)
      ? "Shared workout plan from Maxine"
      : `Workout plan by ${plan.owner_username}`),
    alternates: {
      canonical: `https://maxine-app.com/plans/${plan.slug}`,
    },
  };
}

export default async function PublicPlanPage({ params }) {
  const { id } = await params;

  if (id.endsWith(".json")) {
    redirect(`/plans/${id.slice(0, -5)}/json`);
  }

  const plan = getPublicPlanByIdentifier(id);

  if (!plan) {
    notFound();
  }

  if (id === plan.id && plan.slug) {
    redirect(`/plans/${plan.slug}`);
  }

  return (
    <>
      <PublicHeader current="plans" />
      <main className="mx-auto max-w-5xl px-6 py-16 text-white lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
          Public workout plan
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
          {plan.title}
        </h1>
        <p className="mt-3 text-white/70">
          {plan.goal || "Workout plan"}
          {isAppSharedPlan(plan) ? " · Shared from Maxine" : ` by ${plan.owner_username}`}
        </p>
        {plan.description ? (
          <p className="mt-6 max-w-3xl text-lg text-white/80">{plan.description}</p>
        ) : null}

        <PlanAppStoreCta planTitle={plan.title} />

        <div className="mt-10 space-y-6">
          {plan.workouts.map((workout, index) => (
            <section
              className="rounded-3xl bg-white/5 p-6 shadow-sm ring-1 ring-white/20"
              key={workout.id}
            >
              <h2 className="text-2xl font-semibold">
                {index + 1}. {workout.name}
              </h2>
              <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-white/10">
                <table className="w-full divide-y divide-white/10 text-left text-sm">
                  <thead className="bg-white/5 text-white/70">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Exercise</th>
                      <th className="px-4 py-3 font-semibold">Sets</th>
                      <th className="px-4 py-3 font-semibold">Reps</th>
                      <th className="px-4 py-3 font-semibold">Weight</th>
                      <th className="px-4 py-3 font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {workout.exercises.map((exercise) => (
                      <tr key={exercise.id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white">{exercise.exercise_name}</p>
                          {exercise.type || exercise.measurement ? (
                            <p className="mt-1 text-xs text-white/60">
                              {[exercise.measurement, exercise.type].filter(Boolean).join(" · ")}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-white/80">{exercise.sets ?? "-"}</td>
                        <td className="px-4 py-3 text-white/80">{exercise.reps ?? "-"}</td>
                        <td className="px-4 py-3 text-white/80">{exercise.weight ?? "-"}</td>
                        <td className="px-4 py-3 text-white/80">
                          {exercise.duration ? `${exercise.duration}s` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        <PlanAppStoreCta planTitle={plan.title} placement="bottom" />
      </main>
      <PublicFooter />
    </>
  );
}

function PlanAppStoreCta({ planTitle, placement = "top" }) {
  return (
    <section
      className={`rounded-3xl bg-white/10 p-6 shadow-sm ring-1 ring-white/20 ${
        placement === "top" ? "mt-8" : "mt-10"
      }`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Import this workout plan into Maxine
          </h2>
          <p className="mt-2 max-w-2xl text-white/80">
            Open {planTitle} in Maxine to track every workout, log sets quickly,
            and keep your progress in one place.
          </p>
        </div>
        <a className="inline-flex shrink-0" href={APP_STORE_URL}>
          <img
            alt="Available on the App Store"
            className="h-[52px] w-auto"
            src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-US?size=200x65"
          />
        </a>
      </div>
    </section>
  );
}
