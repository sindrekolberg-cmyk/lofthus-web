"use client";

import { SWRConfig } from "swr";
import { SelectedManagerProvider } from "@/lib/selected-manager";
import { LiveSessionProvider } from "@/lib/live-session";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BottomNav } from "@/components/BottomNav";
import { OfflineBanner } from "@/components/OfflineBanner";
import { PwaRegister } from "@/components/PwaRegister";
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
          <PwaRegister />
          <OfflineBanner />
          <SiteHeader />
          <div className="flex min-h-0 flex-1 flex-col pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0">
            {children}
          </div>
          <SiteFooter />
          <BottomNav />
        </LiveSessionProvider>
      </SelectedManagerProvider>
    </SWRConfig>
  );
}
