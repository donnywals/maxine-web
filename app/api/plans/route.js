import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createSharedPlan } from "../../../lib/db";
import { planShareUrls } from "../../../lib/plan-json";
import { formatPlanValidationError, parseSharePlanBody } from "../../../lib/plan-schema";
import { consumeRateLimit } from "../../../lib/rate-limit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 100_000;
const SHARE_RATE_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 };

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "authorization, content-type, x-api-key",
  };
}

function json(body, init = {}) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      "cache-control": "no-store",
      ...corsHeaders(),
      ...(init.headers || {}),
    },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request) {
  if (!authorizeShareRequest(request)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rate = consumeRateLimit(`share-plan:${ip}`, SHARE_RATE_LIMIT);
  if (!rate.ok) {
    return json(
      { error: "Too many share requests. Try again later." },
      {
        status: 429,
        headers: { "retry-after": String(rate.retryAfterSeconds) },
      },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ error: "Plan is too large" }, { status: 413 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be JSON" }, { status: 400 });
  }

  const serializedSize = Buffer.byteLength(JSON.stringify(body));
  if (serializedSize > MAX_BODY_BYTES) {
    return json({ error: "Plan is too large" }, { status: 413 });
  }

  let input;
  try {
    input = parseSharePlanBody(body);
  } catch (error) {
    if (error?.name === "ZodError" || Array.isArray(error?.issues)) {
      return json(formatPlanValidationError(error), { status: 400 });
    }
    throw error;
  }

  const plan = createSharedPlan(input);
  const urls = planShareUrls(plan.slug, requestOrigin(request));

  revalidatePath(`/plans/${plan.slug}`);
  revalidatePath(`/plans/${plan.slug}/json`);
  revalidatePath("/admin");

  return json(
    {
      id: plan.id,
      slug: plan.slug,
      shareUrl: urls.shareUrl,
      jsonUrl: urls.jsonUrl,
    },
    { status: 201 },
  );
}

function authorizeShareRequest(request) {
  const required = String(process.env.PLAN_SHARE_API_KEY || "").trim();
  if (!required) return true;

  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const providedKey = (request.headers.get("x-api-key") || bearer).trim();
  if (!providedKey) return false;

  const provided = Buffer.from(providedKey);
  const expected = Buffer.from(required);
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

function requestOrigin(request) {
  const configured = String(process.env.PUBLIC_BASE_URL || "").trim();
  if (configured) return configured.replace(/\/$/, "");

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;
  return "https://maxine-app.com";
}
