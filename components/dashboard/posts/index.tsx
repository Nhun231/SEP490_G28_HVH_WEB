'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Trash2,
  Search,
  ListFilter,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetEventMomentsFeed } from '@/hooks/features/sys-admin/uc086-view-moments-feed/useGetEventMomentsFeed';
import { useDeleteEventMoment } from '@/hooks/features/sys-admin/uc059-censor-volunteer-moments/useDeleteEventMoment';
import { getFullSupabaseImageUrl } from '@/utils/helpers';

interface Post {
  id: string;
  volunteerName: string;
  volunteerAvatar?: string;
  createdAt: string;
  createdAtLabel: string;
  content: string;
  imageUrls: string[];
  eventName: string;
  eventAddress: string;
  eventDetailAddress: string;
}

interface PostsManagementProps {
  eventId?: string;
}

const CLIENT_PAGE_SIZE = 6;
const REQUEST_PAGE_SIZE = 100;

const formatRelativeTime = (isoString: string) => {
  const createdAt = new Date(isoString).getTime();
  if (Number.isNaN(createdAt)) return 'Vừa xong';

  const diffMs = Date.now() - createdAt;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(isoString));
};

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

const formatEventAddress = (address?: string, detailAddress?: string) =>
  [address, detailAddress].filter((value) => value?.trim()).join(', ');

// Blur placeholder - generate a simple solid blur background
const createBlurPlaceholder = (): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 4;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#e4e4e7';
    ctx.fillRect(0, 0, 4, 4);
  }
  return canvas.toDataURL();
};

