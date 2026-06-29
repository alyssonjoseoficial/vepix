"use client";

import { useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, Trash, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
}: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = (result: any) => {
    onChange(result.info.secure_url);
  };

  if (!isMounted) return null;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value ? (
          <div className="relative h-[200px] w-[200px] overflow-hidden rounded-xl border border-slate-200">
            <div className="absolute right-2 top-2 z-10">
              <Button type="button" onClick={() => onRemove()} variant="destructive" size="icon" className="h-8 w-8">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <img className="object-cover w-full h-full" alt="Image preview" src={value} />
          </div>
        ) : null}
      </div>

      {!cloudName ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            <strong>Modo de Teste:</strong> Cloudinary não configurado. Cole a URL pública de uma imagem abaixo.
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <LinkIcon className="h-4 w-4" />
              </div>
              <Input 
                type="url" 
                placeholder="https://exemplo.com/imagem.jpg" 
                className="pl-10"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
              />
            </div>
            {value && (
              <Button type="button" onClick={() => onRemove()} variant="secondary">
                Limpar
              </Button>
            )}
          </div>
        </div>
      ) : (
        <CldUploadWidget onSuccess={onUpload} uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}>
          {({ open }) => {
            const onClick = () => {
              open();
            };
            return (
              <Button type="button" disabled={disabled} variant="secondary" onClick={onClick}>
                <ImagePlus className="mr-2 h-4 w-4" />
                Fazer upload de imagem
              </Button>
            );
          }}
        </CldUploadWidget>
      )}
    </div>
  );
}
