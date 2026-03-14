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
