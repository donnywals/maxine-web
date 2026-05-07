import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getUserById, getUserByUsername } from "./db";

const COOKIE_NAME = "maxine_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function secret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set in production");
  }
  return "change-me-for-production-maxine-web";
}

function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encodeSession(userId) {
  const payload = JSON.stringify({
    userId,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function decodeSession(value) {
  if (!value || !value.includes(".")) return null;
  const [encoded, signature] = value.split(".");
  const expected = sign(encoded);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!session.expiresAt || session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function login(username, password) {
  const user = getUserByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return null;
  }

  const jar = await cookies();
  jar.set(COOKIE_NAME, encodeSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });

  return user;
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function currentUser() {
  const jar = await cookies();
  const session = decodeSession(jar.get(COOKIE_NAME)?.value);
  if (!session) return null;
  return getUserById(session.userId) || null;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

export async function requireOwner() {
  const user = await requireUser();
  if (user.role !== "owner") {
    redirect("/admin");
  }
  return user;
}

export function canManageOwnerRole(user) {
  return user?.role === "owner";
}
