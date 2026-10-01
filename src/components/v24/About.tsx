/* eslint-disable @next/next/no-img-element */
import { ImageAutoSlider, type AutoSliderItem } from "@/components/ui/image-auto-slider";
import Decor from "./Decor";
import { Sticker } from "./ui";

/**
 * The column: a photo, then a line of office chatter, three times over — the
 * family, in its own words, drifting up with the pictures.
 * Photos: the family at the office (BFF1–3).
 */
const COLUMN: AutoSliderItem[] = [
  // BFF3 leads so BFF1, second in the column, opens in the frame's middle.
  { src: "/about/bff-3.webp", alt: "" },
  { bubble: "Ai có 3k gửi xe không?", side: "left", tone: "bg-butter text-plum-900" },
  { src: "/about/bff-1.webp", alt: "" },
  { bubble: "Ai đi ăn trưa không?", side: "right", tone: "bg-white text-plum-900" },
  { src: "/about/bff-2-v2.webp", alt: "" },
  { bubble: "Ai xuống văn phòng không?", side: "left", tone: "bg-pink-600 text-white" },
];

export default function About() {
  return (
    <section id="gioi-thieu" className="relative pb-28 pt-20 lg:pb-36 lg:pt-28">
      <Decor src="/kv/cloud-a.webp" className="right-[5%] top-10 hidden w-40 lg:block" dur="24s" />
      <Decor src="/kv/paraglider.webp" anim="glide" className="bottom-6 left-[4%] hidden w-24 lg:block xl:w-28" />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:px-10">
        <div>
          {/* Always two lines, and "Hội Sinh viên" never split across them. */}
          <Sticker tone="ink" className="whitespace-pre-line text-[clamp(2.4rem,5vw,4.4rem)]">
            {"Hội\u00A0Sinh\u00A0viên\nlà gì?"}
          </Sticker>

          <div className="mt-8 max-w-[52ch] space-y-5 text-justify text-[1.05rem] leading-[1.75] text-plum-900/85">
            <p>
              Hội Sinh viên trường Đại học Ngoại thương được thành lập ngày 15 tháng 03
              năm 2003, là một tổ chức Chính trị - Xã hội trực thuộc Hội Sinh viên Việt
              Nam.
            </p>
            <p>
              Hội Sinh viên trường Đại học Ngoại thương là tổ chức đại diện cho ngôi nhà
              chung <strong className="font-semibold text-pink-600">BFF – Big Fat Family</strong>{" "}
              với 3 Ban chức năng và 2 Câu lạc bộ trực thuộc.
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
            {/* Phones keep the bubbles in the column: there is no room for
                them to overhang the frame. */}
            <ImageAutoSlider images={COLUMN} durationSec={26} className="sm:hidden" />
            <ImageAutoSlider images={COLUMN} durationSec={26} layer="photos" className="hidden sm:block" />
          </div>
          {/* The chat bubbles: the same column on a layer above the frame,
              scrolling in step with the photos, so each one can pop out past
              the frame's edge instead of reading as a caption inside it. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-10 hidden h-[calc(26rem-24px)] sm:block sm:h-[calc(32rem-24px)]"
            style={{ top: 12, left: -58, right: -58 }}
          >
            <ImageAutoSlider images={COLUMN} durationSec={26} layer="bubbles" className="px-[70px] pb-0" />
          </div>
          <img
            src="/kv/sign-bff.webp"
            alt=""
            aria-hidden="true"
            className="absolute -bottom-10 -right-6 z-20 w-[38%] -rotate-[36deg] drop-shadow-[0_14px_18px_rgb(111_10_61/0.25)]"
          />
        </div>
      </div>
    </section>
  );
}
