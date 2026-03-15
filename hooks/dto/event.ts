export interface RejectEventRequest {
  reason: string;
}

export interface PendingEventSummaryResponse {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

export interface PendingEventsResponse {
  content: PendingEventSummaryResponse[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface EventDetailsResponseForManager {
  id: string;
  name: string;
  description: string;
  status: string;
  startedAt: string;
  endedAt: string;
  location: string;
  maxVolunteers: number;
  currentVolunteers: number;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  organizationName: string;
  [key: string]: unknown;
}
