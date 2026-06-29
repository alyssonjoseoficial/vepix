"use client";

// No external toast library used
import { useRouter } from "next/navigation";

interface ActionableBannersProps {
  settings: {
    banner1Tag?: string | null;
    banner1Title?: string | null;
    banner1Subtitle?: string | null;
    banner1Color?: string | null;
    banner1Mode?: string | null;
    banner1ImageUrl?: string | null;
    banner2Tag?: string | null;
    banner2Title?: string | null;
    banner2Subtitle?: string | null;
    banner2Color?: string | null;
    banner2Mode?: string | null;
    banner2ImageUrl?: string | null;
    freeShippingMinAmount?: any;
  } | null;
  storeSlug: string;
}

export function ActionableBanners({ settings, storeSlug }: ActionableBannersProps) {
  const router = useRouter();

  const b1Tag = settings?.banner1Tag ?? "CUPONS";
  const b1Title = settings?.banner1Title ?? "Frete Grátis";
  const b1Sub = settings?.banner1Subtitle ?? "Confira condições";
  const b1Color = settings?.banner1Color?.startsWith('#') ? settings.banner1Color : "#ea580c";
  const b1Mode = settings?.banner1Mode ?? "DYNAMIC";
  const b1Image = settings?.banner1ImageUrl;

  const b2Tag = settings?.banner2Tag ?? "NOVIDADE";
  const b2Title = settings?.banner2Title ?? "Cashback";
  const b2Sub = settings?.banner2Subtitle ?? "Em todas as compras";
  const b2Color = settings?.banner2Color?.startsWith('#') ? settings.banner2Color : "#0f172a";
  const b2Mode = settings?.banner2Mode ?? "DYNAMIC";
  const b2Image = settings?.banner2ImageUrl;

  const handleBanner1Click = () => {
    // Redirect to free shipping products
    router.push(`/${storeSlug}?freteGratis=true`);
  };

  const handleBanner2Click = () => {
    alert(`🎁 Novidades!\n\nEm breve novas vantagens para você.`);
  };

  return (
    <div className="hidden md:flex flex-col gap-2 h-72">
      {/* Banner 1 */}
      <div 
        onClick={handleBanner1Click}
        className={`flex-1 relative overflow-hidden rounded-md flex flex-col justify-center px-4 text-white hover:opacity-90 transition cursor-pointer p-0 m-0`}
        style={{ backgroundColor: b1Mode === "IMAGE" ? "transparent" : b1Color }}
      >
        {b1Mode === "IMAGE" && b1Image ? (
          <img src={b1Image} alt={b1Title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-sm w-fit mb-1 relative z-10">
              {b1Tag}
            </span>
            <strong className="text-xl leading-none relative z-10">
              {b1Title}
            </strong>
            <span className="text-xs opacity-90 relative z-10">{b1Sub}</span>
          </>
        )}
      </div>

      {/* Banner 2 */}
      <div 
        onClick={handleBanner2Click}
        className={`flex-1 relative overflow-hidden rounded-md flex flex-col justify-center px-4 text-white hover:opacity-90 transition cursor-pointer p-0 m-0`}
        style={{ backgroundColor: b2Mode === "IMAGE" ? "transparent" : b2Color }}
      >
        {b2Mode === "IMAGE" && b2Image ? (
          <img src={b2Image} alt={b2Title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <span className="text-xs font-bold bg-[#ee4d2d] px-2 py-0.5 rounded-sm w-fit mb-1 text-white relative z-10">
              {b2Tag}
            </span>
            <strong className="text-xl leading-none text-[#ffeb3b] relative z-10">
              {b2Title}
            </strong>
            <span className="text-xs text-slate-300 relative z-10">{b2Sub}</span>
          </>
        )}
      </div>
    </div>
  );
}
