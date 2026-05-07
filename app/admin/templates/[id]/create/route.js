import { NextResponse } from "next/server";
import { currentUser } from "../../../../../lib/auth";
import { createPlanForUser } from "../../../../../lib/db";
import { getTemplatePlanInput } from "../../../../../lib/templates";

export async function POST(_request, { params }) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", _request.url), 303);
  }

  const { id } = await params;
  const template = getTemplatePlanInput(id);
  if (!template) {
    return NextResponse.redirect(new URL("/admin/plans/new", _request.url), 303);
  }

  const planId = createPlanForUser(user.id, template);
  return NextResponse.redirect(new URL(`/admin/plans/${planId}`, _request.url), 303);
}
