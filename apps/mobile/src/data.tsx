import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { HomeBundle, Item } from '@kakehashi/shared';
import { api } from './api';

export const HOME_ID = 'tanaka';

type Ctx = {
  data: HomeBundle | null;
  error: string | null;
  refresh: () => Promise<void>;
  replaceItem: (item: Item) => void;
  toast: string | null;
  showToast: (msg: string) => void;
};

const DataCtx = createContext<Ctx>(null as unknown as Ctx);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<HomeBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setData(await api.home(HOME_ID));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const replaceItem = (item: Item) =>
    setData((d) => (d ? { ...d, items: d.items.some((i) => i.id === item.id) ? d.items.map((i) => (i.id === item.id ? item : i)) : [...d.items, item] } : d));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2400);
  };

  return <DataCtx.Provider value={{ data, error, refresh, replaceItem, toast, showToast }}>{children}</DataCtx.Provider>;
}

export const useData = () => useContext(DataCtx);
