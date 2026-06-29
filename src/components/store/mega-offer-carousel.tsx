"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

interface MegaOfferProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
}

interface MegaOfferCarouselProps {
  products: MegaOfferProduct[];
  tenantName: string;
  primaryColor: string;
  secondaryColor?: string;
  storeSlug: string;
}

export function MegaOfferCarousel({ products, tenantName, primaryColor, secondaryColor, storeSlug }: MegaOfferCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

  if (products.length === 0) {
    // Fallback: static banner if no mega offers
    return (
      <div 
        className="col-span-1 md:col-span-2 relative h-48 md:h-72 w-full overflow-hidden rounded-md flex items-center px-8"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor || '#ee4d2d'})` }}
      >
        <div className="relative z-10 text-white w-full md:w-2/3">
          <div className="inline-block bg-white text-xs font-black text-black px-2 py-0.5 mb-2 rounded-sm transform -skew-x-12">
            OFERTA RELÂMPAGO
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold uppercase leading-tight text-shadow-md">
            MEGA OFERTAS
            <br /> {tenantName}
          </h1>
          <p className="mt-1 text-sm text-white/90 font-medium">Aproveite enquanto durarem os estoques</p>
          <a href={`/loja/${storeSlug}`} className="mt-4 inline-flex items-center gap-1 bg-white px-4 py-1.5 text-sm font-bold text-[#ee4d2d] rounded-full shadow-md hover:bg-slate-100 transition">
            Compre agora <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/10 blur-2xl transform skew-x-12 translate-x-10" />
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div 
      className="col-span-1 md:col-span-2 relative h-48 md:h-72 w-full overflow-hidden rounded-md flex items-center px-4 md:px-8 transition-colors duration-500"
      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor || '#ee4d2d'})` }}
    >
      <div className="relative z-10 text-white w-full md:w-1/2 lg:w-2/3">
        <div className="inline-block bg-[#ffeb3b] text-xs font-black text-slate-900 px-2 py-0.5 mb-2 rounded-sm transform -skew-x-12 shadow-sm animate-pulse">
          ⚡ MEGA OFERTA
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold uppercase leading-tight text-shadow-md line-clamp-2" title={currentProduct.name}>
          {currentProduct.name}
        </h1>
        <p className="mt-1 text-xl md:text-2xl font-bold text-white/90">
          R$ {currentProduct.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <a href={`/loja/${storeSlug}/produto/${currentProduct.id}`} className="mt-4 inline-flex items-center gap-1 bg-white px-4 py-1.5 text-sm font-bold text-slate-900 rounded-full shadow-md hover:bg-slate-100 transition">
          Ver detalhes <ArrowRight className="h-4 w-4" />
        </a>

        {/* Carousel indicators */}
        {products.length > 1 && (
          <div className="flex gap-1 mt-6">
            {products.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Image */}
      {currentProduct.imageUrl && (
        <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[60%] md:w-[50%] lg:w-[45%] h-[120%] rotate-6 opacity-90 drop-shadow-2xl transition-all duration-500 ease-in-out">
          <img
            key={currentProduct.id}
            src={currentProduct.imageUrl}
            alt={currentProduct.name}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/5 blur-3xl transform skew-x-12 translate-x-10 pointer-events-none" />
    </div>
  );
}
