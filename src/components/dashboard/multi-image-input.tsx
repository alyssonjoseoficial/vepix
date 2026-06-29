"use client";

import { useState } from "react";
import { UploadDropzone } from "@/utils/uploadthing";
import { Trash } from "lucide-react";
import Image from "next/image";

interface MultiImageInputProps {
  name: string;
  defaultValues?: string[];
}

export function MultiImageInput({ name, defaultValues = [] }: MultiImageInputProps) {
  const [urls, setUrls] = useState<string[]>(defaultValues);

  return (
    <div className="space-y-4">
      {urls.map((url, i) => (
        <input key={`${name}-${i}`} type="hidden" name={name} value={url} />
      ))}
      
      {urls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {urls.map((url, index) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200">
              <div className="absolute right-2 top-2 z-10">
                <button
                  type="button"
                  onClick={() => setUrls(urls.filter((_, i) => i !== index))}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 shadow-sm"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute left-2 top-2 z-10 rounded-md bg-slate-900/80 px-2 py-1 text-[10px] font-bold uppercase text-white backdrop-blur-sm shadow-sm">
                  Capa
                </div>
              )}
              {/* Utilizando tag img para contornar bloqueios do Next.js Image com domínios desconhecidos em preview */}
              <img src={url} alt={`Preview ${index}`} className="object-cover w-full h-full" />
            </div>
          ))}
        </div>
      )}

      {urls.length < 4 && (
        <div className="rounded-xl border border-slate-200 bg-white">
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              const newUrls = res.map((r) => r.url);
              setUrls((prev) => [...prev, ...newUrls].slice(0, 4));
            }}
            onUploadError={(error: Error) => {
              alert(`Erro no upload: ${error.message}`);
            }}
            config={{ mode: "auto" }}
            className="ut-label:text-blue-600 ut-button:bg-blue-600 ut-button:ut-readying:bg-blue-600/50 p-8"
          />
        </div>
      )}
    </div>
  );
}
