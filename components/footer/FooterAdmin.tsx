'use client';

/*eslint-disable*/

export default function Footer() {
  return (
    <div className="flex w-full flex-col items-center justify-between px-1 pb-8 pt-3 xl:flex-row">
      <p className="mb-4 text-center text-sm font-medium text-slate-400 sm:!mb-0 md:text-lg">
        <span className="mb-4 text-center text-sm text-slate-400 sm:!mb-0 md:text-sm">
          ©{new Date().getFullYear()} Hà Nội Thiện Nguyện. All Rights Reserved.
        </span>
      </p>
      <div>
        <ul className="flex flex-wrap items-center gap-3 sm:flex-nowrap md:gap-10">
          <li>
            <a
              target="blank"
              href="mailto:hello@simmmple.com"
              className="text-sm font-medium text-slate-400 hover:text-slate-200"
            >
              Câu hỏi thường gặp
            </a>
          </li>
          <li>
            <a
              target="blank"
              href="https://horizon-ui.com/"
              className="text-sm font-medium text-slate-400 hover:text-slate-200"
            >
              Chính sách quyền riêng tư
            </a>
          </li>
          <li>
            <a
              target="blank"
              href="https://horizon-ui.com/boilerplate"
              className="text-sm font-medium text-slate-400 hover:text-slate-200"
            >
              Điều khoản & Điều kiện
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
