"use client";

import { useState, ChangeEvent } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api-client";
import axios from "axios";
import NextImage from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, onRemove, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Get presigned URL
      const { uploadUrl, objectUrl } = await apiPost<{ uploadUrl: string; objectUrl: string }>("/products/upload-url", {
        content_type: file.type,
      });

      // 2. Upload to S3
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      // 3. Callback with the final URL
      onChange(objectUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-24 h-24 border border-border rounded-md overflow-hidden group">
            <NextImage 
              src={value} 
              alt="Uploaded" 
              fill 
              className="object-cover" 
              unoptimized={true} // S3 URLs might not be in next.config domains yet
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/50">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground mt-1">Upload</span>
              </>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  );
}
