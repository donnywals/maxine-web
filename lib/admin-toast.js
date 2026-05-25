import "server-only";

import { redirect } from "next/navigation";
import { ADMIN_TOAST_MESSAGES, TOAST_QUERY_PARAM } from "./admin-strings.js";

export const ADMIN_TOAST_KEYS = Object.keys(ADMIN_TOAST_MESSAGES);

export function appendToastQuery(path, toastKey) {
  if (!ADMIN_TOAST_KEYS.includes(toastKey)) {
    throw new Error(`Unknown admin toast key: ${toastKey}`);
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${TOAST_QUERY_PARAM}=${toastKey}`;
}

export function adminRedirect(path, toastKey) {
  redirect(appendToastQuery(path, toastKey));
}
