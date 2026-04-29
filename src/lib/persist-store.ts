import type { StateCreator } from 'zustand';

type PersistSetState<S> = (
  partial: S | Partial<S> | ((state: S) => S | Partial<S>),
  replace?: boolean,
) => void;

export interface StateStorage {
  getItem: (name: string) => string | null | Promise<string | null>;
  setItem: (name: string, value: string) => unknown | Promise<unknown>;
  removeItem: (name: string) => unknown | Promise<unknown>;
}

interface JsonStorage<S> {
  getItem: (name: string) => S | null | Promise<S | null>;
  setItem: (name: string, value: S) => unknown | Promise<unknown>;
  removeItem: (name: string) => unknown | Promise<unknown>;
}

interface PersistOptions<S, P = Partial<S>> {
  name: string;
  storage?: JsonStorage<{ state: P }>;
  partialize?: (state: S) => P;
}

export function createJSONStorage<S>(getStorage: () => StateStorage): JsonStorage<S> {
  const storage = getStorage();
  return {
    async getItem(name) {
      const value = await storage.getItem(name);
      return value ? JSON.parse(value) as S : null;
    },
    setItem(name, value) {
      return storage.setItem(name, JSON.stringify(value));
    },
    removeItem(name) {
      return storage.removeItem(name);
    },
  };
}

export function persist<S extends object>(
  initializer: StateCreator<S, [], []>,
  options: PersistOptions<S>,
): StateCreator<S, [], []> {
  return (set, get, api) => {
    const storage = options.storage;
    const partialize = options.partialize ?? ((state: S) => state as unknown as Partial<S>);

    (api as unknown as { persist: { getOptions: () => PersistOptions<S> } }).persist = {
      getOptions: () => options,
    };

    const persistState = (state: S) => {
      Promise.resolve(storage?.setItem(options.name, { state: partialize(state) }))
        .catch(() => {});
    };

    const setAndPersist: PersistSetState<S> = (partial, replace) => {
      (set as unknown as PersistSetState<S>)(partial, replace);
      persistState(get());
    };

    const initialState = initializer(setAndPersist as Parameters<StateCreator<S, [], []>>[0], get, api);

    Promise.resolve(storage?.getItem(options.name))
      .then((stored) => {
        if (stored?.state) {
          set({ ...get(), ...stored.state });
        }
      })
      .catch(() => {});

    return initialState;
  };
}
