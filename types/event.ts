export type EventImportance = 1 | 2 | 3;

export interface EconomicEvent {
  id: string;
  /** ISO 8601 datetime of the event. */
  time: string;
  country: string;
  title: string;
  importance: EventImportance;
}
