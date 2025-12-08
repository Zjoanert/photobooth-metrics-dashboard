export interface Event {
  id: string;
  timestamp: string;
  applicationName: string;
  eventName: string;
  value: number;
}

export interface EventInput {
  timestamp: string;
  applicationName: string;
  eventName: string;
  value: number;
}

export interface ListEventsParams {
  applicationName?: string;
  eventName?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface EventStatsParams {
  applicationName?: string;
  eventName?: string;
  from?: string;
  to?: string;
}

export interface EventStats {
  count: number;
  min: number | null;
  max: number | null;
  average: number | null;
  sum: number | null;
}

export interface EventsApi {
  createEvent(eventInput: EventInput): Promise<Event>;
  listEvents(params?: ListEventsParams): Promise<Event[]>;
  getEventStats(params?: EventStatsParams): Promise<EventStats>;
}
