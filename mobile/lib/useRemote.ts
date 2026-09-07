import { useCallback, useEffect, useState } from "react";

export function useRemote<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const result = await loader();
      setData(result);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke hente data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loader]);

  useEffect(() => {
    load(false);
  }, [load]);

  return { data, error, loading, refreshing, refresh: () => load(true) };
}
