'use client';

/*eslint-disable*/

export default function Footer(props: {
  colorVariant?: 'admin' | 'organizer';
}) {
  const colorVariant = props.colorVariant ?? 'admin';
  const footerTextClassName =
    colorVariant === 'organizer' ? 'text-[#3A4163]' : 'text-slate-400';
  const footerLinkClassName =
    colorVariant === 'organizer'
      ? 'text-sm font-medium text-[#3A4163] hover:text-[#1D2737]'
      : 'text-sm font-medium text-slate-400 hover:text-[#E8EEF7]';

  return (
    <div className="flex w-full flex-col items-center justify-between px-1 pb-8 pt-3 xl:flex-row">
      <p
        className={`mb-4 text-center text-sm font-medium sm:!mb-0 md:text-lg ${footerTextClassName}`}
      >
        <span
          className={`mb-4 text-center text-sm sm:!mb-0 md:text-sm ${footerTextClassName}`}
        >
          ©{new Date().getFullYear()} Hà Nội Thiện Nguyện. All Rights Reserved.
        </span>
      </p>
      <div>
        <ul className="flex flex-wrap items-center gap-3 sm:flex-nowrap md:gap-10">
          <li>
            <a
              target="blank"
              href="mailto:hello@simmmple.com"
              className={footerLinkClassName}
            >
              Câu hỏi thường gặp
            </a>
          </li>
          <li>
            <a
              target="blank"
              href="https://horizon-ui.com/"
              className={footerLinkClassName}
            >
              Chính sách quyền riêng tư
            </a>
          </li>
          <li>
            <a
              target="blank"
              href="https://horizon-ui.com/boilerplate"
              className={footerLinkClassName}
            >
              Điều khoản & Điều kiện
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
