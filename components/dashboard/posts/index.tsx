'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Search,
  ListFilter,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetEventMomentsFeed } from '@/hooks/features/uc086-view-moments-feed/useGetEventMomentsFeed';

interface Post {
  id: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  content: string;
  imageUrls?: string[];
}

interface PostsManagementProps {
  eventId?: string;
}

const CLIENT_PAGE_SIZE = 8;

// Component hiển thị gallery ảnh (Facebook style)
function ImageGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  if (!images || images.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setShowPreview(true);
  };

  const galleryBaseClass =
    'mt-3 -mx-4 -mb-4 overflow-hidden rounded-b-lg bg-zinc-100';

  if (images.length === 1) {
    return (
      <>
        <div
          className={`${galleryBaseClass} group relative cursor-pointer`}
          onClick={() => openModal(0)}
        >
          <img
            src={images[0]}
            alt="Post"
            className="max-h-[620px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Modal Lightbox */}
        {showPreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowPreview(false)}
          >
            <div
              className="relative w-full max-w-4xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowPreview(false)}
                className="absolute -top-10 -right-2 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Main image */}
              <div className="flex-1 overflow-auto flex items-center justify-center">
                <img
                  src={images[currentIndex]}
                  alt={`Post ${currentIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (images.length === 2) {
    return (
      <>
        <div className={galleryBaseClass}>
          <div className="grid grid-cols-2 gap-1">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer"
                onClick={() => openModal(idx)}
              >
                <img
                  src={img}
                  alt={`Post ${idx + 1}`}
                  className="h-[360px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Lightbox */}
        {showPreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowPreview(false)}
          >
            <div
              className="relative w-full max-w-4xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowPreview(false)}
                className="absolute -top-10 -right-2 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Main image */}
              <div className="flex-1 overflow-auto flex items-center justify-center">
                <img
                  src={images[currentIndex]}
                  alt={`Post ${currentIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-4 text-white">
                <button
                  onClick={handlePrev}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <span className="text-sm font-medium">
                  {currentIndex + 1} / {images.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (images.length === 3) {
    return (
      <>
        <div className={galleryBaseClass}>
          <div className="grid h-[420px] grid-cols-2 gap-1">
            <div
              className="relative row-span-2 cursor-pointer overflow-hidden"
              onClick={() => openModal(0)}
            >
              <img
                src={images[0]}
                alt="Post 1"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20">
                <div className="opacity-0 transition-opacity hover:opacity-100">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {[1, 2].map((idx) => (
              <div
                key={idx}
                className="relative cursor-pointer overflow-hidden"
                onClick={() => openModal(idx)}
              >
                <img
                  src={images[idx]}
                  alt={`Post ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20">
                  <div className="opacity-0 transition-opacity hover:opacity-100">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Lightbox */}
        {showPreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowPreview(false)}
          >
            <div
              className="relative w-full max-w-4xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowPreview(false)}
                className="absolute -top-10 -right-2 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Main image */}
              <div className="flex-1 overflow-auto flex items-center justify-center">
                <img
                  src={images[currentIndex]}
                  alt={`Post ${currentIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-4 text-white">
                <button
                  onClick={handlePrev}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <span className="text-sm font-medium">
                  {currentIndex + 1} / {images.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (images.length === 4) {
    return (
      <>
        <div className={galleryBaseClass}>
          <div className="grid h-[420px] grid-cols-2 grid-rows-2 gap-1">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative cursor-pointer"
                onClick={() => openModal(idx)}
              >
                <img
                  src={img}
                  alt={`Post ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Lightbox */}
        {showPreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowPreview(false)}
          >
            <div
              className="relative w-full max-w-4xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowPreview(false)}
                className="absolute -top-10 -right-2 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Main image */}
              <div className="flex-1 overflow-auto flex items-center justify-center">
                <img
                  src={images[currentIndex]}
                  alt={`Post ${currentIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-4 text-white">
                <button
                  onClick={handlePrev}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <span className="text-sm font-medium">
                  {currentIndex + 1} / {images.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 5+ ảnh: 2 ảnh hàng trên + 3 ảnh hàng dưới, ảnh cuối hiển thị overlay số lượng còn lại
  return (
    <>
      <div className={galleryBaseClass}>
        <div className="grid gap-1">
          <div className="grid h-[240px] grid-cols-2 gap-1">
            {[0, 1].map((idx) => (
              <div
                key={idx}
                className="group relative cursor-pointer"
                onClick={() => openModal(idx)}
              >
                <img
                  src={images[idx]}
                  alt={`Post ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid h-[180px] grid-cols-3 gap-1">
            {[2, 3, 4].map((idx) => {
              const isOverflowTile = idx === 4 && images.length > 5;
              return (
                <div
                  key={idx}
                  className="group relative cursor-pointer"
                  onClick={() => openModal(idx)}
                >
                  <img
                    src={images[idx]}
                    alt={`Post ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {isOverflowTile ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55 transition-colors hover:bg-black/65">
                      <div className="text-center text-white">
                        <p className="text-3xl font-bold">
                          +{images.length - 5}
                        </p>
                        <p className="text-xs">Xem thêm</p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                      <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Lightbox */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-10 -right-2 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Main image */}
            <div className="flex-1 overflow-auto flex items-center justify-center">
              <img
                src={images[currentIndex]}
                alt={`Post ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4 text-white">
              <button
                onClick={handlePrev}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <span className="text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </span>
              <button
                onClick={handleNext}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PostsManagement({ eventId }: PostsManagementProps) {
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const {
    data: feedResponse,
    isLoading,
    error
  } = useGetEventMomentsFeed({
    pageNumber,
    pageSize,
    eventId: eventId || '',
    baseUrl
  });

  const [postList, setPostList] = useState<Post[]>([]);

  useEffect(() => {
    if (feedResponse?.content) {
      const mappedPosts: Post[] = feedResponse.content.map((moment) => ({
        id: moment.eventMomentId,
        authorName: moment.volName || moment.volNickName || 'Ẩn danh',
        authorAvatar: moment.avatarUrl,
        createdAt: new Date(moment.createdAt).toLocaleDateString('vi-VN'),
        content: moment.momentContent,
        imageUrls: moment.momentPicturesUrls
      }));

      setPostList(mappedPosts);
    }
  }, [feedResponse]);

  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreTimeoutRef = useRef<number | null>(null);
  const isLoadingMoreRef = useRef(false);
  const hasMorePostsRef = useRef(false);

  const parseRelativeDays = (createdAt: string) => {
    const normalized = createdAt.toLowerCase().trim();
    const dayMatch = normalized.match(/(\d+)\s*ngày/);
    if (dayMatch) {
      return Number(dayMatch[1]);
    }
    if (normalized.includes('hôm nay')) {
      return 0;
    }
    if (normalized.includes('hôm qua')) {
      return 1;
    }
    if (normalized.includes('tuần')) {
      const weekMatch = normalized.match(/(\d+)\s*tuần/);
      return weekMatch ? Number(weekMatch[1]) * 7 : 7;
    }
    return null;
  };

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = postList.filter((post) => {
      const hasImage = Boolean(post.imageUrls && post.imageUrls.length > 0);
      const relativeDays = parseRelativeDays(post.createdAt);
      const matchesQuery =
        query.length === 0 ||
        post.authorName.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query);
      const matchesMedia =
        mediaFilter === 'all' ||
        (mediaFilter === 'with-image' && hasImage) ||
        (mediaFilter === 'text-only' && !hasImage);
      const matchesTime =
        timeFilter === 'all' ||
        (timeFilter === 'recent' &&
          relativeDays !== null &&
          relativeDays <= 7) ||
        (timeFilter === 'older' && relativeDays !== null && relativeDays > 7);

      return matchesQuery && matchesMedia && matchesTime;
    });

    const getAge = (post: Post) => parseRelativeDays(post.createdAt) ?? 9999;

    if (sortMode === 'newest') {
      return [...filtered].sort((a, b) => getAge(a) - getAge(b));
    }

    if (sortMode === 'oldest') {
      return [...filtered].sort((a, b) => getAge(b) - getAge(a));
    }

    return [...filtered].sort((a, b) => {
      const aHasImage = a.imageUrls && a.imageUrls.length > 0 ? 1 : 0;
      const bHasImage = b.imageUrls && b.imageUrls.length > 0 ? 1 : 0;
      if (aHasImage !== bHasImage) {
        return bHasImage - aHasImage;
      }
      return getAge(a) - getAge(b);
    });
  }, [postList, searchQuery, mediaFilter, timeFilter, sortMode]);

  const filteredPostsWithImageCount = useMemo(
    () =>
      filteredPosts.filter(
        (post) => post.imageUrls && post.imageUrls.length > 0
      ).length,
    [filteredPosts]
  );

  const displayedPosts = useMemo(
    () => filteredPosts.slice(0, visibleCount),
    [filteredPosts, visibleCount]
  );

  const hasMorePosts = displayedPosts.length < filteredPosts.length;

  useEffect(() => {
    hasMorePostsRef.current = hasMorePosts;
  }, [hasMorePosts]);

  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);

  useEffect(() => {
    setVisibleCount(CLIENT_PAGE_SIZE);
    setIsLoadingMore(false);
    isLoadingMoreRef.current = false;
  }, [searchQuery, mediaFilter, timeFilter, sortMode]);

  useEffect(() => {
    const target = loadMoreTriggerRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          !entry?.isIntersecting ||
          isLoadingMoreRef.current ||
          !hasMorePostsRef.current
        ) {
          return;
        }

        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);

        if (loadMoreTimeoutRef.current) {
          window.clearTimeout(loadMoreTimeoutRef.current);
        }

        loadMoreTimeoutRef.current = window.setTimeout(() => {
          setVisibleCount((prev) =>
            Math.min(prev + CLIENT_PAGE_SIZE, filteredPosts.length)
          );
          isLoadingMoreRef.current = false;
          setIsLoadingMore(false);
        }, 320);
      },
      { root: null, rootMargin: '0px 0px 320px 0px', threshold: 0 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      if (loadMoreTimeoutRef.current) {
        window.clearTimeout(loadMoreTimeoutRef.current);
        loadMoreTimeoutRef.current = null;
      }
    };
  }, [filteredPosts.length]);

  const handleRemovePost = (postId: string) => {
    const postToRemove = postList.find((p) => p.id === postId);
    if (!postToRemove) return;

    setPostList(postList.filter((p) => p.id !== postId));
    toast.success(`Đã gỡ bài viết của ${postToRemove.authorName}`);
    setPostIdToDelete(null);
  };

  return (
    <div className="w-full">
      <Card className="border-zinc-800 bg-[#0f1b2d] p-4 shadow-sm md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-50">
            Quản lý bài viết công động
          </h1>
          <p className="mt-1 text-sm text-zinc-300">
            Xem và quản lý bài viết
            {isLoading ? (
              <span className="ml-2 inline-block rounded-full bg-zinc-700 px-3 py-1 text-sm font-medium text-zinc-100 animate-pulse">
                Đang tải...
              </span>
            ) : (
              <span className="ml-2 inline-block rounded-full bg-zinc-700 px-3 py-1 text-sm font-medium text-zinc-100">
                {postList.length} bài viết
              </span>
            )}
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-400">
              Không thể tải bài viết. Vui lòng thử lại sau.
            </p>
          )}
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="xl:col-span-1">
            {isLoading ? (
              <div className="flex h-96 items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/40">
                <p className="text-center text-zinc-300">
                  Đang tải bài viết...
                </p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex h-96 items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/40">
                <p className="text-center text-zinc-300">
                  Không tìm thấy bài đăng phù hợp với bộ lọc hiện tại
                </p>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-[860px] space-y-4">
                {displayedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="min-h-fit rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Header: Avatar, Tên, Ngày */}
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-zinc-200">
                          {post.authorAvatar ? (
                            <img
                              src={post.authorAvatar}
                              alt={post.authorName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 font-semibold text-white">
                              {post.authorName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-zinc-900">
                            {post.authorName}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {post.createdAt}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setPostIdToDelete(post.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Gỡ bài viết
                      </Button>
                    </div>

                    {/* Content */}
                    <p className="mt-3 text-sm leading-relaxed text-zinc-700">
                      {post.content}
                    </p>

                    {/* Image Gallery */}
                    {post.imageUrls && post.imageUrls.length > 0 && (
                      <ImageGallery images={post.imageUrls} />
                    )}
                  </div>
                ))}

                {hasMorePosts && (
                  <div className="rounded-lg border border-dashed border-zinc-600 bg-zinc-900/40 px-4 py-3 text-center text-sm text-zinc-300">
                    {isLoadingMore
                      ? 'Đang tải thêm bài đăng...'
                      : 'Cuộn xuống để tải thêm bài đăng'}
                  </div>
                )}

                <div ref={loadMoreTriggerRef} className="h-2 w-full" />
              </div>
            )}
          </div>

          <div className="xl:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-zinc-900">
                  <ListFilter className="h-4 w-4" />
                  <h3 className="text-sm font-semibold">Bộ lọc bài đăng</h3>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-zinc-600">
                    Tìm theo tác giả hoặc nội dung
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Thị Mai"
                      className="border-zinc-300 bg-white pl-9 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-zinc-400"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-zinc-600">
                    Sắp xếp feed
                  </label>
                  <Select
                    value={sortMode}
                    onValueChange={(value) =>
                      setSortMode(
                        value as 'newest' | 'oldest' | 'media-priority'
                      )
                    }
                  >
                    <SelectTrigger className="border-zinc-300 bg-white text-zinc-900 focus:ring-zinc-400">
                      <SelectValue placeholder="Chọn kiểu sắp xếp" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-200 bg-white text-zinc-900">
                      <SelectItem
                        value="newest"
                        className="focus:bg-zinc-100 focus:text-zinc-900"
                      >
                        Mới nhất trước
                      </SelectItem>
                      <SelectItem
                        value="oldest"
                        className="focus:bg-zinc-100 focus:text-zinc-900"
                      >
                        Cũ nhất trước
                      </SelectItem>
                      <SelectItem
                        value="media-priority"
                        className="focus:bg-zinc-100 focus:text-zinc-900"
                      >
                        Ưu tiên bài có ảnh
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-zinc-600">
                    Loại bài viết
                  </label>
                  <Select
                    value={mediaFilter}
                    onValueChange={(value) =>
                      setMediaFilter(
                        value as 'all' | 'with-image' | 'text-only'
                      )
                    }
                  >
                    <SelectTrigger className="border-zinc-300 bg-white text-zinc-900 focus:ring-zinc-400">
                      <SelectValue placeholder="Chọn loại bài viết" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-200 bg-white text-zinc-900">
                      <SelectItem
                        value="all"
                        className="focus:bg-zinc-100 focus:text-zinc-900"
                      >
                        Tất cả bài viết
                      </SelectItem>
                      <SelectItem
                        value="with-image"
                        className="focus:bg-zinc-100 focus:text-zinc-900"
                      >
                        Có hình ảnh
                      </SelectItem>
                      <SelectItem
                        value="text-only"
                        className="focus:bg-zinc-100 focus:text-zinc-900"
                      >
                        Chỉ văn bản
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-zinc-600">
                    Thời gian đăng
                  </label>
                  <Select
                    value={timeFilter}
                    onValueChange={(value) =>
                      setTimeFilter(value as 'all' | 'recent' | 'older')
                    }
                  >
                    <SelectTrigger className="border-zinc-300 bg-white text-zinc-900 focus:ring-zinc-400">
                      <SelectValue placeholder="Chọn mốc thời gian" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-200 bg-white text-zinc-900">
                      <SelectItem
                        value="all"
                        className="focus:bg-zinc-100 focus:text-zinc-900"
                      >
                        Tất cả thời gian
                      </SelectItem>
                      <SelectItem
                        value="recent"
                        className="focus:bg-zinc-100 focus:text-zinc-900"
                      >
                        Trong 7 ngày gần đây
                      </SelectItem>
                      <SelectItem
                        value="older"
                        className="focus:bg-zinc-100 focus:text-zinc-900"
                      >
                        Cũ hơn 7 ngày
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full border border-zinc-300 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
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

              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Tóm tắt nhanh
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-[11px] text-zinc-500">Hiển thị</p>
                    <p className="text-lg font-semibold text-zinc-900">
                      {filteredPosts.length}
                    </p>
                  </div>
                  <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-[11px] text-zinc-500">Có ảnh</p>
                    <p className="flex items-center gap-1 text-lg font-semibold text-zinc-900">
                      <ImageIcon className="h-4 w-4 text-zinc-500" />
                      {filteredPostsWithImageCount}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-zinc-500">
                  Mẹo: chọn &quot;Ưu tiên bài có ảnh&quot; để rà soát nội dung
                  nổi bật nhanh như luồng feed mạng xã hội.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal Xác Nhận Gỡ Bài Viết */}
      {postIdToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-zinc-900 text-center mb-2">
              Gỡ bỏ bài viết
            </h2>

            {/* Message */}
            <p className="text-sm text-zinc-600 text-center mb-6">
              Bạn có chắc chắn muốn gỡ bỏ bài viết này? Hành động này không thể
              hoàn tác.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-9 bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50"
                onClick={() => setPostIdToDelete(null)}
              >
                Hủy
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() =>
                  postIdToDelete && handleRemovePost(postIdToDelete)
                }
              >
                Gỡ bỏ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
