"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminRedirect } from "../../lib/admin-toast";
import { canManageOwnerRole, login, logout, requireOwner, requireUser } from "../../lib/auth";
import {
  createUser,
  createPlanForUser,
  deleteExercise,
  deletePlanForUser,
  getUser,
  getPlan,
  isValidUserRole,
  planInputFromForm,
  updateUser,
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
  adminRedirect(`/admin/plans/${id}`, "plan_created");
}

export async function updatePlanAction(planId, formData) {
  const user = await requireUser();
  updatePlanForUser(planId, user.id, planInputFromForm(formData));
  revalidatePath("/admin");
  revalidatePath(`/admin/plans/${planId}`);
  revalidatePath(`/plans/${planId}`);
  adminRedirect(`/admin/plans/${planId}`, "plan_saved");
}

export async function deletePlanAction(planId) {
  const user = await requireUser();
  deletePlanForUser(planId, user.id);
  revalidatePath("/admin");
  adminRedirect("/admin", "plan_deleted");
}

export async function saveExerciseAction(formData) {
  await requireOwner();
  const exerciseId = String(formData.get("id") || "");
  const input = {
    id: exerciseId,
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
    equipment: formData.get("equipment"),
  };

  try {
    const id = upsertExercise(input);
    revalidatePath("/admin/exercises");
    revalidatePath(`/admin/exercises/${id}`);
    revalidatePath("/defaults202603.json");
    adminRedirect(`/admin/exercises/${id}`, "exercise_saved");
  } catch (error) {
    if (error?.message !== "Invalid equipment") throw error;

    const redirectPath = exerciseId
      ? `/admin/exercises/${exerciseId}?error=equipment`
      : "/admin/exercises/new?error=equipment";
    redirect(redirectPath);
  }
}

export async function deleteExerciseAction(exerciseId) {
  await requireOwner();
  deleteExercise(exerciseId);
  revalidatePath("/admin/exercises");
  revalidatePath("/defaults202603.json");
  adminRedirect("/admin/exercises", "exercise_deleted");
}

export async function createUserAction(formData) {
  const actor = await requireOwner();
  const input = userInputFromForm(formData, { requirePassword: true });
  if (!input) redirect("/admin/users/new?error=invalid");
  if (input.role === "owner" && !canManageOwnerRole(actor)) {
    redirect("/admin/users/new?error=role");
  }

  let id;
  try {
    id = createUser(input);
  } catch {
    redirect("/admin/users/new?error=duplicate");
  }

  revalidatePath("/admin/users");
  adminRedirect(`/admin/users/${id}`, "user_created");
}

export async function updateUserAction(userId, formData) {
  const actor = await requireOwner();
  const user = getUser(userId);
  if (!user) redirect("/admin/users");

  const input = userInputFromForm(formData, { requirePassword: false });
  if (!input) redirect(`/admin/users/${userId}?error=invalid`);
  if ((user.role === "owner" || input.role === "owner") && !canManageOwnerRole(actor)) {
    redirect(`/admin/users/${userId}?error=role`);
  }

  try {
    updateUser({ id: userId, ...input });
  } catch (error) {
    const reason = error.message?.includes("owner") ? "owner" : "duplicate";
    redirect(`/admin/users/${userId}?error=${reason}`);
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  adminRedirect(`/admin/users/${userId}`, "user_saved");
}

export async function assertOwnsPlan(planId) {
  const user = await requireUser();
  const plan = getPlan(planId, user.id);
  if (!plan) redirect("/admin");
  return { user, plan };
}

function userInputFromForm(formData, { requirePassword }) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "user");

  if (!username || !isValidUserRole(role)) return null;
  if (requirePassword && password.length < 8) return null;
  if (!requirePassword && password && password.length < 8) return null;

  return { username, password, role };
}
