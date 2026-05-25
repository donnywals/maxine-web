"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ADMIN_TOAST_MESSAGES, TOAST_QUERY_PARAM } from "../lib/admin-strings";

const TOAST_DURATION_MS = 4000;

export function AdminToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toastKey = searchParams.get(TOAST_QUERY_PARAM);
  const [activeMessage, setActiveMessage] = useState(null);
  const consumedToastKeyRef = useRef(null);

  useEffect(() => {
    if (!toastKey || consumedToastKeyRef.current === toastKey) return undefined;

    consumedToastKeyRef.current = toastKey;
    const message = ADMIN_TOAST_MESSAGES[toastKey];
    if (message) setActiveMessage(message);

    const params = new URLSearchParams(searchParams.toString());
    params.delete(TOAST_QUERY_PARAM);
    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl);

    return undefined;
  }, [pathname, router, searchParams, toastKey]);

  useEffect(() => {
    if (!activeMessage) return undefined;

    const hideTimer = window.setTimeout(() => setActiveMessage(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(hideTimer);
  }, [activeMessage]);

  if (!activeMessage) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="rounded-2xl bg-[#37124F] px-5 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-white/10">
        {activeMessage}
      </p>
    </div>
  );
}
