import Link from "next/link";
import { AdminShell } from "../../components/AdminShell";
import { requireUser } from "../../lib/auth";
import { listAppSharedPlans, listPlansForUser } from "../../lib/db";
import { getPlanTemplates } from "../../lib/templates";
import { deletePlanAction } from "./actions";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const user = await requireUser();
  const plans = listPlansForUser(user.id);
  const templates = getPlanTemplates();
  const sharedPlans = user.role === "owner" ? listAppSharedPlans() : [];

  return (
    <AdminShell user={user}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
            Workout plans
          </h1>
          <p className="mt-2 text-gray-600">
            Signed in as {user.username}. You can only see and edit plans you created
            {user.role === "owner" ? ", plus plans shared from the Maxine app" : ""}.
          </p>
        </div>
        <Link
          className="rounded-full bg-[#491964] px-5 py-3 text-sm font-semibold text-white hover:bg-[#37124F]"
          href="/admin/plans/new"
        >
          New blank plan
        </Link>
      </div>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-gray-950">Start from a template</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <form
              action={`/admin/templates/${template.id}/create`}
              className="rounded-2xl border border-gray-200 p-4"
              key={template.id}
              method="post"
            >
              <h3 className="font-semibold text-gray-950">{template.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{template.goal}</p>
              <button className="mt-4 text-sm font-semibold text-[#491964]">
                Create from template
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
        {plans.length === 0 ? (
          <p className="p-6 text-gray-600">No plans yet. Create a blank plan or start from a template.</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {plans.map((plan) => (
              <Link
                className="block p-6 hover:bg-gray-50"
                href={`/admin/plans/${plan.id}`}
                key={plan.id}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-gray-950">{plan.title}</h2>
                    <p className="mt-1 text-sm text-gray-600">{plan.goal || "No goal set"}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {plan.is_public ? "Public" : "Private"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {user.role === "owner" ? (
        <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-950">Shared from the Maxine app</h2>
            <p className="mt-1 text-sm text-gray-600">
              Public plans posted by the app. Anyone with the share link can open them.
            </p>
          </div>
          {sharedPlans.length === 0 ? (
            <p className="p-6 text-gray-600">No app-shared plans yet.</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {sharedPlans.map((plan) => (
                <div className="flex items-center justify-between gap-4 p-6" key={plan.id}>
                  <div>
                    <h3 className="font-semibold text-gray-950">{plan.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{plan.goal || "No goal set"}</p>
                    <Link
                      className="mt-2 inline-block text-sm font-semibold text-[#491964]"
                      href={`/plans/${plan.slug}`}
                    >
                      View public page
                    </Link>
                  </div>
                  <form action={deletePlanAction.bind(null, plan.id)}>
                    <button className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </AdminShell>
  );
}
