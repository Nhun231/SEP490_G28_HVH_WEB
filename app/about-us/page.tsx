/* eslint-disable @next/next/no-img-element */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AboutUsPage() {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-us-root">
      <header className="nav">
        <div className="wrap nav-inner">
          <Link className="brand" href="/">
            <img src="/img/logo.png" alt="HVH Logo" className="logo" />
            <span>Hà Nội Thiện Nguyện</span>
          </Link>

          <nav className="nav-links" aria-label="Primary">
            <a href="#story">Câu chuyện</a>
            <a href="#values">Giá trị</a>
            <a href="#team">Đội ngũ</a>
            <a href="#careers">Cơ hội nghề nghiệp</a>
          </nav>

          <a className="btn primary" href="#careers">
            Về cuối trang
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="reveal">
              <div className="kicker">
                <span className="dot"></span> Về chúng tôi
              </div>

              <h1>
                Chúng tôi có sứ mệnh gắn kết cộng đồng tình nguyện viên tại Hà
                Nội
              </h1>
              <p className="lead">
                Hanoi Volunteer Hub (HVH) là nền tảng tập trung giúp tối ưu hóa
                hoạt động tình nguyện với xác thực danh tính, chấm công bằng GPS
                và sinh trắc học, tự động tổng hợp giờ công tác, và cấp chứng
                chỉ số. Chúng tôi biến đóng góp cộng đồng thành hồ sơ uy tín,
                chuyên nghiệp, hỗ trợ mục tiêu học tập và nghề nghiệp.
              </p>

              <div className="hero-actions">
                <a className="btn primary" href="#values">
                  Giá trị cốt lõi
                </a>
                <a className="btn" href="#team">
                  Đội ngũ
                </a>
              </div>
            </div>

            <div
              className="hero-card reveal"
              role="img"
              aria-label="Illustration"
            >
              <div className="hero-illu">
                <img
                  src="/img/about-us/1.webp"
                  alt="Volunteers working together"
                />
              </div>

              <div className="hero-meta">
                <div className="stat">
                  <div
                    className="stat-image stat-image-a"
                    aria-hidden="true"
                  ></div>
                  <b>2026</b>
                  <span>Thành lập dự án</span>
                </div>
                <div className="stat">
                  <div
                    className="stat-image stat-image-b"
                    aria-hidden="true"
                  ></div>
                  <b>100+</b>
                  <span>Cá nhân và đội nhóm</span>
                </div>
                <div className="stat">
                  <div
                    className="stat-image stat-image-c"
                    aria-hidden="true"
                  ></div>
                  <b>Miễn phí</b>
                  <span>Phi lợi nhuận</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="story">
          <div className="wrap">
            <div className="section-head reveal">
              <div>
                <h2>Nâng tầm giá trị cộng đồng qua sự minh bạch</h2>
                <p className="sub">
                  Khởi đầu từ một dự án sinh viên vào cuối năm 2025, Hanoi
                  Volunteer Hub đang trở thành hệ sinh thái số trung tâm dành
                  cho thanh niên Thủ đô. chúng tôi giúp các tình nguyện viên và
                  tổ chức biến lòng tốt thành những đóng góp thực tiễn, được xác
                  thực và công nhận một cách chuyên nghiệp nhất.
                </p>
              </div>
            </div>

            <div className="story">
              <div className="panel pad reveal">
                <div className="story-image" aria-hidden="true"></div>
                <p className="lead" style={{ margin: 0 }}>
                  Chúng tôi xây dựng hệ thống giúp chuyển đổi hoạt động thiện
                  nguyện từ tự phát sang chuyên nghiệp - minh bạch hơn, kết nối
                  mạnh mẽ hơn và tập trung vào giá trị thực của mỗi cá nhân.
                </p>
                <div className="chip-row" aria-label="Highlights">
                  <span className="chip">Chính trực</span>
                  <span className="chip">Kết nối</span>
                  <span className="chip">Tự động hóa</span>
                  <span className="chip">Ghi nhận</span>
                </div>
                <div style={{ height: 14 }}></div>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--muted)',
                    lineHeight: 1.7
                  }}
                >
                  Khởi nguồn từ mong muốn minh bạch hóa hoạt động xã hội tại Thủ
                  đô, HVH không chỉ là một ứng dụng tìm kiếm mà là hệ sinh thái
                  số giúp ghi nhận công tâm mọi nỗ lực của tình nguyện viên. Tại
                  đây, mỗi giờ cống hiến đều được định danh và chuyển hóa thành
                  tài sản số cho sự nghiệp và học tập của bạn.
                </p>
              </div>

              <div
                className="panel mosaic reveal"
                aria-label="Image mosaic placeholder"
              >
                <div className="mosaic-grid">
                  <img
                    className="tile"
                    src="/img/about-us/row-1-column-1.png"
                    alt=""
                  />
                  <img
                    className="tile"
                    src="/img/about-us/row-1-column-2.png"
                    alt=""
                  />
                  <img
                    className="tile"
                    src="/img/about-us/row-1-column-3.png"
                    alt=""
                  />
                  <img
                    className="tile"
                    src="/img/about-us/row-2-column-1.png"
                    alt=""
                  />
                  <img
                    className="tile"
                    src="/img/about-us/row-2-column-2.png"
                    alt=""
                  />
                  <img
                    className="tile"
                    src="/img/about-us/row-2-column-3.png"
                    alt=""
                  />
                  <img
                    className="tile"
                    src="/img/about-us/row-3-column-1.png"
                    alt=""
                  />
                  <img
                    className="tile"
                    src="/img/about-us/row-3-column-2.png"
                    alt=""
                  />
                  <img
                    className="tile"
                    src="/img/about-us/row-3-column-3.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="values">
          <div className="wrap">
            <div className="section-head reveal">
              <div>
                <h2>Giá trị cốt lõi</h2>
                <p className="sub">
                  Những nguyên tắc nền tảng định hình cách chúng tôi vận hành,
                  xây dựng hệ thống và phát triển mạng lưới tình nguyện tại Thủ
                  đô.
                </p>
              </div>
            </div>

            <div className="values">
              <div
                className="panel values-illu reveal"
                aria-label="Values illustration"
              >
                <img src="/img/about-us/kid.webp" alt="Values illustration" />
              </div>

              <div className="value-list">
                <div className="value-item reveal">
                  <img
                    className="card-image"
                    src="/img/about-us/connect.webp"
                    alt="Team collaboration"
                  />
                  <h3>Gắn kết</h3>
                  <p>
                    Tại HVH, chúng tôi tin rằng không một cá nhân nào có thể
                    thay đổi thế giới một mình. Chúng tôi làm việc với lòng tôn
                    trọng, luôn lắng nghe và sẵn sàng hỗ trợ nhau như những
                    người bạn đồng hành. Thành công lớn nhất của chúng tôi là
                    thấy mỗi thành viên trong nhóm không chỉ hoàn thành dự án,
                    mà còn trưởng thành hơn về tâm hồn và sự thấu cảm với cộng
                    đồng.
                  </p>
                </div>

                <div className="value-item reveal">
                  <img
                    className="card-image"
                    src="/img/about-us/confidential.webp"
                    alt="Ownership and craft"
                    style={{ objectPosition: 'center -45px' }}
                  />
                  <h3>Tâm huyết</h3>
                  <p>
                    Chúng tôi chăm chút cho từng tính năng của ứng dụng như đang
                    chuẩn bị một món quà dành tặng cho cộng đồng. Mỗi thành viên
                    đều ý thức rằng công việc mình làm sẽ ảnh hưởng trực tiếp
                    đến niềm tin của mọi người. Chúng tôi tự hào khi tạo ra một
                    nơi mà lòng tốt được đặt đúng chỗ và sự tử tế luôn được bảo
                    vệ.
                  </p>
                </div>

                <div className="value-item reveal">
                  <img
                    className="card-image"
                    src="/img/about-us/scrappy.jpg"
                    alt="Move fast"
                  />
                  <h3>Dấn thân</h3>
                  <p>
                    Lòng tốt là không chờ đợi. Thay vì chỉ ngồi trên bàn giấy
                    với những kế hoạch dài dằng dặc, chúng tôi chọn cách dấn
                    thân, linh hoạt và xử lý vấn đề ngay khi có thể. Chúng tôi
                    ưu tiên mang lại giá trị thực tế cho các bạn tình nguyện
                    viên và các tổ chức xã hội một cách nhanh nhất, bởi chúng
                    tôi hiểu rằng mỗi hành động nhỏ hôm nay đều góp phần tạo nên
                    thay đổi lớn cho ngày mai.
                  </p>
                </div>

                <div className="value-item reveal">
                  <img
                    className="card-image"
                    src="/img/about-us/curious.webp"
                    alt="Curiosity and learning"
                  />
                  <h3>Thấu cảm</h3>
                  <p>
                    Chúng tôi không bao giờ cho rằng mình đã biết tất cả. Nhóm
                    luôn giữ tâm thế của một người đi tìm lời giải cho những khó
                    khăn của xã hội. Chúng tôi không ngại đặt câu hỏi, không
                    ngại đi sâu vào thực tế để lắng nghe những tâm tư của các cô
                    chú điều phối viên hay các bạn sinh viên, từ đó hoàn thiện
                    hệ thống sao cho thiết thực nhất.
                  </p>
                </div>

                <div className="value-item reveal">
                  <img
                    className="card-image"
                    src="/img/about-us/honest.jpg"
                    alt="Speak up"
                    style={{ objectPosition: 'center -15px' }}
                  />
                  <h3>Chân thành</h3>
                  <p>
                    Ở HVH, mọi tiếng nói đều có giá trị. Chúng tôi khuyến khích
                    mọi người thẳng thắn sẻ chia suy nghĩ, từ những lời khen
                    ngợi đến những góp ý chân tình. Không có khoảng cách giữa
                    &quot;trưởng nhóm&quot; hay &quot;thành viên&quot;, chỉ có những con người cùng
                    chung mục tiêu, cùng góp ý để dự án ngày một hoàn thiện hơn.
                  </p>
                </div>

                <div className="value-item reveal">
                  <img
                    className="card-image"
                    src="/img/about-us/full.jpg"
                    alt="Experience design"
                    style={{ objectPosition: 'center -45px' }}
                  />
                  <h3>Trọn vẹn</h3>
                  <p>
                    Với chúng tôi, HVH không phải là một phần mềm khô khan, mà
                    là nơi lưu giữ những kỉ niệm đẹp. Chúng tôi quan tâm đến cảm
                    xúc của bạn từ lúc tìm thấy một hoạt động phù hợp cho đến
                    khi nhận được tấm giấy chứng nhận trên tay. Mọi điểm chạm
                    đều được thiết kế để bạn cảm thấy sự ấm áp, tự hào và thêm
                    yêu công việc thiện nguyện này.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="team">
          <div className="wrap">
            <div className="section-head reveal">
              <div>
                <h2>Những người trẻ, những tâm hồn nhiệt huyết</h2>
                <p className="sub">
                  Nếu phải chọn một điểm chung duy nhất giữa tất cả những con
                  người đang vận hành dự án này, đó chính là ngọn lửa tình
                  nguyện luôn rực cháy. Chính tinh thần ấy đã khơi nguồn cho mọi
                  ý tưởng sáng tạo và biến những giờ làm việc mệt mỏi thành
                  những niềm vui. Chúng mình tự hào về tình bạn và sự gắn kết đã
                  hình thành trong suốt quá trình xây dựng HVH — và chúng mình
                  luôn chào đón bạn cùng đồng hành trên hành trình lan tỏa sự tử
                  tế này.
                </p>
              </div>
            </div>

            <div className="panel team-grid reveal">
              <div className="avatars reveal" aria-label="Team photos">
                <img
                  className="avatar"
                  src="/img/members/moon.jpg"
                  alt="Moon"
                />
                <img className="avatar" src="/img/members/dat.jpg" alt="Dat" />
                <img
                  className="avatar"
                  src="/img/members/dieu.jpg"
                  alt="Dieu"
                />
                <img
                  className="avatar"
                  src="/img/members/hieu.jpg"
                  alt="Hieu"
                />
                <img
                  className="avatar"
                  src="/img/members/kien.png"
                  alt="Kien"
                />
                <img className="avatar" src="/img/members/na.jpg" alt="Na" />
              </div>

              <div id="careers" className="careers">
                <div className="left">
                  <b>Cùng chúng mình lan tỏa điều tử tế</b>
                  <span>
                    Những vị trí đang chờ bạn – Trở thành một phần của HVH
                  </span>
                </div>
                <a className="btn primary" href="#">
                  Lên đầu trang
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot reveal">
          <div>
            <div className="brand">
              <img src="/img/logo.png" alt="HVH Logo" className="logo" />
              <span>Hanoi Volunteer Hub</span>
            </div>
            <p>Trao gửi tâm huyết – Kết nối cộng đồng</p>
          </div>
          <div className="foot-links" aria-label="Footer links">
            <a href="#story">Câu chuyện</a>
            <a href="#values">Giá trị</a>
            <a href="#team">Đội ngũ</a>
            <a href="#careers">Cơ hội nghề nghiệp</a>
          </div>
        </div>
      </footer>
      <style jsx global>{`
        :root {
          --bg: hsl(var(--background));
          --panel: hsl(var(--card));
          --text: hsl(var(--foreground));
          --muted: hsl(var(--muted-foreground));
          --muted2: hsl(var(--foreground) / 0.55);
          --border: hsl(var(--border));
          --a: hsl(var(--primary));
          --b: hsl(var(--secondary));
          --c: hsl(var(--accent));
          --shadow: 0 18px 50px hsl(var(--primary) / 0.2);
          --radius: 18px;
          --max: 1120px;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          height: 100%;
        }

        body {
          margin: 0;
          color: var(--text);
          background-color: var(--bg);
          background-image:
            radial-gradient(
              1200px 700px at 15% -10%,
              hsl(var(--primary) / 0.22),
              transparent 60%
            ),
            radial-gradient(
              1000px 700px at 85% 0%,
              hsl(var(--secondary) / 0.2),
              transparent 55%
            ),
            radial-gradient(
              900px 700px at 70% 110%,
              hsl(var(--accent) / 0.18),
              transparent 55%
            );
        }

        .about-us-root a {
          color: inherit;
          text-decoration: none;
        }

        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition:
            opacity 0.6s ease,
            transform 0.6s ease;
          will-change: opacity, transform;
        }

        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }

        .wrap {
          max-width: var(--max);
          margin: 0 auto;
          padding: 0 20px;
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(10px);
          background: linear-gradient(
            180deg,
            hsl(var(--background) / 0.9) 0%,
            hsl(var(--background) / 0.72) 100%
          );
          border-bottom: 1px solid var(--border);
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          letter-spacing: 0.2px;
        }

        .logo {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: block;
          object-fit: contain;
        }

        .nav-links {
          display: flex;
          gap: 18px;
          align-items: center;
          color: var(--muted);
          font-weight: 600;
          font-size: 14px;
        }

        .nav-links a {
          opacity: 0.9;
        }

        .nav-links a:hover {
          opacity: 1;
          color: var(--text);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 999px;
          font-weight: 700;
          border: 1px solid var(--border);
          background: hsl(var(--primary) / 0.08);
          color: var(--text);
          transition:
            transform 0.15s ease,
            background 0.15s ease,
            border-color 0.15s ease;
          cursor: pointer;
        }

        .btn:hover {
          transform: translateY(-1px);
          background: hsl(var(--primary) / 0.12);
          border-color: hsl(var(--primary) / 0.25);
        }

        .btn.primary {
          border: 0;
          background: linear-gradient(
            90deg,
            hsl(var(--primary) / 0.75),
            hsl(var(--secondary) / 0.75)
          );
          box-shadow: 0 14px 40px hsl(var(--primary) / 0.18);
        }

        .hero {
          padding: 72px 0 22px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 36px;
          align-items: center;
        }

        .kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border: 1px solid var(--border);
          background: hsl(var(--primary) / 0.06);
          border-radius: 999px;
          color: var(--muted);
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.3px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--a), var(--b));
          box-shadow: 0 0 0 4px hsl(var(--primary) / 0.18);
        }

        h1 {
          margin: 16px 0 12px;
          font-size: clamp(34px, 4.8vw, 56px);
          line-height: 1.05;
          letter-spacing: -0.02em;
        }

        .lead {
          color: var(--muted);
          font-size: clamp(16px, 1.55vw, 18px);
          line-height: 1.7;
          max-width: 56ch;
          margin: 0 0 22px;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .hero-card {
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background:
            radial-gradient(
              420px 240px at 30% 25%,
              hsl(var(--primary) / 0.22),
              transparent 60%
            ),
            radial-gradient(
              420px 240px at 70% 70%,
              hsl(var(--secondary) / 0.18),
              transparent 55%
            ),
            var(--panel);
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .hero-illu {
          padding: 22px;
        }

        .hero-illu svg,
        .hero-illu img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 16px;
        }

        .hero-meta {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 18px 18px 20px;
          border-top: 1px solid var(--border);
          background: hsl(var(--primary) / 0.08);
        }

        .stat {
          padding: 12px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: hsl(var(--card) / 0.95);
        }

        .stat-image {
          height: 40px;
          border-radius: 10px;
          margin-bottom: 8px;
          border: 1px solid var(--border);
          background-size: cover;
          background-position: center;
        }

        .stat-image-a {
          background-image:
            linear-gradient(
              140deg,
              hsl(var(--primary) / 0.35),
              transparent 65%
            ),
            url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80');
        }

        .stat-image-b {
          background-image:
            linear-gradient(
              160deg,
              hsl(var(--secondary) / 0.32),
              transparent 65%
            ),
            url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80');
        }

        .stat-image-c {
          background-image:
            linear-gradient(200deg, hsl(var(--accent) / 0.3), transparent 65%),
            url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=400&q=80');
        }

        .stat b {
          display: block;
          font-size: 16px;
        }

        .stat span {
          display: block;
          color: var(--muted2);
          font-size: 12px;
          margin-top: 4px;
        }

        section {
          padding: 56px 0;
        }

        .section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 22px;
        }

        h2 {
          margin: 0;
          font-size: clamp(24px, 3.2vw, 34px);
          letter-spacing: -0.02em;
        }

        .sub {
          margin: 8px 0 0;
          color: var(--muted);
          line-height: 1.7;
          max-width: 75ch;
        }

        .story {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 22px;
          align-items: stretch;
        }

        .panel {
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: var(--panel);
          box-shadow: var(--shadow);
        }

        .panel.pad {
          padding: 22px;
        }

        .story-image {
          height: 140px;
          border-radius: 14px;
          margin-bottom: 16px;
          border: 1px solid var(--border);
          background-image:
            linear-gradient(
              135deg,
              hsl(var(--primary) / 0.22),
              transparent 65%
            ),
            url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80');
          background-size: cover;
          background-position: center;
        }

        .chip-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .chip {
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: hsl(var(--primary) / 0.08);
          font-size: 12px;
          color: var(--muted);
          font-weight: 700;
        }

        .mosaic {
          height: 100%;
          padding: 18px;
          background:
            radial-gradient(
              450px 220px at 20% 20%,
              hsl(var(--accent) / 0.18),
              transparent 55%
            ),
            radial-gradient(
              450px 240px at 80% 75%,
              hsl(var(--primary) / 0.18),
              transparent 60%
            ),
            hsl(var(--card) / 0.9);
        }

        .mosaic-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .tile {
          border-radius: 16px;
          border: 1px solid var(--border);
          width: 100%;
          height: 88px;
          object-fit: cover;
          display: block;
        }

        .values {
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          gap: 22px;
          align-items: start;
        }

        .values-illu {
          padding: 20px;
          overflow: hidden;
        }

        .values-illu img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 16px;
          transform: scale(1.3);
        }

        .value-list {
          display: grid;
          gap: 12px;
        }

        .value-item {
          padding: 16px 16px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: hsl(var(--card) / 0.95);
        }

        .card-image {
          height: 120px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--border);
          margin-bottom: 12px;
          object-fit: cover;
          display: block;
        }

        .value-item h3 {
          margin: 0 0 8px;
          font-size: 16px;
          letter-spacing: -0.01em;
        }

        .value-item p {
          margin: 0;
          color: var(--muted);
          line-height: 1.65;
          font-size: 14px;
        }

        .team-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .avatars {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          padding: 18px;
        }

        .avatar {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 18px;
          border: 1px solid var(--border);
          object-fit: cover;
          object-position: center;
          display: block;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        .careers {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 18px;
          border-top: 1px solid var(--border);
          background: hsl(var(--primary) / 0.08);
        }

        .careers .left b {
          display: block;
          font-size: 14px;
        }

        .careers .left span {
          display: block;
          color: var(--muted2);
          font-size: 13px;
          margin-top: 3px;
        }

        footer {
          padding: 44px 0 60px;
          border-top: 1px solid var(--border);
          background: hsl(var(--primary) / 0.06);
        }

        .foot {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 16px;
          align-items: start;
        }

        .foot p {
          margin: 10px 0 0;
          color: var(--muted);
          line-height: 1.7;
        }

        .foot-links {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: flex-end;
          color: var(--muted);
          font-weight: 600;
          font-size: 14px;
        }

        @media (max-width: 980px) {
          .hero-grid,
          .story,
          .values {
            grid-template-columns: 1fr;
          }

          .hero-meta {
            grid-template-columns: 1fr;
          }

          .avatars {
            grid-template-columns: repeat(4, 1fr);
          }

          .section-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .foot {
            grid-template-columns: 1fr;
          }

          .foot-links {
            justify-content: flex-start;
          }
        }

        @media (max-width: 520px) {
          .nav-links {
            display: none;
          }

          .avatars {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
