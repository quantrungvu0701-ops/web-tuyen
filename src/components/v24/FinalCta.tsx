/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { APPLY_HREF } from "@/lib/site";
import Countdown from "./Countdown";
import { ArrowRight, ButtonLink, Sticker } from "./ui";

/** Cover boxes (of 9000×3000), as in the hero. */
type Box = readonly [number, number, number, number];
const CAR: Box = [7540, 750, 8310, 1350];
const within = (b: Box): CSSProperties => ({
  left: `${(b[0] / 9000) * 100}%`,
  top: `${(b[1] / 3000) * 100}%`,
  width: `${((b[2] - b[0]) / 9000) * 100}%`,
});

/**
 * The close: the traffic light the page has been following finally turns
 * green. Same sky, ground and cast as the hero, so the page ends where it
 * began — with the one thing left to do.
 */
export default function FinalCta() {
  return (
    <section id="ung-tuyen" className="relative isolate overflow-x-clip pb-[150px] pt-10 lg:pb-[6.6vw] lg:pt-12">
      {/* The cover again, both mountains and their own clouds, standing on the
          section's foot; its top fades into the page's sky. */}
      <div aria-hidden="true" className="final-scene pointer-events-none absolute bottom-0 -z-10">
        <img src="/kv/cover-plate-final.webp" alt="" className="final-plate absolute inset-0 h-full w-full" />
        <div className="absolute" style={within(CAR)}>
          <img src="/kv/car.webp" alt="" className="anim-hop w-full" />
        </div>
      </div>

      {/* The top of the sky: the cover's paraglider and two of its small
          clouds, kept to the sides so the lettering has the middle. */}
      <div aria-hidden="true" className="pointer-events-none absolute right-[4vw] top-12 -z-10 w-[24vw] max-w-[170px] lg:right-[6vw] lg:-top-[60px] lg:w-[11vw]">
        <img src="/kv/paraglider.webp" alt="" className="anim-glide w-full" />
      </div>
      <img
        src="/kv/cloud-a.webp"
        alt=""
        aria-hidden="true"
        className="anim-drift pointer-events-none absolute left-[7vw] top-16 -z-10 hidden w-[12vw] max-w-[190px] lg:block"
        style={{ ["--dur" as string]: "24s" }}
      />
      <img
        src="/kv/cloud-b.webp"
        alt=""
        aria-hidden="true"
        className="anim-drift pointer-events-none absolute left-[20vw] top-[190px] -z-10 hidden w-[8vw] max-w-[130px] lg:block"
        style={{ ["--dur" as string]: "30s" }}
      />

      {/* Bi, seeing the visitor off at the size the page used before. */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[2vh] left-[3vw] -z-10 w-[30.6vw] max-w-[342px] lg:w-[19.8vw]">
        <img src="/kv/bi.webp" alt="" className="anim-bob w-full" />
        <img src="/kv/bi-anger.webp" alt="" className="anim-pulse absolute left-[23%] top-[-5%] w-[27%]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <img
          src="/kv/lamp-green.webp"
          alt=""
          aria-hidden="true"
          className="anim-bob w-24 drop-shadow-[0_0_28px_rgb(130_230_100/0.8)] sm:w-28"
        />
        <Sticker className="mt-6 text-[clamp(2.6rem,6.2vw,5.4rem)] sticker-one-line">Đèn xanh rồi, đi thôi!</Sticker>
        <p className="mt-6 max-w-[46ch] text-pretty text-lg lg:max-w-none lg:whitespace-nowrap leading-relaxed text-plum-900/80">
          Cơ hội trở thành Cộng tác viên Hội Sinh viên trường Đại học Ngoại thương đang chờ đón em!
        </p>
        <p className="mt-8 font-semibold text-pink-700">Hạn điền đơn: 23h59, thứ Ba ngày 20/10/2026</p>
        <Countdown className="mt-3 [zoom:1.2]" />
        <ButtonLink href={APPLY_HREF} size="lg" className="mt-9">
          Điền đơn ngay
          <ArrowRight />
        </ButtonLink>
      </div>

    </section>
  );
}
