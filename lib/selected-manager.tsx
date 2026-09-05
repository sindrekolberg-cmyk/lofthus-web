"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "lro-selected-manager";

let memory = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function readStorage() {
  if (typeof window === "undefined") return memory;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    memory = parsed || 0;
  } catch {
    /* ignore */
  }
  return memory;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function write(id: number) {
  memory = id;
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, String(id));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

type Ctx = {
  entryId: number;
  setEntryId: (id: number) => void;
};

const SelectedManagerContext = createContext<Ctx>({
  entryId: 0,
  setEntryId: () => {},
});

export function SelectedManagerProvider({ children }: { children: ReactNode }) {
  const entryId = useSyncExternalStore(subscribe, readStorage, () => 0);
  const setEntryId = useCallback((id: number) => write(id), []);
  const value = useMemo(() => ({ entryId, setEntryId }), [entryId, setEntryId]);
  return (
    <SelectedManagerContext.Provider value={value}>
      {children}
    </SelectedManagerContext.Provider>
  );
}

export function useSelectedManager() {
  return useContext(SelectedManagerContext);
}
