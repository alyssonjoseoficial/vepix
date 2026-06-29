"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0] || null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
        <div className="text-slate-400">Sem imagem</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-[460px] mx-auto">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100">
        <Image
          src={mainImage}
          alt={productName}
          fill
          className="object-contain p-4"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(img)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                mainImage === img ? "border-slate-800 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${productName} thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
