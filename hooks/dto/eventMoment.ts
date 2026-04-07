export interface ShareMomentRequest {
  eventSessionId: string; // UUID
  momentContent: string; // max 500 chars
  momentPictures: string; // file path or base64
}

export interface EventMomentFeedDetailsResponse {
  volunteerId: string;
  volNickName: string;
  volName: string;
  avatarUrl: string;
  eventId: string;
  eventName: string;
  eventAddress: string;
  eventDetailAddress: string;
  eventMomentId: string;
  momentContent: string;
  momentPicturesUrls: string[];
  createdAt: string; // ISO datetime format
}

export interface EventMomentFeedResponse {
  content: EventMomentFeedDetailsResponse[];
  nextCursor: string;
  hasMore: boolean;
}

export interface ShareMomentResponse {
  momentPicturesUploadUrls: string[];
}
