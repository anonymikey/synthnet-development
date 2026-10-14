import { ImageOff } from "lucide-react";
import Image from "next/image";
import type { OmadaApModel, OmadaImage } from "@/features/omada/omada.types";
import { cn } from "@/lib/utils/cn";

type PhotoSize = "sm" | "md" | "lg";

const TILE: Record<PhotoSize, string> = {
  sm: "h-14 w-14",
  md: "h-40 w-full",
  lg: "h-64 w-full",
};

const PROVENANCE_NOTE = {
  provided: null,
  inferred: "Photo matched by appearance. Please confirm it is this model.",
  representative: "Photo of a model with the same enclosure, not this exact model.",
} as const;

interface ApPhotoProps {
  model: OmadaApModel;
  size?: PhotoSize;
  showNote?: boolean;
}

/** Product photo on a light tile (the supplied photos have white backgrounds), or a placeholder. */
export function ApPhoto({ model, size = "md", showNote = false }: ApPhotoProps) {
  const image = model.hardwareImage;
  const note = image ? PROVENANCE_NOTE[image.provenance] : null;

  return (
    <div>
      <div className={cn("relative flex items-center justify-center overflow-hidden rounded-md bg-white", TILE[size])}>
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={size === "sm" ? "56px" : "(min-width: 1024px) 320px, 90vw"}
            className="h-full w-full object-contain p-1.5"
          />
        ) : (
          <div role="img" aria-label={`No photo yet for ${model.displayName}`} className="flex flex-col items-center gap-1 text-neutral-500">
            <ImageOff aria-hidden="true" className="size-5" />
            {size !== "sm" ? <span className="text-xs">Photo not provided yet</span> : null}
          </div>
        )}
      </div>
      {showNote && note ? <p className="mt-1.5 text-xs text-warning">{note}</p> : null}
    </div>
  );
}

/** Extra photos (installation and side views) shown as a thumbnail row. */
export function ApGallery({ images }: { images: readonly OmadaImage[] }) {
  if (images.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-3">
      {images.map((image) => (
        <li key={image.src}>
          <div className="relative aspect-square overflow-hidden rounded-md bg-white">
            <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="160px" className="h-full w-full object-cover" />
          </div>
          <p className="mt-1 text-xs text-muted">
            {image.caption ?? "Photo"}
            {image.provenance !== "provided" ? " · unconfirmed" : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
