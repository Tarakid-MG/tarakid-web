export interface Session {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
  kid: { id: string; name: string; age: number; level: string };
  type?: "REGULAR" | "FREE_TRIAL";
}

export type SlotKey = string; // "YYYY-MM-DD|HH:MM"
export type ScopeType = "permanent" | "range";

export interface Scope {
  type: ScopeType;
  startDate?: string;
  endDate?: string;
}