function PostMediaGrid({
  images,
  onSelectImage
}: {
  images: string[];
  onSelectImage?: (imageUrl: string, imageAlt: string) => void;
}) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(
    () => new Set()
  );
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(
    () => new Set()
  );

  if (!images.length) return null;

  const remainingCount = Math.max(0, images.length - 5);

  const renderFramedImage = (params: {
    src: string;
    alt: string;
    className: string;
    width?: number;
    height?: number;
    overlay?: React.ReactNode;
  }) => {
    const { src, alt, className, width, height, overlay } = params;
    const isBroken = failedImageUrls.has(src);
    const isLoaded = loadedImages.has(src);
    const blurPlaceholder = createBlurPlaceholder();

    const imageNode = (
      <button
        type="button"
        className="relative block w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 text-left transition-transform duration-200 hover:scale-[1.01]"
        onClick={() => onSelectImage?.(src, alt)}
      >
        {isBroken ? (
          <div className="flex h-full min-h-[160px] w-full items-center justify-center bg-zinc-100 text-sm text-zinc-400">
            Không tải được ảnh
          </div>
        ) : (
          <>
            {!isLoaded && (
              <div
                className="absolute inset-0 animate-pulse bg-zinc-200"
                style={{
                  backgroundImage: `url('${blurPlaceholder}')`,
                  backgroundSize: 'cover',
                  filter: 'blur(10px)'
                }}
              />
            )}
            <img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              className={`${className} cursor-zoom-in transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() =>
                setLoadedImages((prev) => {
                  const next = new Set(prev);
                  next.add(src);
                  return next;
                })
              }
              onError={() =>
                setFailedImageUrls((prev) => {
                  if (prev.has(src)) return prev;
                  const next = new Set(prev);
                  next.add(src);
                  return next;
                })
              }
            />
          </>
        )}
        {overlay}
      </button>
    );

    return imageNode;
  };

  if (images.length === 1) {
    return (
      <div>
        {renderFramedImage({
          src: images[0],
          alt: 'Moment',
          width: 800,
          height: 620,
          className: 'max-h-[620px] w-full object-contain bg-zinc-100'
        })}
      </div>
    );
  }

  const thumbnails = images.slice(0, 5);

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-1 shadow-sm">
        <div className="grid gap-1 md:grid-cols-2">
          {renderFramedImage({
            src: thumbnails[0],
            alt: 'Ảnh 1',
            width: 800,
            height: 360,
            className:
              'h-[300px] w-full object-contain bg-zinc-100 md:h-[360px]'
          })}

          <div className="grid grid-cols-2 gap-1">
            {thumbnails.slice(1, 5).map((image, index) => {
              const realIndex = index + 1;
              const isLastTile = realIndex === 4 && remainingCount > 0;

              return (
                <div key={image + realIndex} className="relative">
                  {renderFramedImage({
                    src: image,
                    alt: `Ảnh ${realIndex + 1}`,
                    width: 400,
                    height: 178,
                    className:
                      'h-[148px] w-full object-contain bg-zinc-100 md:h-[178px]',
                    overlay: isLastTile ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                        <div className="text-center">
                          <p className="text-3xl font-bold">
                            +{remainingCount}
                          </p>
                          <p className="text-xs uppercase tracking-[0.12em]">
                            Xem thêm
                          </p>
                        </div>
                      </div>
                    ) : undefined
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default function PostsManagement({ eventId }: PostsManagementProps) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<
    'all' | 'with-image' | 'text-only'
  >('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'recent' | 'older'>(
    'all'
  );
  const [sortMode, setSortMode] = useState<
    'newest' | 'oldest' | 'media-priority'
  >('newest');
  const [visibleCount, setVisibleCount] = useState(CLIENT_PAGE_SIZE);
  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);
  const [postList, setPostList] = useState<Post[]>([]);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const { trigger: deleteEventMoment, isMutating: isDeletingEventMoment } =
    useDeleteEventMoment({
      id: postIdToDelete || '',
      baseUrl
    });

  const {
    data: feedResponse,
    isLoading,
    error
  } = useGetEventMomentsFeed({
    pageNumber: 0,
    pageSize: REQUEST_PAGE_SIZE,
    eventId: eventId || '',
    baseUrl
  });

  useEffect(() => {
    const eventMoments = feedResponse?.eventMoments ?? [];
    const mappedPosts: Post[] = eventMoments.map((moment) => ({
      id: moment.eventMomentId,
      volunteerName: moment.volNickName?.trim() || moment.volName || 'Ẩn danh',
      volunteerAvatar: moment.avatarUrl
        ? getFullSupabaseImageUrl(moment.avatarUrl)
        : undefined,
      createdAt: moment.createdAt,
      createdAtLabel: formatRelativeTime(moment.createdAt),
      content: moment.momentContent,
      imageUrls: (moment.momentPicturesUrls ?? []).map((imageUrl) =>
        getFullSupabaseImageUrl(imageUrl)
      ),
      eventName: moment.eventName,
      eventAddress: formatEventAddress(
        moment.eventAddress,
        moment.eventDetailAddress
      ),
      eventDetailAddress: moment.eventDetailAddress
    }));

    setPostList(mappedPosts);
  }, [feedResponse]);

  useEffect(() => {
    setVisibleCount(CLIENT_PAGE_SIZE);
  }, [searchQuery, mediaFilter, timeFilter, sortMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }

    return undefined;
  }, [selectedImage]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = postList.filter((post) => {
      const hasImage = post.imageUrls.length > 0;
      const createdAt = new Date(post.createdAt).getTime();
      const ageInDays = Number.isNaN(createdAt)
        ? 9999
        : Math.max(0, (Date.now() - createdAt) / (1000 * 60 * 60 * 24));

      const matchesQuery =
        query.length === 0 ||
        post.volunteerName.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.eventName.toLowerCase().includes(query) ||
        post.eventAddress.toLowerCase().includes(query);

      const matchesMedia =
        mediaFilter === 'all' ||
        (mediaFilter === 'with-image' && hasImage) ||
        (mediaFilter === 'text-only' && !hasImage);

      const matchesTime =
        timeFilter === 'all' ||
        (timeFilter === 'recent' && ageInDays <= 7) ||
        (timeFilter === 'older' && ageInDays > 7);

      return matchesQuery && matchesMedia && matchesTime;
    });

    const getAge = (post: Post) => {
      const createdAt = new Date(post.createdAt).getTime();
      return Number.isNaN(createdAt) ? 999999 : Date.now() - createdAt;
    };

    if (sortMode === 'newest') {
      return [...filtered].sort((a, b) => getAge(a) - getAge(b));
    }

    if (sortMode === 'oldest') {
      return [...filtered].sort((a, b) => getAge(b) - getAge(a));
    }

    return [...filtered].sort((a, b) => {
      const aHasImage = a.imageUrls.length > 0 ? 1 : 0;
      const bHasImage = b.imageUrls.length > 0 ? 1 : 0;
      if (aHasImage !== bHasImage) return bHasImage - aHasImage;
      return getAge(a) - getAge(b);
    });
  }, [mediaFilter, postList, searchQuery, sortMode, timeFilter]);

  const displayedPosts = useMemo(
    () => filteredPosts.slice(0, visibleCount),
    [filteredPosts, visibleCount]
  );

  const filteredPostsWithImageCount = useMemo(
    () => filteredPosts.filter((post) => post.imageUrls.length > 0).length,
    [filteredPosts]
  );

  const hasMorePosts = visibleCount < filteredPosts.length;

  const handleRemovePost = async (postId: string) => {
    const postToRemove = postList.find((post) => post.id === postId);
    if (!postToRemove) return;

    try {
      await deleteEventMoment();
      setPostList((prev) => prev.filter((post) => post.id !== postId));
      toast.success(`Đã gỡ bài viết của ${postToRemove.volunteerName}`);
      setPostIdToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể gỡ bài viết';
      toast.error(message);
    }
  };

  return (
    <div className="w-full">
      <Card className="overflow-hidden border border-sky-100 bg-gradient-to-br from-white via-slate-50 to-blue-50/70 p-4 shadow-xl md:p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Quản lý bài viết công cộng
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              Theo dõi nội dung do tình nguyện viên chia sẻ.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Không thể tải bài viết. Vui lòng thử lại sau.
          </div>
        )}

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/80 shadow-sm">
                <p className="text-center text-slate-500">
                  Đang tải bài viết...
                </p>
              </div>
            ) : displayedPosts.length === 0 ? (
              <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/80 shadow-sm">
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    Không tìm thấy bài đăng phù hợp
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Hãy thử đổi bộ lọc hoặc từ khóa tìm kiếm.
                  </p>
                </div>
              </div>
            ) : (
              displayedPosts.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-3">
                        <Avatar className="h-14 w-14 border border-slate-200 shadow-sm">
                          <AvatarImage
                            src={
                              post.volunteerAvatar
                                ? getFullSupabaseImageUrl(post.volunteerAvatar)
                                : undefined
                            }
                            alt={post.volunteerName}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-sky-600 to-indigo-500 text-sm font-bold text-white">
                            {post.volunteerName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-base font-bold text-slate-900 md:text-lg">
                              {post.volunteerName}
                            </h2>
                            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                              {post.createdAtLabel}
                            </span>
                          </div>
                          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                            <Calendar className="h-4 w-4" />
                            {formatDateTime(post.createdAt)}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => setPostIdToDelete(post.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Gỡ bài viết
                      </Button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                        <ListFilter className="h-3.5 w-3.5" />
                        {post.eventName}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                        <MapPin className="h-3.5 w-3.5" />
                        {post.eventAddress}
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                      {post.content}
                    </p>
                  </div>

                  {post.imageUrls.length > 0 && (
                    <PostMediaGrid
                      images={post.imageUrls}
                      onSelectImage={(src, alt) =>
                        setSelectedImage({ src, alt })
                      }
                    />
                  )}
                </article>
              ))
            )}

            {!isLoading && hasMorePosts && (
              <div className="flex justify-center py-4">
                <Button
                  variant="outline"
                  className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                  onClick={() =>
                    setVisibleCount((prev) =>
                      Math.min(prev + CLIENT_PAGE_SIZE, filteredPosts.length)
                    )
                  }
                >
                  Tải thêm bài viết
                </Button>
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900">
                <ListFilter className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Bộ lọc bài đăng</h3>
              </div>

              <div className="mt-4 space-y-3">
                <label className="text-xs font-medium text-slate-600">
                  Tìm theo tác giả, nội dung hoặc sự kiện
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Ví dụ: Bùi Hoàng, Vẽ tiếp ước mơ..."
                    className="border-slate-300 bg-white pl-9 text-slate-900 placeholder:text-slate-400 focus-visible:ring-sky-400"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <label className="text-xs font-medium text-slate-600">
                  Sắp xếp feed
                </label>
                <Select
                  value={sortMode}
                  onValueChange={(value) =>
                    setSortMode(value as 'newest' | 'oldest' | 'media-priority')
                  }
                >
                  <SelectTrigger className="border-slate-300 bg-white text-slate-900 focus:ring-sky-400">
                    <SelectValue placeholder="Chọn kiểu sắp xếp" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white text-slate-900">
                    <SelectItem value="newest">Mới nhất trước</SelectItem>
                    <SelectItem value="oldest">Cũ nhất trước</SelectItem>
                    <SelectItem value="media-priority">
                      Ưu tiên bài có ảnh
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 space-y-3">
                <label className="text-xs font-medium text-slate-600">
                  Loại bài viết
                </label>
                <Select
                  value={mediaFilter}
                  onValueChange={(value) =>
                    setMediaFilter(value as 'all' | 'with-image' | 'text-only')
                  }
                >
                  <SelectTrigger className="border-slate-300 bg-white text-slate-900 focus:ring-sky-400">
                    <SelectValue placeholder="Chọn loại bài viết" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white text-slate-900">
                    <SelectItem value="all">Tất cả bài viết</SelectItem>
                    <SelectItem value="with-image">Có hình ảnh</SelectItem>
                    <SelectItem value="text-only">Chỉ văn bản</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 space-y-3">
                <label className="text-xs font-medium text-slate-600">
                  Thời gian đăng
                </label>
                <Select
                  value={timeFilter}
                  onValueChange={(value) =>
                    setTimeFilter(value as 'all' | 'recent' | 'older')
                  }
                >
                  <SelectTrigger className="border-slate-300 bg-white text-slate-900 focus:ring-sky-400">
                    <SelectValue placeholder="Chọn mốc thời gian" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white text-slate-900">
                    <SelectItem value="all">Tất cả thời gian</SelectItem>
                    <SelectItem value="recent">Trong 7 ngày gần đây</SelectItem>
                    <SelectItem value="older">Cũ hơn 7 ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="mt-4 w-full bg-slate-900 text-white hover:bg-slate-800"
                onClick={() => {
                  setSearchQuery('');
                  setMediaFilter('all');
                  setTimeFilter('all');
                  setSortMode('newest');
                }}
              >
                Đặt lại bộ lọc
              </Button>
            </div>
          </aside>
        </div>
      </Card>

      {postIdToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
              <Trash2 className="h-6 w-6 text-rose-600" />
            </div>

            <h2 className="text-center text-lg font-bold text-slate-900">
              Gỡ bỏ bài viết
            </h2>
            <p className="mt-2 text-center text-sm leading-6 text-slate-600">
              Bạn có chắc chắn muốn gỡ bỏ bài viết này? Hành động này không thể
              hoàn tác.
            </p>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                onClick={() => setPostIdToDelete(null)}
              >
                Hủy
              </Button>
              <Button
                className="flex-1 bg-rose-600 text-white hover:bg-rose-700"
                disabled={isDeletingEventMoment}
                onClick={() =>
                  postIdToDelete && handleRemovePost(postIdToDelete)
                }
              >
                {isDeletingEventMoment ? 'Đang gỡ...' : 'Gỡ bỏ'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              className="absolute right-3 top-3 z-10 h-10 rounded-full bg-black/50 px-4 text-white hover:bg-black/70 hover:text-white"
              onClick={() => setSelectedImage(null)}
            >
              Đóng
            </Button>
            <div className="flex max-h-[92vh] items-center justify-center bg-black">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-h-[92vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
