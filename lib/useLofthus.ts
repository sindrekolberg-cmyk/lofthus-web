"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { ApiError } from "./api";
import type { Status } from "./types";

const LIVE_MS = 20_000;
const IDLE_MS = 180_000;

export function pollInterval(status?: Pick<Status, "is_live"> | null) {
  return status?.is_live ? LIVE_MS : IDLE_MS;
}

export function useLofthus<T>(
  key: string | readonly unknown[] | null,
  loader: () => Promise<T>,
  options?: SWRConfiguration<T, ApiError> & { live?: boolean },
) {
  const { live, ...rest } = options || {};
  const swr = useSWR<T, ApiError>(key, loader, {
    refreshInterval: live === false ? 0 : live ? LIVE_MS : IDLE_MS,
    revalidateOnFocus: true,
    keepPreviousData: true,
    shouldRetryOnError: true,
    errorRetryCount: 4,
    ...rest,
  });

  return {
    data: swr.data ?? null,
    error: swr.error?.message ?? null,
    loading: !swr.data && !swr.error && swr.isLoading,
    stale: Boolean(swr.data && swr.isValidating),
    mutate: swr.mutate,
  };
}
