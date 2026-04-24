export interface ShareMomentRequest {
  eventSessionId: string; // UUID
  momentContent: string; // max 500 chars
  momentPictures: string; // file path or base64
}

export interface EventMomentFeedItem {
  volunteerId: string;
  volNickName: string | null;
  volName: string;
  avatarUrl: string | null;
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
  eventMoments: EventMomentFeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ShareMomentResponse {
  momentPicturesUploadUrls: string[];
}
