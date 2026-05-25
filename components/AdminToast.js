"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_TOAST_MESSAGES, TOAST_QUERY_PARAM } from "../lib/admin-strings";

const TOAST_DURATION_MS = 4000;

export function AdminToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toastKey = searchParams.get(TOAST_QUERY_PARAM);
  const [activeMessage, setActiveMessage] = useState(null);

  useEffect(() => {
    if (!toastKey) return undefined;

    const params = new URLSearchParams(searchParams.toString());
    params.delete(TOAST_QUERY_PARAM);
    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl);

    const message = ADMIN_TOAST_MESSAGES[toastKey];
    if (!message) return undefined;

    setActiveMessage(message);
    const hideTimer = window.setTimeout(() => setActiveMessage(null), TOAST_DURATION_MS);

    return () => window.clearTimeout(hideTimer);
  }, [pathname, router, searchParams, toastKey]);

  if (!activeMessage) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
      role="status"
      aria-live="polite"
    >
      <p className="rounded-2xl bg-[#37124F] px-5 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-white/10">
        {activeMessage}
      </p>
    </div>
  );
}
