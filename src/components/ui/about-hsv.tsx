import Image from "next/image";
import {
  ImageAutoSlider,
  type AutoSliderImage,
} from "@/components/ui/image-auto-slider";

/* ----------------------------------------------------------------- tokens */
const TOKENS = {
  background: "#FEF6E6",
  heading: "#241F1C",
  body: "#5C4A3A",
} as const;

/**
 * TODO(photos): placeholders. Only 4 distinct photos exist, so the column
 * repeats them to make a set long enough that the loop is not obvious. All of
 * them are cropped to 16:9 by the slider.
 */
const PHOTOS = [
  "/gallery/p1.jpg",
  "/gallery/p2.jpg",
  "/gallery/p3.png",
  "/gallery/p4.webp",
];

const COLUMN: AutoSliderImage[] = Array.from({ length: 8 }, (_, i) => ({
  src: PHOTOS[i % PHOTOS.length],
  alt: "",
}));

export default function AboutHsv() {
  return (
    <section
      id="about"
      className="w-full"
      style={{ backgroundColor: TOKENS.background }}
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-16">
          {/* Copy, left */}
          <div className="max-w-xl">
            <Image
              src="/mascot-cool.png"
              alt=""
              aria-hidden="true"
              width={416}
              height={396}
              className="mb-4 h-20 w-auto select-none sm:h-24"
            />

            <h2
              className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
              style={{ color: TOKENS.heading }}
            >
              HỘI SINH VIÊN LÀ GÌ?
            </h2>

            <div
              className="mt-8 space-y-5 text-base leading-relaxed sm:text-lg"
              style={{ color: TOKENS.body }}
            >
              <p>
                Hội Sinh viên trường Đại học Ngoại thương được thành lập
                <br />
                ngày 15 tháng 03 năm 2003, là một tổ chức Chính trị - Xã hội
                <br />
                trực thuộc Hội Sinh viên Việt Nam.
              </p>
              <p>
                Hội Sinh viên trường Đại học Ngoại thương là tổ chức
                <br />
                đại diện cho ngôi nhà chung BFF &quot;Big Fat Family&quot;
                <br />
                với 3 Ban chức năng và 2 Câu lạc bộ trực thuộc.
              </p>
            </div>
          </div>

          {/* The endless column, right. On lg the column takes its height from the copy beside it rather
              than a figure of its own: the grid stretches this item to the row,
              the row is as tall as the text, and the absolutely-positioned
              inner box turns that into the definite height the slider needs.
              Left on a fixed height it stood a couple of hundred pixels taller
              than the words it sits next to. */}
          <div className="relative h-[22rem] w-full sm:h-[26rem] lg:h-auto">
            {/* Top edge stays level with the copy; the bottom runs 4rem past
                it, so the column reads as a strip carrying on down the page
                rather than a box that stops exactly where the words do. */}
            <div className="absolute inset-x-0 bottom-0 top-0 lg:-bottom-16">
              <ImageAutoSlider images={COLUMN} durationSec={34} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
