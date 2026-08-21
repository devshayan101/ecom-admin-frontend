"use client";

import { useState, ChangeEvent } from "react";
import { Upload, X, Loader2, Video } from "lucide-react";
import { apiPost } from "@/lib/api-client";
import axios from "axios";
import NextImage from "next/image";

interface MediaUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  label?: string;
  mediaType?: "image" | "video" | "any";
  endpoint?: string;
}

export default function MediaUpload({
  value,
  onChange,
  onRemove,
  label,
  mediaType = "any",
  endpoint = "/settings/content/upload-url",
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      let uploadUrl: string;
      let objectUrl: string;

      try {
        const res = await apiPost<{ uploadUrl: string; objectUrl: string }>(endpoint, {
          content_type: file.type,
        });
        uploadUrl = res.uploadUrl;
        objectUrl = res.objectUrl;
      } catch (err) {
        const res = await apiPost<{ uploadUrl: string; objectUrl: string }>("/products/upload-url", {
          content_type: file.type,
        });
        uploadUrl = res.uploadUrl;
        objectUrl = res.objectUrl;
      }

      // Upload to S3 / Object storage
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      // Callback with public CloudFront URL
      onChange(objectUrl);
    } catch (error) {
      console.error("Media upload failed:", error);
      alert("Failed to upload media file. Please check backend configuration.");
    } finally {
      setUploading(false);
    }
  };

  const acceptType =
    mediaType === "video"
      ? "video/*"
      : mediaType === "image"
      ? "image/*"
      : "image/*,video/*";

  const isVideoUrl = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || mediaType === "video";
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-36 h-24 border border-border rounded-md overflow-hidden bg-black group flex items-center justify-center">
            {isVideoUrl(value) ? (
              <video src={value} className="w-full h-full object-cover" muted loop autoPlay playsInline />
            ) : (
              <NextImage
                src={value}
                alt="Uploaded media"
                fill
                className="object-cover"
                unoptimized={true}
              />
            )}
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-36 h-24 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/50 p-2 text-center">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                {mediaType === "video" ? (
                  <Video className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
                <span className="text-[10px] text-muted-foreground mt-1 font-medium">
                  Upload {mediaType === "video" ? "Video" : mediaType === "image" ? "Image" : "Media"}
                </span>
              </>
            )}
            <input type="file" className="hidden" accept={acceptType} onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  );
}
