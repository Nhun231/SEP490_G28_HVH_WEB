'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function AboutUsPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return;
    }

    let resizeObserver: ResizeObserver | null = null;

    const syncHeight = () => {
      const frameDocument =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (!frameDocument) {
        return;
      }

      const { body, documentElement } = frameDocument;
      const nextHeight = Math.max(
        body?.scrollHeight ?? 0,
        body?.offsetHeight ?? 0,
        documentElement?.scrollHeight ?? 0,
        documentElement?.offsetHeight ?? 0,
        documentElement?.clientHeight ?? 0
      );

      iframe.style.height = `${nextHeight}px`;
    };

    const handleLoad = () => {
      syncHeight();

      const frameDocument =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (!frameDocument || typeof ResizeObserver === 'undefined') {
        return;
      }

      resizeObserver?.disconnect();
      resizeObserver = new ResizeObserver(() => {
        syncHeight();
      });

      if (frameDocument.body) {
        resizeObserver.observe(frameDocument.body);
      }

      if (frameDocument.documentElement) {
        resizeObserver.observe(frameDocument.documentElement);
      }
    };

    iframe.addEventListener('load', handleLoad);
    window.addEventListener('resize', syncHeight);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      window.removeEventListener('resize', syncHeight);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#ffffff'
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '16px 24px',
          borderBottom: '1px solid #dcecff',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(238,246,255,0.98) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(15, 79, 168, 0.08)'
        }}
      >
        <div
          style={{
            color: '#0b3f86',
            fontSize: 'clamp(18px, 2vw, 24px)',
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}
        >
          Hanoi Volunteer Hub
        </div>

        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 18px',
            borderRadius: '999px',
            border: '1px solid #2f8de4',
            backgroundColor: '#ffffff',
            color: '#0f4fa8',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          Quay lại trang chủ
        </Link>
      </header>

      <iframe
        ref={iframeRef}
        src="/about-us-source.html"
        title="About Us Source Embed"
        scrolling="no"
        style={{
          width: '100%',
          minHeight: 'calc(100vh - 74px)',
          border: '0',
          display: 'block',
          overflow: 'hidden'
        }}
        allow="fullscreen"
      />
    </div>
  );
}
