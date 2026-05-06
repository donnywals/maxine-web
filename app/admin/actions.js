"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { login, logout, requireOwner, requireUser } from "../../lib/auth";
import {
  createPlanForUser,
  deleteExercise,
  deletePlanForUser,
  getPlan,
  planInputFromForm,
  updatePlanForUser,
  upsertExercise,
} from "../../lib/db";

export async function loginAction(formData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const user = await login(username, password);

  if (!user) {
    redirect("/admin/login?error=1");
  }

  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/");
}

export async function createPlanAction(formData) {
  const user = await requireUser();
  const id = createPlanForUser(user.id, planInputFromForm(formData));
  revalidatePath("/admin");
  redirect(`/admin/plans/${id}`);
}

export async function updatePlanAction(planId, formData) {
  const user = await requireUser();
  updatePlanForUser(planId, user.id, planInputFromForm(formData));
  revalidatePath("/admin");
  revalidatePath(`/admin/plans/${planId}`);
  revalidatePath(`/plans/${planId}`);
  redirect(`/admin/plans/${planId}`);
}

export async function deletePlanAction(planId) {
  const user = await requireUser();
  deletePlanForUser(planId, user.id);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function saveExerciseAction(formData) {
  await requireOwner();
  const id = upsertExercise({
    id: String(formData.get("id") || ""),
    name: String(formData.get("name") || "").trim(),
    measurement: String(formData.get("measurement") || ""),
    type: String(formData.get("type") || ""),
    note: String(formData.get("note") || ""),
    sets: formData.get("sets"),
    reps: formData.get("reps"),
    weight: formData.get("weight"),
    duration: formData.get("duration"),
    video: String(formData.get("video") || ""),
    aliases: String(formData.get("aliases") || ""),
  });
  revalidatePath("/admin/exercises");
  redirect(`/admin/exercises/${id}`);
}

export async function deleteExerciseAction(exerciseId) {
  await requireOwner();
  deleteExercise(exerciseId);
  revalidatePath("/admin/exercises");
  redirect("/admin/exercises");
}

export async function assertOwnsPlan(planId) {
  const user = await requireUser();
  const plan = getPlan(planId, user.id);
  if (!plan) redirect("/admin");
  return { user, plan };
}
