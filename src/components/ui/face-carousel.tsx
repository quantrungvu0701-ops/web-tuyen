"use client";

import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery";

/**
 * Wraps CircularGallery so PoleGallerySection keeps a stable `data` prop and
 * the ring stays swappable.
 *
 * TODO(content): photos are placeholders pulled from assets/source. Replace
 * `items` per face with the real gallery photos and captions.
 */

export type FaceData = {
  id: number;
  title: string;
  items: GalleryItem[];
};

export default function FaceCarousel({ data }: { data: FaceData }) {
  return (
    <div className="w-full">
      <h3 className="mb-2 text-2xl font-bold tracking-tight text-[#241F1C]">
        {data.title}
      </h3>
      <p className="mb-4 text-sm text-[#6b5a44]">
        Kéo để xoay — hoặc để tự xoay.
      </p>
      <div className="h-[320px] w-full">
        <CircularGallery items={data.items} />
      </div>
    </div>
  );
}
