"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import GallerySlider, {
  IMAGES_PER_SLIDE,
  type GallerySlide,
} from "@/components/ui/gallery-slider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ------------------------------------------------------------------ design
 * One sign post stands in the left rail. Four blades are bracketed round it
 * at 90 degrees. Scrolling pins the section and turns the cluster:
 * whichever category is active has its sign swung round to point right and be
 * read, while the other three end up edge-on or pointing left off the screen.
 * The gallery beside it cross-fades in step with the turn.
 *
 * Styled as city signage: a galvanised steel post carrying green
 * street-name blades, per the reference. Drawn flat and illustrative rather
 * than photo-real, because the rest of this site is flat pastel shapes.
 *
 * The post itself does not turn, only the blades do, on their mounting bands.
 * A flat post rotated 45 degrees collapses to a line, so a spinning post would
 * read as a glitch. Blades on a swivel read as a mechanism.
 */

const N = 4;

/** Fraction of each step spent resting on a category before the turn starts. */
const HOLD = 0.42;

/** The pinned layout needs the rail AND the 737px gallery side by side. */
const PINNED_MQ = "(min-width: 1280px)";

/** The site's fixed nav sits over the top of the pinned stage. */
const NAV_CLEARANCE = 72;

/** Breathing room above and below the assembly once it is scaled to fit. */
const STAGE_PAD = 40;

const GEO = {
  /** Post centre. Signs are mounted centred ON the post, so this has to be
   *  at least half the widest sign clear of x = 0 or the active sign's own
   *  text runs off the left edge. */
  postCenter: 180,
  /** A city sign post is a slim steel tube, not a timber baulk. */
  postWidth: 30,
  railWidth: 350,
  /** Gallery box cap; also what keeps a gutter at the window edge. */
  galleryMaxWidth: 1020,
  /** Vertical air between two signs on the post. */
  signGap: 12,
} as const;

/**
 * The four signs, in the reference photo's own order down the pole: two green
 * street-name blades, a red octagon, an amber placard.
 *
 * Each carries its own box because the shapes demand it — an octagon has to be
 * square to read as one, while a street blade is long and thin. One shared
 * plate size could only ever be right for one of them.
 */
type SignStyle = {
  w: number;
  h: number;
  octagon?: true;
  face: string;
  faceDark: string;
  keyline: string;
  ink: string;
  fontSize: number;
  /** Keyline inset; the octagon needs a wider one to look evenly bordered. */
  pad: number;
};

const SIGNS: SignStyle[] = [
  // "Brown St" — the long blade.
  {
    w: 300,
    h: 72,
    face: "#15683C",
    faceDark: "#0E4A2A",
    keyline: "#FFFFFF",
    ink: "#FFFFFF",
    fontSize: 17,
    pad: 7,
  },
  // "Florence St" — the shorter blade crossed behind it.
  {
    w: 264,
    h: 68,
    face: "#15683C",
    faceDark: "#0E4A2A",
    keyline: "#FFFFFF",
    ink: "#FFFFFF",
    fontSize: 15,
    pad: 7,
  },
  // STOP.
  {
    w: 190,
    h: 190,
    octagon: true,
    face: "#BE1A20",
    faceDark: "#8E1216",
    keyline: "#FFFFFF",
    ink: "#FFFFFF",
    fontSize: 15,
    pad: 11,
  },
  // "CROSS TRAFFIC DOES NOT STOP" — amber, and the only one lettered in black.
  {
    w: 230,
    h: 80,
    face: "#F2BE12",
    faceDark: "#D9A600",
    keyline: "#1A1A1A",
    ink: "#141414",
    fontSize: 15,
    pad: 7,
  },
];

/** Signs stack down the post, so each one's top depends on those above it. */
const SIGN_TOPS = SIGNS.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SIGNS[i - 1].h + GEO.signGap);
  return acc;
}, []);

const CLUSTER_H =
  SIGN_TOPS[SIGN_TOPS.length - 1] + SIGNS[SIGNS.length - 1].h;

const TOKENS = {
  background: "#FEF6E6",
  heading: "#241F1C",
  /* Galvanised steel, lit from the left. */
  steelHi: "#D9DEE2",
  steel: "#AEB4B9",
  steelMid: "#8B9197",
  steelDark: "#5A5F64",
  /* US highway green — the street-name blade in the reference. */
  signGreen: "#12693A",
  signGreenDark: "#0C4A29",
  signInk: "#FFFFFF",
  bolt: "#4C5257",
} as const;

/**
 * TODO(photos): placeholder photos. Only 4 distinct images exist in
 * assets/source and they are all landscape, so they are cropped to 16:9 and
 * cycled. Every slide needs 3 of them.
 */
