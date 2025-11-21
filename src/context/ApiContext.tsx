import React from 'react';
import type { EventApi } from '../api/dashboardEventApi';

interface ApiContextValue {
  eventApi: EventApi;
}

export const ApiContext = React.createContext<ApiContextValue | undefined>(
  undefined,
);

export const ApiProvider: React.FC<{ eventApi: EventApi; children: React.ReactNode }>
  = ({ eventApi, children }) => {
    return (
      <ApiContext.Provider value={{ eventApi }}>{children}</ApiContext.Provider>
    );
  };

export function useEventApi(): EventApi {
  const ctx = React.useContext(ApiContext);
  if (!ctx) {
    throw new Error('ApiContext missing');
  }
  return ctx.eventApi;
}
