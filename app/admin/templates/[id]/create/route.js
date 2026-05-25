import { NextResponse } from "next/server";
import { appendToastQuery } from "../../../../../lib/admin-toast";
import { currentUser } from "../../../../../lib/auth";
import { createPlanForUser } from "../../../../../lib/db";
import { getTemplatePlanInput } from "../../../../../lib/templates";

export async function POST(_request, { params }) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", _request.url));
  }

  const { id } = await params;
  const template = getTemplatePlanInput(id);
  if (!template) {
    return NextResponse.redirect(new URL("/admin/plans/new", _request.url));
  }

  const planId = createPlanForUser(user.id, template);
  const redirectPath = appendToastQuery(`/admin/plans/${planId}`, "plan_created");
  return NextResponse.redirect(new URL(redirectPath, _request.url));
}