const PHOTOS = [
  "/gallery/p1.jpg",
  "/gallery/p2.jpg",
  "/gallery/p3.png",
  "/gallery/p4.webp",
];

const gallerySlides = (label: string, count: number): GallerySlide[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${label}-${i + 1}`,
    title: `${label} ${i + 1}`,
    description:
      "Placeholder — mô tả hoạt động sẽ được thay thế khi có nội dung thật.",
    images: Array.from(
      { length: IMAGES_PER_SLIDE },
      (_, k) => PHOTOS[(i * IMAGES_PER_SLIDE + k) % PHOTOS.length],
    ),
  }));

type Category = { id: number; title: string; slides: GallerySlide[] };

/** Slide counts are the real ones: 4, 4, 2, 3. */
const CATEGORIES: Category[] = [
  {
    id: 0,
    title: "Chương trình\nchính trị",
    slides: gallerySlides("Hoạt động", 4),
  },
  {
    id: 1,
    title: "Chương trình\nsân khấu",
    slides: gallerySlides("Sự kiện", 4),
  },
  {
    id: 2,
    title: "Chương trình\ntình nguyện",
    slides: gallerySlides("Hình ảnh", 2),
  },
  {
    id: 3,
    title: "Chương trình\nnội bộ",
    slides: gallerySlides("Kỷ niệm", 3),
  },
];

/* ------------------------------------------------------------------- maths */

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * Scroll progress (0..1) to a continuous category position (0..N-1).
 * Each step rests on its category for HOLD of the step and then eases across,
 * so the pole is still while you read and only turns while you move on.
 */
function positionAt(progress: number) {
  const u = progress * (N - 1);
  const i = Math.min(Math.floor(u), N - 2);
  const frac = u - i;
  return i + easeInOut(clamp01((frac - HOLD) / (1 - HOLD)));
}

/* --------------------------------------------------------------- component */

export default function PoleGallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const armsRef = useRef<HTMLDivElement>(null);
  const galleryRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Below xl there is no room for rail and gallery side by side, and a
      // reduced-motion reader should not be handed a scrub at all. Both fall
      // through to the stacked layout, which needs no JS.
      mm.add(
        { pinned: `${PINNED_MQ} and (prefers-reduced-motion: no-preference)` },
        (ctx) => {
          if (!ctx.conditions?.pinned) return;

          const apply = (p: number) => {
            if (armsRef.current) {
              armsRef.current.style.transform = `rotateY(${-p * 90}deg)`;
            }
            galleryRefs.current.forEach((el, k) => {
              if (!el) return;
              // Each gallery stays solid while its sign faces us and dissolves
              // across the turn. The opacity is the square root of the fade so
              // the two halves of a cross-dissolve sum to roughly constant
              // brightness: fading both linearly leaves them at 0.3 each
              // mid-turn, which reads as the section briefly going blank.
              const s = smoothstep(clamp01(1 - Math.abs(p - k)));
              el.style.opacity = String(Math.sqrt(s));
              el.style.transform = `translateY(${(1 - s) * 12}px) scale(${
                0.985 + 0.015 * s
              })`;
              el.style.visibility = s <= 0.001 ? "hidden" : "visible";
              el.style.pointerEvents = s > 0.5 ? "auto" : "none";
            });
          };

          apply(0);

          // The stage is exactly one viewport tall and cannot scroll, so any
          // content taller than it is simply cut away by the section's
          // overflow-hidden — silently, at BOTH ends, because the stage
          // centres its content. That is what buried the heading and ate the
          // gallery's dots on shorter windows. Scale the whole assembly down
          // to whatever room there actually is instead.
          //
          // offsetHeight is the untransformed layout height, so it can be read
          // back without first undoing the scale we are about to apply.
          const fit = () => {
            const el = fitRef.current;
            if (!el) return;
            const natural = el.offsetHeight;
            if (!natural) return;
            const room = window.innerHeight - NAV_CLEARANCE - STAGE_PAD;
            const scale = Math.min(1, room / natural);
            el.style.transform = scale < 1 ? `scale(${scale})` : "";
          };

          fit();
          window.addEventListener("resize", fit);
          // The photo strip sizes itself from its own measured width, so the
          // assembly's height only settles a frame or two after mount.
          const ro = new ResizeObserver(fit);
          if (fitRef.current) ro.observe(fitRef.current);

          // ScrollTrigger's pin works inside this page's ScrollSmoother;
          // position: sticky does not, because the smoother transforms the
          // whole content wrapper.
          const st = ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top top",
            end: () => "+=" + window.innerHeight * (N - 1) * 0.9,
            pin: stageRef.current,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => apply(positionAt(self.progress)),
          });

          return () => {
            st.kill();
            window.removeEventListener("resize", fit);
            ro.disconnect();
          };
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="su-kien"
      // overflow-hidden is what cuts the left-pointing signs off at the edge.
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: TOKENS.background }}
    >
      <div
        ref={stageRef}
        // pt on xl keeps the whole assembly clear of the fixed nav, which
        // overlays the top of the stage while it is pinned.
        className="flex w-full flex-col py-16 xl:h-screen xl:justify-center xl:py-0 xl:pt-[72px]"
      >
        {/* Scaled as one piece so the heading, the post and the dots keep
            their relationship to each other on any window height. */}
        <div ref={fitRef} className="w-full origin-center will-change-transform">
          <h2
            className="mb-8 px-6 text-center text-3xl font-bold uppercase tracking-wide sm:text-4xl xl:mb-16"
            style={{ color: TOKENS.heading }}
          >
            Các sự kiện chính
          </h2>

          {/* -------------------------------------------- pinned, xl and up */}
          <div className="relative hidden xl:flex xl:items-center">
          <div
            className="relative z-10 shrink-0 self-stretch"
            style={{
              width: GEO.railWidth,
              perspective: "1100px",
              perspectiveOrigin: `${GEO.postCenter}px 50%`,
            }}
          >
            <Post />
            <Collar />
            <div
              ref={armsRef}
              className="absolute"
              style={{
                left: GEO.postCenter,
                top: "50%",
                width: 0,
                height: 0,
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
            >
              {CATEGORIES.map((c, k) => (
                <SignArm key={c.id} title={c.title} index={k} />
              ))}
            </div>
          </div>

          {/* The four galleries share one box and cross-fade in place. */}
          <div className="relative min-w-0 flex-1 pr-8">
            {CATEGORIES.map((c, k) => (
              <div
                key={c.id}
                ref={(el) => {
                  galleryRefs.current[k] = el;
                }}
                className={k === 0 ? "" : "absolute inset-0"}
                style={{
                  opacity: k === 0 ? 1 : 0,
                  willChange: "opacity, transform",
                }}
                aria-hidden={k === 0 ? undefined : true}
              >
                {/* Capped well inside the rail's leftover width so the box
                    keeps a gutter from the window edge instead of bleeding
                    off it. The photo itself is capped separately, so this
                    only decides how much of the neighbours shows. */}
                <div
                  className="mx-auto"
                  style={{ maxWidth: GEO.galleryMaxWidth }}
                >
                  <GallerySlider
                    slides={c.slides}
                    label={c.title.replace("\n", " ")}
                  />
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* ------------------------------- stacked fallback, below xl and RM */}
        <div className="xl:hidden">
          {CATEGORIES.map((c, k) => (
            <div key={c.id} className={k > 0 ? "mt-20" : ""}>
              <div
                className="relative mb-8"
                style={{ height: SIGNS[k].h }}
              >
                <StaticPostStub />
                {/* SignFace is inset-0, so this wrapper carries the box. */}
                <div
                  className="absolute top-0"
                  style={{
                    left: GEO.postCenter - SIGNS[k].w / 2,
                    width: SIGNS[k].w,
                    height: SIGNS[k].h,
                  }}
                >
                  <SignFace style={SIGNS[k]} title={c.title} />
                </div>
              </div>
              <div className="px-6">
                <GallerySlider
                  slides={c.slides}
                  label={c.title.replace("\n", " ")}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ pieces */

/**
 * A galvanised steel tube, lit from the left. The hard stops rather than a
 * smooth blend are what make it read as a cylinder in a flat style: a soft
 * gradient just looks like a blurred rectangle at this width.
 */
const POST_FILL = `linear-gradient(90deg, ${TOKENS.steelDark} 0 3px, ${TOKENS.steelHi} 3px 34%, ${TOKENS.steel} 34% 62%, ${TOKENS.steelMid} 62% 86%, ${TOKENS.steelDark} 86% 100%)`;

/** The standing post, with the pressed cap a street pole is finished with. */
function Post() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-y-0"
      style={{
        left: GEO.postCenter - GEO.postWidth / 2,
        width: GEO.postWidth,
        background: POST_FILL,
      }}
    >
      <div
        className="absolute -left-[3px] -right-[3px] top-0 h-2.5 rounded-t-full"
        style={{
          background: `linear-gradient(90deg, ${TOKENS.steelMid}, ${TOKENS.steelHi} 45%, ${TOKENS.steelDark})`,
        }}
      />
    </div>
  );
}

/** The mounting bands the blades are bracketed to. */
function Collar() {
  const height = CLUSTER_H + 24;
  const band = `linear-gradient(90deg, ${TOKENS.steelDark}, ${TOKENS.steelHi} 40%, ${TOKENS.steelMid})`;
  return (
    <div
      aria-hidden="true"
      className="absolute -translate-y-1/2"
      style={{
        left: GEO.postCenter - GEO.postWidth / 2 - 4,
        top: "50%",
        width: GEO.postWidth + 8,
        height,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-2 rounded-[1px]"
        style={{ background: band }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2 rounded-[1px]"
        style={{ background: band }}
      />
    </div>
  );
}

/** A stump of post behind the sign in the stacked fallback. */
function StaticPostStub() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-y-0"
      style={{
        left: GEO.postCenter - GEO.postWidth / 2,
        width: GEO.postWidth,
        background: POST_FILL,
      }}
    />
  );
}


/**
 * One sign, bolted across the post at its own middle — the post passes behind
 * it, as in the reference; nothing cantilevers out to one side. It carries a
 * face on each side so a sign turned away shows a blank back rather than its
 * own text mirrored.
 *
 * The arm is centred on the post (left: -w/2) and pivots about its own middle,
 * so it turns on the post's axis rather than swinging off it. The four signs
 * sit at different heights, which is what keeps the one showing its blank back
 * from ever landing on top of the one being read.
 */
function SignArm({ title, index }: { title: string; index: number }) {
  const s = SIGNS[index];
  const top = SIGN_TOPS[index] - CLUSTER_H / 2;

  return (
    <div
      className="absolute"
      style={{
        left: -s.w / 2,
        top,
        width: s.w,
        height: s.h,
        transformOrigin: "50% 50%",
        transform: `rotateY(${index * 90}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
        <SignFace style={s} title={title} />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        <SignFace style={s} />
      </div>
    </div>
  );
}

