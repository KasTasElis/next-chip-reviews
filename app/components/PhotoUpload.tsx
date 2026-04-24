"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import imageCompression from "browser-image-compression";
import clsx from "clsx";

interface PhotoUploadProps {
  label?: string;
  optional?: boolean;
  initialUrl?: string | null;
  onChange: (file: File | null) => void;
  error?: string;
  hint?: string;
  aspect?: number;
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error("Canvas is empty")); return; }
      resolve(new File([blob], "photo.webp", { type: "image/webp" }));
    }, "image/webp");
  });
}

export default function PhotoUpload({
  label = "Photo",
  optional,
  initialUrl,
  onChange,
  error,
  hint = "PNG, JPG, WebP up to 5MB",
  aspect = 1,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl ?? null);
  const [compressionError, setCompressionError] = useState<string | null>(null);
  const [compressionProgress, setCompressionProgress] = useState<number | null>(null);

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (cropSrc) {
      dialogRef.current?.showModal();
    }
  }, [cropSrc]);

  function handleClear() {
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropSrc(URL.createObjectURL(file));
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    if (inputRef.current) inputRef.current.value = "";
    dialogRef.current?.close();
  }

  async function handleCropConfirm() {
    if (!cropSrc || !croppedAreaPixels) return;
    dialogRef.current?.close();

    try {
      setCompressionError(null);
      setCompressionProgress(0);
      const cropped = await getCroppedImg(cropSrc, croppedAreaPixels);
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);

      const compressedFile = await imageCompression(cropped, {
        fileType: "image/webp",
        maxWidthOrHeight: 1080,
        maxSizeMB: 5,
        onProgress: setCompressionProgress,
      });
      setCompressionProgress(null);
      setPreviewUrl(URL.createObjectURL(compressedFile));
      onChange(compressedFile);
    } catch {
      setCompressionProgress(null);
      setCompressionError("Failed to process image. Please try another file.");
    }
  }

  return (
    <>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">
          {label}
          {optional && (
            <span className="text-base-content/40 font-normal"> (optional)</span>
          )}
        </legend>
        <label
          className={clsx(
            "relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-box transition-colors overflow-hidden",
            error ? "border-error" : "border-base-300",
            previewUrl ? "h-auto p-2" : "h-40",
            compressionProgress !== null
              ? "pointer-events-none opacity-75"
              : "cursor-pointer hover:border-primary hover:bg-base-200",
          )}
        >
          {previewUrl ? (
            <div className="flex flex-col items-center gap-2 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={`${label} preview`}
                className="max-h-48 max-w-full object-contain rounded"
              />
              <span className="text-md text-base-content/50">
                Click to change
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-base-content/50">
              <UploadIcon />
              <span className="text-md">
                Drop photo here or <span className="text-primary">browse</span>
              </span>
              <span>{hint}</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          {compressionProgress !== null && (
            <progress
              className="progress progress-primary w-full absolute bottom-0 left-0 h-1 rounded-none"
              value={compressionProgress}
              max={100}
            />
          )}
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={handleClear}
            className="text-error text-md hover:underline cursor-pointer mt-1 self-start"
          >
            Remove
          </button>
        )}
        {(error || compressionError) && (
          <p className="text-error text-md mt-1">{error ?? compressionError}</p>
        )}
      </fieldset>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-lg">
          <h3 className="font-bold text-lg mb-4">Crop photo</h3>
          <div className="relative w-full h-72 bg-base-300 rounded-box overflow-hidden">
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="range range-primary range-sm mt-4 w-full"
          />
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={handleCropCancel}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleCropConfirm}>
              Confirm
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={handleCropCancel} />
      </dialog>
    </>
  );
}
