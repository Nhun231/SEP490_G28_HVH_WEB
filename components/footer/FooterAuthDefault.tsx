'use client';

export default function Footer(props: { variant?: 'admin' | 'organizer' }) {
  const isAdmin = props.variant === 'admin';
  const linkClassName = isAdmin
    ? 'text-[10px] font-medium text-zinc-950 hover:text-zinc-950/80 lg:text-sm'
    : 'text-[10px] font-medium text-[#3A4163]/70 hover:text-[#3A4163] lg:text-sm';

  return (
    <div className="z-[3] flex flex-col items-center justify-between mt-auto pb-[30px] md:px-0 lg:flex-row">
      <ul className="flex flex-row">
        <li className="mr-4 md:mr-[44px]">
          <a
            className={linkClassName}
            target="_blank"
            href="https://horizon-ui.notion.site/Terms-Conditions-c671e573673746e19d2fc3e4cba0c161"
          >
            Điều khoản & Điều kiện
          </a>
        </li>
        <li className="mr-4 md:mr-[44px]">
          <a
            className={linkClassName}
            target="_blank"
            href="https://horizon-ui.notion.site/Privacy-Policy-c22ff04f55474ae3b35ec45feca62bad"
          >
            Chính sách quyền riêng tư
          </a>
        </li>
        <li className="mr-4 md:mr-[44px]">
          <a
            className={linkClassName}
            target="_blank"
            href="https://horizon-ui.notion.site/End-User-License-Agreement-8fb09441ea8c4c08b60c37996195a6d5"
          >
            Giấy phép
          </a>
        </li>
      </ul>
    </div>
  );
}
