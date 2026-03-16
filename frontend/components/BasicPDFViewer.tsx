"use client";

import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface SimplePdfViewerProps {
  pdfUrl: string;
}

const SimplePdfViewer: React.FC<SimplePdfViewerProps> = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width) {
          setContainerWidth(entry.contentRect.width - 2);
        }
      }
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div ref={wrapperRef} className="w-full relative">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex justify-center p-4 text-gray-500">
            Yuklanmoqda...
          </div>
        }
        error={
          <div className="text-red-500 text-center p-4">Xatolik yuz berdi.</div>
        }
        className="flex flex-col items-center w-full"
      >
        {numPages &&
          Array.from(new Array(numPages), (el, index) => (
            <div
              key={`page_${index + 1}`}
              className="mb-4 shadow-sm w-full flex justify-center bg-white"
            >
              <Page
                pageNumber={index + 1}
                width={containerWidth || undefined}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="max-w-full"
                loading=""
              />
            </div>
          ))}
      </Document>
    </div>
  );
};

export default SimplePdfViewer;
