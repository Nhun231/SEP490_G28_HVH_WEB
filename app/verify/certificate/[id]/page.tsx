/* eslint-disable @next/next/no-img-element */

'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useVerifyCertificate } from '@/hooks/features/verify-certificate/useVerifyCertificate';
import { getFullSupabaseImageUrl } from '@/utils/helpers';

export default function VerifyCertificatePage() {
  const params = useParams<{ id: string }>();
  const certificateCode = params?.id;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const [isPdfRendering, setIsPdfRendering] = useState(false);
  const [pdfRenderError, setPdfRenderError] = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState('');

  const { data, error, isLoading } = useVerifyCertificate({
    certificateCode,
    baseUrl,
    enabled: Boolean(certificateCode)
  });

  const signedFileUrl = useMemo(() => {
    if (!data?.certSignedUrl) return '';
    return getFullSupabaseImageUrl(data.certSignedUrl);
  }, [data?.certSignedUrl]);

  const isPdfFile = useMemo(() => {
    if (!signedFileUrl) return false;
    return /\.pdf(?:$|\?)/i.test(signedFileUrl);
  }, [signedFileUrl]);

  useEffect(() => {
    if (!isPdfFile || !signedFileUrl) {
      setPdfBlobUrl('');
      return;
    }

    let cancelled = false;
    let createdBlobUrl = '';

    const preparePdfPreview = async () => {
      try {
        setPdfRenderError('');
        setIsPdfRendering(true);

        const response = await fetch(signedFileUrl);
        if (!response.ok) {
          throw new Error(`Cannot fetch PDF (${response.status})`);
        }

        const buffer = await response.arrayBuffer();
        if (cancelled) return;

        const blob = new Blob([buffer], { type: 'application/pdf' });
        createdBlobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(createdBlobUrl);
      } catch (previewError) {
        if (!cancelled) {
          console.error('PDF preview failed:', previewError);
          setPdfRenderError(
            'Khong the hien thi PDF trong trang. Vui long mo file goc.'
          );
          setPdfBlobUrl('');
        }
      } finally {
        if (!cancelled) {
          setIsPdfRendering(false);
        }
      }
    };

    preparePdfPreview();

    return () => {
      cancelled = true;
      if (createdBlobUrl) {
        URL.revokeObjectURL(createdBlobUrl);
      }
    };
  }, [isPdfFile, signedFileUrl]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600" />
          <p className="text-zinc-600">Đang tải chứng chỉ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <img
          src="/img/404.png"
          alt="Không tìm thấy chứng chỉ"
          className="h-auto w-full max-w-2xl object-contain"
        />
      </div>
    );
  }

  if (!signedFileUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <img
          src="/img/404.png"
          alt="Không tìm thấy chứng chỉ"
          className="h-auto w-full max-w-2xl object-contain"
        />
      </div>
    );
  }

  if (isPdfFile) {
    return (
      <div className="relative min-h-screen w-full bg-zinc-100">
        {isPdfRendering ? (
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600" />
              <p className="text-zinc-600">Đang tải PDF...</p>
            </div>
          </div>
        ) : pdfRenderError ? (
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p>{pdfRenderError}</p>
              <a
                href={signedFileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-medium text-blue-600 hover:text-blue-700"
              >
                Mở PDF gốc
              </a>
            </div>
          </div>
        ) : pdfBlobUrl ? (
          <object
            data={pdfBlobUrl}
            type="application/pdf"
            className="h-screen w-full"
          >
            <iframe
              src={pdfBlobUrl}
              title="PDF chứng chỉ tình nguyện"
              className="h-screen w-full"
            />
          </object>
        ) : (
          <div className="flex min-h-screen items-center justify-center px-4">
            <p className="text-sm text-zinc-600">
              Đang chuẩn bị xem trước PDF...
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <img
        src={signedFileUrl}
        alt="Chứng chỉ tình nguyện"
        className="h-auto w-full object-contain"
      />
    </div>
  );
}
