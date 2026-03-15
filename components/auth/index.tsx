'use client';

import Footer from '@/components/footer/FooterAuthDefault';
import Image from 'next/image';
import { PropsWithChildren, useEffect, useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa6';
import { HiBolt } from 'react-icons/hi2';

interface DefaultAuthLayoutProps extends PropsWithChildren {
  children: JSX.Element;
  viewProp: any;
  variant?: 'admin' | 'organizer';
}

export default function DefaultAuthLayout(props: DefaultAuthLayoutProps) {
  const { children, variant = 'organizer' } = props;
  const [mounted, setMounted] = useState(false);
  const isAdmin = variant === 'admin';

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }
  return (
    <div
      className={`relative min-h-screen ${
        isAdmin
          ? 'bg-gradient-to-br from-slate-50 to-gray-100 text-zinc-950'
          : 'bg-gradient-to-br from-[#EDF3FB] to-[#CBE3EF] text-[#3A4163]'
      }`}
    >
      <div className="mx-auto flex w-full flex-col justify-center px-5 pt-0 md:h-[unset] md:max-w-[66%] lg:h-[100vh] lg:max-w-[66%] lg:px-6 xl:pl-0 ">
        <a
          className={`mt-10 w-fit ${isAdmin ? 'text-zinc-700 hover:text-zinc-950' : 'text-[#3A4163] hover:text-[#3A4163]/80'}`}
          href={isAdmin ? '/dashboard' : '/'}
        >
          <div className="flex w-fit items-center lg:pl-0 lg:pt-0 xl:pt-0">
            <FaChevronLeft
              className={`mr-3 h-[13px] w-[8px] ${isAdmin ? 'text-zinc-600' : 'text-[#3A4163]'}`}
            />
            <p
              className={`ml-0 text-sm ${isAdmin ? 'text-zinc-700' : 'text-[#3A4163]'}`}
            >
              {isAdmin ? 'Quay lại Dashboard' : 'Quay lại trang web'}
            </p>
          </div>
        </a>
        {children}
        <div className="absolute right-0 hidden h-full min-h-[100vh] xl:block xl:w-[50vw] 2xl:w-[44vw]">
          <div
            className={`absolute flex h-full w-full flex-col items-end justify-center ${
              isAdmin
                ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950'
                : 'bg-[#5AA8D6]'
            }`}
          >
            <div
              className={`mb-[160px] mt-8 flex w-full items-center justify-center `}
            >
              <Image
                src={'/img/logo.png'}
                alt="Logo"
                width={140}
                height={140}
                className="rounded-sm"
              />

              <h5
                className={`ml-6 text-[2.75rem] font-bold leading-tight ${
                  isAdmin ? 'text-white' : 'text-white'
                }`}
              >
                {isAdmin ? 'Admin Portal' : 'Hà Nội Thiện Nguyện'}
              </h5>
            </div>
            <div
              className={`flex w-full flex-col items-center justify-center text-2xl font-semibold ${
                isAdmin ? 'text-slate-100' : 'text-white'
              }`}
            >
              <h4 className="mb-5 flex w-[600px] items-center justify-center rounded-md text-center text-2xl font-semibold">
                {isAdmin
                  ? '"Quản lý và giám sát các hoạt động thiện nguyện một cách hiệu quả và chuyên nghiệp."'
                  : '"Hà Nội Thiện Nguyện giúp bạn tìm thấy những dự án ý nghĩa chỉ trong vài lần chạm, biến việc giúp đỡ cộng đồng trở nên hiện đại và dễ dàng hơn bao giờ hết."'}
              </h4>
            </div>
          </div>
        </div>
        <Footer variant={isAdmin ? 'admin' : 'organizer'} />
      </div>
    </div>
  );
}
