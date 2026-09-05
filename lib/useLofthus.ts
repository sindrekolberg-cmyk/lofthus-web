"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { ApiError } from "./api";
import type { Status } from "./types";

const LIVE_MS = 20_000;
const IDLE_MS = 180_000;

export function pollInterval(status?: Pick<Status, "is_live"> | null) {
  return status?.is_live ? LIVE_MS : IDLE_MS;
}

function intervalFromPayload(data: unknown, live?: boolean) {
  if (live === false) return 0;
  const status =
    data && typeof data === "object" && "status" in data
      ? (data as { status?: { is_live?: boolean } }).status
      : undefined;
  const topLevel =
    data && typeof data === "object" && "is_live" in data
      ? (data as { is_live?: boolean }).is_live
      : undefined;
  const isLive = status?.is_live ?? topLevel;
  if (typeof isLive === "boolean") return isLive ? LIVE_MS : IDLE_MS;
  return live ? LIVE_MS : IDLE_MS;
}

export function useLofthus<T>(
  key: string | readonly unknown[] | null,
  loader: () => Promise<T>,
  options?: SWRConfiguration<T, ApiError> & { live?: boolean },
) {
  const { live, refreshInterval, ...rest } = options || {};
  const swr = useSWR<T, ApiError>(key, loader, {
    refreshInterval: refreshInterval ?? ((data) => intervalFromPayload(data, live)),
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
