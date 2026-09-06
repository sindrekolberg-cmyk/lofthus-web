"use client";

import { SWRConfig } from "swr";
import { SelectedManagerProvider } from "@/lib/selected-manager";
import { LiveSessionProvider } from "@/lib/live-session";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        shouldRetryOnError: true,
        dedupingInterval: 8000,
      }}
    >
      <SelectedManagerProvider>
        <LiveSessionProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </LiveSessionProvider>
      </SelectedManagerProvider>
    </SWRConfig>
  );
}
