"use client";

import { useState } from "react";

export function CopyPlanLinkButton({ planSlug }) {
  const [status, setStatus] = useState("idle");

  async function copyLink() {
    const url = `${window.location.origin}/plans/${planSlug}`;

    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("failed");
      window.setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <button
      className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
      onClick={copyLink}
      type="button"
    >
      {status === "copied"
        ? "Copied link"
        : status === "failed"
          ? "Copy failed"
          : "Copy plan link"}
    </button>
  );
}
