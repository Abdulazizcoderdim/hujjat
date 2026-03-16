"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

interface ImagePreviewViewerProps {
  images: string[];
}

const ImagePreviewViewer: React.FC<ImagePreviewViewerProps> = ({ images }) => {
  console.log(images);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [imageHeights, setImageHeights] = useState<Record<number, number>>({});
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

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

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-index") || "0",
              10,
            );
            setLoadedImages((prev) => new Set([...prev, index]));
          }
        });
      },
      {
        rootMargin: "200px",
        threshold: 0.01,
      },
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);
  // salom

  useEffect(() => {
    if (!observerRef.current) return;

    const imageContainers = document.querySelectorAll(
      ".preview-image-container",
    );
    imageContainers.forEach((container) => {
      observerRef.current?.observe(container);
    });

    return () => {
      imageContainers.forEach((container) => {
        observerRef.current?.unobserve(container);
      });
    };
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Rasmlar mavjud emas
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full relative">
      <div className="flex flex-col items-center w-full gap-4">
        {images.map((imageUrl, index) => (
          <div
            key={`preview-image-${index}`}
            data-index={index}
            className="preview-image-container w-full flex justify-center bg-white shadow-sm rounded-lg overflow-hidden"
          >
            {loadedImages.has(index) ? (
              <div className="relative w-full min-h-36">
                <Image
                  src={imageUrl}
                  alt={`Preview sahifa ${index + 1}`}
                  width={containerWidth || 800}
                  height={imageHeights[index] || 10}
                  className="w-full h-auto object-contain"
                  loading={index === 0 ? "eager" : "lazy"}
                  quality={85}
                  unoptimized={true}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://via.placeholder.com/800x1000/E5E7EB/9CA3AF?text=Rasm+yuklanmadi";
                  }}
                  onLoadingComplete={(img) => {
                    const ratio = img.naturalHeight / img.naturalWidth;
                    setImageHeights((prev) => ({
                      ...prev,
                      [index]: Math.round((containerWidth || 800) * ratio),
                    }));
                  }}
                />
              </div>
            ) : (
              <div
                className="w-full bg-secondary animate-pulse flex items-center justify-center"
                style={{ minHeight: "400px" }}
              >
                <span className="text-muted-foreground text-sm">
                  Yuklanmoqda...
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagePreviewViewer;
