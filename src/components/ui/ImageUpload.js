"use client";

import { useState } from "react";
import { uploadToCloudinary } from "@/lib/upload";

export default function ImageUpload({ images, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadToCloudinary(file))
      );
      onChange([...images, ...uploadedUrls]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Preview */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {images.map((url, i) => (
            <div key={i} className="relative w-20 h-20">
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover rounded-xl border"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition ${
        uploading
          ? "border-blue-300 bg-blue-50"
          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
      }`}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <span className="text-2xl">{uploading ? "⏳" : "📸"}</span>
        <div>
          <p className="text-sm font-medium text-gray-700">
            {uploading ? "Upload ho raha hai..." : "Photos Select Karo"}
          </p>
          <p className="text-xs text-gray-400">
            Multiple photos ek saath select kar sakte ho
          </p>
        </div>
      </label>
    </div>
  );
}