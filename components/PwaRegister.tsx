"use client";

import { useEffect } from "react";
import { pwaBuildId } from "@/lib/pwa";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const version = pwaBuildId();
    navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(version)}`, { scope: "/" }).catch(() => {});
  }, []);
  return null;
}
