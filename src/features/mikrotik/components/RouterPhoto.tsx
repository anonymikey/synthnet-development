import { ImageOff } from "lucide-react";
import Image from "next/image";
import type { MikrotikModel } from "@/features/mikrotik/mikrotik.types";
import { cn } from "@/lib/utils/cn";

type PhotoSize = "sm" | "md" | "lg";

const TILE: Record<PhotoSize, string> = {
  sm: "h-14 w-[4.5rem]",
  md: "h-32 w-full",
  lg: "h-56 w-full",
};

const PROVENANCE_NOTE = {
  provided: null,
  inferred: "Photo matched by appearance. Please confirm it is this model.",
  representative: "Reference photo of the same product family, not this exact model.",
} as const;

interface RouterPhotoProps {
  model: MikrotikModel;
  size?: PhotoSize;
  /** Show a one-line note when the photo is not a confirmed match. */
  showNote?: boolean;
}

/** Router photo on a light tile (the supplied photos have white backgrounds), or a placeholder. */
export function RouterPhoto({ model, size = "md", showNote = false }: RouterPhotoProps) {
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
            sizes={size === "sm" ? "72px" : "(min-width: 1024px) 320px, 90vw"}
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
