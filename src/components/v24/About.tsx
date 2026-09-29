/* eslint-disable @next/next/no-img-element */
import { ImageAutoSlider, type AutoSliderImage } from "@/components/ui/image-auto-slider";
import { Sticker } from "./ui";

/** TODO(photos): real BFF photos, 16:9. These cycle last year's placeholders. */
const PHOTOS = ["/gallery/p1.jpg", "/gallery/p2.jpg", "/gallery/p3.png", "/gallery/p4.webp"];
const COLUMN: AutoSliderImage[] = Array.from({ length: 8 }, (_, i) => ({
  src: PHOTOS[i % PHOTOS.length],
  alt: "",
}));

/** Last year's own office chatter — the family, in its own words. */
const BUBBLES = [
  { text: "Ai đi ăn trưa không?", cls: "left-[-6%] top-[14%] -rotate-3", tone: "bg-white text-plum-900" },
  { text: "Boardgame đê cả nhà", cls: "right-[-8%] top-[42%] rotate-2", tone: "bg-pink-600 text-white" },
  { text: "Ai xuống văn phòng không?", cls: "left-[-10%] bottom-[16%] rotate-1", tone: "bg-butter text-plum-900" },
];

export default function About() {
  return (
    <section id="gioi-thieu" className="relative bg-cream pb-28 pt-20 lg:pb-36 lg:pt-28">
      {/* The ground rolls into the page: one soft cream hill over the hero's grass. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 -top-[24px] h-[26px] w-full text-cream"
      >
        <path d="M0 80V56Q720 -8 1440 56V80H0Z" fill="currentColor" />
      </svg>

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:px-10">
        <div>
          {/* Always two lines, and "Hội Sinh viên" never split across them. */}
          <Sticker tone="ink" className="whitespace-pre-line text-[clamp(2.4rem,5vw,4.4rem)]">
            {"Hội\u00A0Sinh\u00A0viên\nlà gì?"}
          </Sticker>

          <div className="mt-8 max-w-[52ch] space-y-5 text-[1.05rem] leading-[1.75] text-plum-900/85">
            <p>
              Hội Sinh viên trường Đại học Ngoại thương được thành lập ngày 15 tháng 03
              năm 2003, là một tổ chức Chính trị - Xã hội trực thuộc Hội Sinh viên Việt
              Nam.
            </p>
            <p>
              Hội Sinh viên trường Đại học Ngoại thương là tổ chức đại diện cho ngôi nhà
              chung <strong className="font-semibold text-pink-600">BFF – Big Fat Family</strong>{" "}
              với 3 Ban và 2 Câu lạc bộ trực thuộc.
            </p>
          </div>

          <p className="mt-10 font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight text-plum-900">
            Văn phòng là nhà,
            <br />
            <span className="text-pink-600">BFF là gia đình.</span>
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="relative h-[26rem] overflow-hidden rounded-[32px] bg-blush p-3 shadow-[var(--shadow-lg)] ring-1 ring-white sm:h-[32rem]">
            <ImageAutoSlider images={COLUMN} durationSec={34} />
          </div>
          {BUBBLES.map((b) => (
            <p
              key={b.text}
              className={`absolute z-10 hidden rounded-[18px] px-4 py-2.5 text-sm font-semibold shadow-[var(--shadow-md)] sm:block ${b.cls} ${b.tone}`}
            >
              {b.text}
            </p>
          ))}
          <img
            src="/kv/sign-bff.webp"
            alt=""
            aria-hidden="true"
            className="absolute -bottom-10 -right-6 w-[38%] rotate-[8deg] drop-shadow-[0_14px_18px_rgb(111_10_61/0.25)]"
          />
        </div>
      </div>
    </section>
  );
}
