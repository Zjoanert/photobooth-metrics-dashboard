import type {
  Event,
  EventInput,
  EventStats,
  EventStatsParams,
  EventsApi,
  ListEventsParams,
} from './eventsApi.types';

export const BASE_URL = process.env.REACT_APP_METRICS_BASE_URL ?? 'http://localhost:8092';

const buildQueryString = (
  params: Record<string, string | number | undefined | null>,
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    searchParams.append(key, String(value));
  });

  const normalized = searchParams.toString();
  return normalized ? `?${normalized}` : '';
};

const createEvent = async (eventInput: EventInput): Promise<Event> => {
  const response = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventInput),
  });

  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.statusText}`);
  }

  return response.json();
};

const listEvents = async (params: ListEventsParams = {}): Promise<Event[]> => {
  const query = buildQueryString({
    applicationName: params.applicationName,
    eventName: params.eventName,
    start: params.start,
    end: params.end,
    limit: params.limit,
    offset: params.offset,
  });

  const response = await fetch(`${BASE_URL}/events${query}`);

  if (!response.ok) {
    throw new Error(`Failed to list events: ${response.statusText}`);
  }

  return response.json();
};

const getEventStats = async (params: EventStatsParams = {}): Promise<EventStats> => {
  const query = buildQueryString({
    applicationName: params.applicationName,
    eventName: params.eventName,
    start: params.start,
    end: params.end,
  });

  const response = await fetch(`${BASE_URL}/events/stats${query}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch event stats: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};

export const eventsApi = {
  createEvent,
  listEvents,
  getEventStats,
} satisfies EventsApi;

export { createEvent, listEvents, getEventStats };
export type {
  Event,
  EventInput,
  EventStats,
  EventStatsParams,
  EventsApi,
  ListEventsParams,
} from './eventsApi.types';
