import * as Sentry from '@sentry/react-native';
import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

type SentryMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  storeName: string,
  safePicker: (state: T) => Record<string, unknown>,
) => (
  initializer: StateCreator<T, Mps, Mcs>,
) => StateCreator<T, Mps, Mcs>;

const sentryMiddlewareImpl: SentryMiddleware =
  (storeName, safePicker) => (initializer) => (set, get, store) => {
    const patchedSet = ((partial: unknown, replace?: unknown) => {
      (set as (partial: unknown, replace?: unknown) => void)(partial, replace);
      const safe = safePicker(get());
      Sentry.addBreadcrumb({
        category: `store.${storeName}`,
        message: `${storeName} updated`,
        level: 'debug',
        data: safe,
      });
      Sentry.setContext(`store:${storeName}`, safe);
    }) as unknown as typeof set;

    const state = initializer(patchedSet, get, store);
    Sentry.setContext(`store:${storeName}`, safePicker(state));
    return state;
  };

export const sentryMiddleware = sentryMiddlewareImpl as SentryMiddleware;