/** The octagon, as eight cuts off a square — a STOP sign's own proportions. */
const OCTAGON =
  "polygon(29.3% 0%, 70.7% 0%, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0% 70.7%, 0% 29.3%)";

/**
 * A single sign: bracket stub, the shaped face, its printed keyline and the
 * legend. Omit `title` for the blank reverse.
 *
 * The keyline is drawn as a shape inside a shape rather than as a `border`,
 * because a border traces the element's rectangle — on the octagon it would
 * cut straight across all four corner chamfers.
 */
function SignFace({ style: s, title }: { style: SignStyle; title?: string }) {
  const shape = s.octagon ? { clipPath: OCTAGON } : { borderRadius: 4 };

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          ...shape,
          background: `
            linear-gradient(180deg, rgba(255,255,255,.14) 0 4px, rgba(0,0,0,0) 4px),
            linear-gradient(0deg, rgba(0,0,0,.2) 0 5px, rgba(0,0,0,0) 5px),
            linear-gradient(180deg, ${s.face}, ${s.faceDark})`,
          filter: "drop-shadow(0 9px 13px rgba(30,35,30,.3))",
        }}
      >
        {/* Printed keyline, inset the way a real sign's border is */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            inset: s.pad,
            ...(s.octagon
              ? { clipPath: OCTAGON, background: s.keyline }
              : {
                  borderRadius: 2,
                  border: `2px solid ${s.keyline}`,
                }),
          }}
        >
          {s.octagon ? (
            <span
              className="absolute block"
              style={{
                inset: 3,
                clipPath: OCTAGON,
                background: s.face,
              }}
            />
          ) : null}
        </span>

        {/* Fixing bolts on the centre line, where the post sits behind */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[14%] size-[6px] -translate-x-1/2 rounded-full"
          style={{
            background: TOKENS.bolt,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.4)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute bottom-[14%] left-1/2 size-[6px] -translate-x-1/2 rounded-full"
          style={{
            background: TOKENS.bolt,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.4)",
          }}
        />

        {title ? (
          <span
            // font-sans, not the site's Fraunces display face: signage is set
            // in a grotesque, never a high-contrast serif.
            className="absolute inset-0 flex flex-col items-center justify-center whitespace-pre-line px-5 text-center font-sans font-extrabold uppercase leading-[1.15] tracking-[0.01em]"
            style={{
              color: s.ink,
              fontSize: s.fontSize,
              textShadow:
                s.ink === "#FFFFFF" ? "0 1px 2px rgba(0,25,10,.4)" : "none",
            }}
          >
            {title}
          </span>
        ) : null}
      </div>
    </div>
  );
}
