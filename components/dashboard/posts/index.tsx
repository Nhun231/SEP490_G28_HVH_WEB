'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  id: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  content: string;
  imageUrls?: string[];
}

interface PostsManagementProps {
  posts?: Post[];
}

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

  if (images.length === 1) {
    return (
      <>
        <div
          className="mt-3 -mx-4 -mb-4 overflow-hidden rounded-b-lg bg-zinc-100 group relative cursor-pointer"
          onClick={() => openModal(0)}
        >
          <img
            src={images[0]}
            alt="Post"
            className="h-96 w-full object-cover"
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
        <div className="mt-3 -mx-4 -mb-4 overflow-hidden rounded-b-lg bg-zinc-100">
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
                  className="h-48 w-full object-cover"
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
        <div className="mt-3 -mx-4 -mb-4 overflow-hidden rounded-b-lg bg-zinc-100">
          <div className="grid grid-cols-3 gap-1">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer"
                onClick={() => openModal(idx)}
              >
                <img
                  src={img}
                  alt={`Post ${idx + 1}`}
                  className="h-32 w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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

  // 4+ ảnh: Grid 2x2 với overlay "Xem thêm"
  return (
    <>
      <div className="mt-3 -mx-4 -mb-4 overflow-hidden rounded-b-lg bg-zinc-100">
        <div className="grid grid-cols-2 gap-1">
          {images.slice(0, 4).map((img, idx) => (
            <div key={idx} className="relative group cursor-pointer">
              {idx === 3 && images.length > 4 ? (
                <div className="relative" onClick={() => openModal(idx)}>
                  <img
                    src={img}
                    alt={`Post ${idx + 1}`}
                    className="h-32 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center hover:bg-black/70 transition-colors">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        +{images.length - 4}
                      </p>
                      <p className="text-xs text-white">Xem thêm</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div onClick={() => openModal(idx)}>
                  <img
                    src={img}
                    alt={`Post ${idx + 1}`}
                    className="h-32 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              )}
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

export default function PostsManagement({ posts }: PostsManagementProps) {
  // Mock data - thay bằng data thực khi có API
  const [postList, setPostList] = useState<Post[]>(
    posts || [
      {
        id: '1',
        authorName: 'Nguyễn Thị Mai',
        authorAvatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenThiMai',
        createdAt: '2 ngày trước',
        content:
          'Hôm nay chúng em tham gia tình nguyện dạy dỏ cho trẻ em vùng cao. Các cô cậu khá thông minh, nhất là toán 😊 Cảm ơn những người đã đồng hành cùng chúng mình! 💙',
        imageUrls: [
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=500&fit=crop'
        ]
      },
      {
        id: '2',
        authorName: 'Trần Văn Bình',
        authorAvatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=TranVanBinh',
        createdAt: '5 ngày trước',
        content:
          'Sáng nay vệ sinh khu phố lân cận xong. Mọi người hãy giữ gìn môi trường sạch đẹp nhé!',
        imageUrls: undefined
      },
      {
        id: '3',
        authorName: 'Lê Quốc Cường',
        authorAvatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=LeQuocCuong',
        createdAt: '3 ngày trước',
        content:
          'Buổi mưa chiều mai chúng ta sẽ tiếp tục làm sạch công viên Tao Đàn. Mọi người chuẩn bị đồng phục và dụng cụ nhé! 🧹',
        imageUrls: [
          'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=500&fit=crop'
        ]
      },
      {
        id: '4',
        authorName: 'Phạm Thu Dung',
        authorAvatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamThuDung',
        createdAt: '1 tuần trước',
        content:
          'Thành công hoàn thành chương trình "Mỗi ngày một tháng tốt" tại trường THPT Phan Bội Châu. Cảm ơn các bạn tình nguyện viên đã tham gia! Chúng ta sẽ tiếp tục trong tháng tới 🌟',
        imageUrls: [
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=500&fit=crop',
          'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=1200&h=500&fit=crop',
          'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=500&fit=crop'
        ]
      },
      {
        id: '5',
        authorName: 'Vũ Thị Hạnh',
        authorAvatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=VuThiHanh',
        createdAt: '6 ngày trước',
        content:
          'Donate lần này chúng tôi thu được 2 tấn sách, 500 bộ quần áo và muôn vàn niềm vui từ cô trò trường A. Tình yêu thương thật sự tuyệt vời! 📚❤️',
        imageUrls: [
          'https://images.unsplash.com/photo-1506776592495-42f7739f1f19?w=1200&h=500&fit=crop',
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=500&fit=crop'
        ]
      },
      {
        id: '6',
        authorName: 'Đỗ Văn Hòa',
        authorAvatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=DoVanHoa',
        createdAt: '10 ngày trước',
        content:
          'Các bạn tình nguyện viên đã giúp xây dựng lại 2 căn nhà cho gia đình khó khăn ở huyện Ba Vì. Công việc vất vả nhưng cảm giác giúp được người khác thật là tuyệt! 🏡',
        imageUrls: [
          'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=1200&h=500&fit=crop',
          'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=500&fit=crop',
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=500&fit=crop',
          'https://images.unsplash.com/photo-1506776592495-42f7739f1f19?w=1200&h=500&fit=crop'
        ]
      },
      {
        id: '7',
        authorName: 'Ngô Thị Lan',
        authorAvatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=NgoThiLan',
        createdAt: '2 tuần trước',
        content:
          'Cảm ơn tất cả mọi người đã tham gia chương trình khám sức khỏe miễn phí cho người cao tuổi tại các phường quận Hoàn Kiếm. Sức khỏe cộng đồng là trách nhiệm của chúng ta! 💊',
        imageUrls: undefined
      }
    ]
  );

  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);

  const handleRemovePost = (postId: string) => {
    const postToRemove = postList.find((p) => p.id === postId);
    if (!postToRemove) return;

    setPostList(postList.filter((p) => p.id !== postId));
    toast.success(`Đã gỡ bài viết của ${postToRemove.authorName}`);
    setPostIdToDelete(null);
  };

  return (
    <div className="w-full">
      <Card className="border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Quản lý bài viết công động
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Xem và quản lý bài viết
            <span className="ml-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              {postList.length} bài viết
            </span>
          </p>
        </div>

        {postList.length === 0 ? (
          <div className="flex h-96 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50">
            <p className="text-center text-zinc-500">
              Không có bài đăng nào hiện tại
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {postList.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow min-h-fit"
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
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
                          {post.authorName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-zinc-900">
                        {post.authorName}
                      </p>
                      <p className="text-xs text-zinc-500">{post.createdAt}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setPostIdToDelete(post.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Gỡ bài viết
                  </Button>
                </div>

                {/* Content */}
                <p className="mt-3 text-sm text-zinc-700 leading-relaxed">
                  {post.content}
                </p>

                {/* Image Gallery */}
                {post.imageUrls && post.imageUrls.length > 0 && (
                  <ImageGallery images={post.imageUrls} />
                )}
              </div>
            ))}
          </div>
        )}
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
