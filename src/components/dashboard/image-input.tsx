"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";

interface ImageInputProps {
  name: string;
  defaultValue?: string;
}

export function ImageInput({ name, defaultValue = "" }: ImageInputProps) {
  const [url, setUrl] = useState(defaultValue);

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <ImageUpload
        value={url}
        onChange={(newUrl) => setUrl(newUrl)}
        onRemove={() => setUrl("")}
      />
    </div>
  );
}
