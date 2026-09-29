/* eslint-disable @next/next/no-img-element */
import { formatDeadline } from "@/lib/deadline";
import { APPLY_HREF, GENERATION } from "@/lib/site";
import Countdown from "./Countdown";
import { ArrowRight, ButtonLink, Sticker } from "./ui";

/**
 * The close: the traffic light the page has been following finally turns
 * green. Same sky, ground and cast as the hero, so the page ends where it
 * began — with the one thing left to do.
 */
export default function FinalCta() {
  return (
    <section id="ung-tuyen" className="relative isolate overflow-hidden pb-[34vh] pt-28 sm:pb-[40vh] lg:pb-[46vh] lg:pt-36">
      <img src="/kv/sky.webp" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <img
        src="/kv/cloud-4.webp"
        alt=""
        aria-hidden="true"
        className="anim-drift absolute -left-[6vw] top-[6%] -z-10 w-[40vw] opacity-90 lg:w-[26vw]"
      />
      <img
        src="/kv/cloud-6.webp"
        alt=""
        aria-hidden="true"
        className="anim-drift absolute -right-[8vw] top-[2%] -z-10 w-[44vw] lg:w-[28vw]"
        style={{ ["--dur" as string]: "32s" }}
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <img
          src="/kv/lamp-green.webp"
          alt=""
          aria-hidden="true"
          className="anim-bob w-24 drop-shadow-[0_0_28px_rgb(130_230_100/0.8)] sm:w-28"
        />
        <Sticker className="mt-6 text-[clamp(2.6rem,6.2vw,5.4rem)]">Đèn xanh rồi, đi thôi!</Sticker>
        <p className="mt-6 max-w-[46ch] text-pretty text-lg leading-relaxed text-plum-900/80">
          Cộng tác viên Thế hệ thứ {GENERATION} — Big Fat Family đang chờ em. Đơn đóng lúc{" "}
          <strong className="font-semibold text-pink-700">{formatDeadline()}</strong>.
        </p>
        <Countdown className="mt-8" />
        <ButtonLink href={APPLY_HREF} size="lg" className="mt-9">
          Ứng tuyển ngay
          <ArrowRight />
        </ButtonLink>
      </div>

      {/* The ground, and the cast seeing the visitor off. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10">
        <img src="/kv/ground.webp" alt="" className="block w-[160%] max-w-none -translate-x-[18%] lg:w-full lg:translate-x-0" />
        <img src="/kv/grass-b.webp" alt="" className="absolute -right-6 bottom-0 w-[30vw] max-w-[300px]" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[2vh] left-[3vw] w-[34vw] max-w-[380px] lg:left-[8vw] lg:w-[22vw]">
        <img src="/kv/bi.webp" alt="" className="anim-bob w-full" />
        <img src="/kv/bi-anger.webp" alt="" className="anim-pulse absolute left-[23%] top-[-7%] w-[27%]" />
      </div>
      <img
        src="/kv/sign-go.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[14vh] right-[4vw] w-[36vw] max-w-[420px] -rotate-6 drop-shadow-[0_18px_22px_rgb(111_10_61/0.3)] lg:bottom-[18vh] lg:right-[10vw] lg:w-[24vw]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[38vh] right-[5vw] hidden w-[10vw] max-w-[170px] lg:block">
        <img src="/kv/car.webp" alt="" className="anim-hop w-full" />
      </div>
    </section>
  );
}
