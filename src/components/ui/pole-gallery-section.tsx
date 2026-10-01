"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { ButtonLink, Sticker } from "@/components/v24/ui";
import { EVENTS, SUPPORT_PROJECTS, type SupportProject } from "@/lib/site";
import GallerySlider, {
  GALLERY_RESET,
  IMAGES_PER_SLIDE,
  type GallerySlide,
} from "@/components/ui/gallery-slider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ------------------------------------------------------------------ design
 * One sign post stands in the left rail, running from just under the nav to
 * the bottom of the screen. Five signs are stacked down it, one per category.
 * Scrolling pins the section and swings the signs round on their mounting
 * bands: the active category's sign faces the reader, its neighbours turn
 * edge-on, and the rest show their blank backs. The panel beside the post
 * cross-fades in step with the turn.
 *
 * Styled from the Thế hệ 24 key visual: the pink post with green collars; the
 * GO blade and the BFF plate for the four event categories, and the K65 oval
 * for the last one, the student-support projects. Those are projects rather
 * than events, so their panel is the KV's convex mirrors, one per project,
 * each with a button out to the project's own page.
 *
 * The post itself does not turn, only the signs do. A flat post rotated 45
 * degrees collapses to a line, so a spinning post would read as a glitch.
 * Signs on a swivel read as a mechanism.
 */

/** Four event galleries, then the projects panel. */
const N = EVENTS.length + 1;
const PROJECTS_INDEX = EVENTS.length;

/** DEMO: snap each scroll to the next category instead of free scrubbing. */
const SNAP_STEPS = true;

/** Fraction of each step spent resting on a category before the turn starts. */
const HOLD = 0.42;

/** The pinned layout needs the rail AND a wide panel side by side. */
const PINNED_MQ = "(min-width: 1280px)";

const GEO = {
  /** Post centre. Signs are mounted centred ON the post, so this has to be
   *  at least half the widest sign clear of x = 0. */
  postCenter: 180,
  /** The KV pole: slim, so the signs read before the post does. */
  postWidth: 30,
  railWidth: 350,
  /** Where the post's cap sits: just under the floating nav (it ends ~80px). */
  postTop: 90,
  /** From the cap down to the first sign: room for the two top collars. */
  capToSigns: 34,
  /** At least this much post shows under the last sign's collar. */
  footMin: 26,
  /** Vertical air between two signs on the post. */
  signGap: 12,
  /** Panel cap; also what keeps a gutter at the window edge. */
  panelMaxWidth: 1180,
} as const;

const CLUSTER_TOP = GEO.postTop + GEO.capToSigns;

/**
 * The five signs, top to bottom: blade, plate, blade, plate for the four
 * event categories, and a fifth blade at the foot for the projects.
 */
type SignStyle = {
  w: number;
  h: number;
  shape: "oval" | "blade" | "plate";
  fontSize: number;
};

const BLADE: SignStyle = { w: 300, h: 92, shape: "blade", fontSize: 21 };
const PLATE: SignStyle = { w: 286, h: 92, shape: "plate", fontSize: 20 };
const SIGNS: SignStyle[] = [BLADE, PLATE, BLADE, PLATE, BLADE];

/** Signs stack down the post, so each one's top depends on those above it. */
const SIGN_TOPS = SIGNS.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SIGNS[i - 1].h + GEO.signGap);
  return acc;
}, []);

const CLUSTER_H = SIGN_TOPS[SIGN_TOPS.length - 1] + SIGNS[SIGNS.length - 1].h;

const TOKENS = {
  background: "transparent",
  pink: "#FF2E7B",
  pinkDeep: "#E0115F",
  pinkPale: "#FFE1E8",
  cream: "#FFF4E6",
  plum: "#3F0A26",
  collar: "#2F8F4B",
  collarHi: "#6CCB7D",
  mirrorRim: "#FFE1E8",
  mirrorRimHi: "#FF7FA3",
} as const;

/**
 * TODO(photos): placeholder photos. Only 4 distinct images exist in
 * assets/source and they are all landscape, so they are cropped to fit and
 * cycled. Every slide needs 3 of them.
 */
const PHOTOS = [
  "/gallery/p1.jpg",
  "/gallery/p2.jpg",
  "/gallery/p3.png",
  "/gallery/p4.webp",
];

type Category = { id: number; title: string; slides: GallerySlide[] };

/** One slide per event; copy lives in src/lib/site.ts. */
const CATEGORIES: Category[] = EVENTS.map((cat, c) => ({
  id: c,
  title: cat.title,
  slides: cat.events.map((ev, i) => ({
    id: `${c}-${i}`,
    title: ev.name,
    description: ev.body,
    more: ev.more,
    images:
      ev.photos ??
      Array.from(
        { length: IMAGES_PER_SLIDE },
        (_, k) => PHOTOS[(c * 5 + i * IMAGES_PER_SLIDE + k) % PHOTOS.length],
      ),
  })),
}));

/** Every event across the four galleries: they share one text-area height. */
const ALL_SLIDES = CATEGORIES.flatMap((c) => c.slides);

const TITLES = [...CATEGORIES.map((c) => c.title), SUPPORT_PROJECTS.title];

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

/**
 * A sign's swing at category position `p`: facing the reader when it is the
 * active one, a quarter-turn away for each step off, and never past a half
 * turn — so every sign two or more steps away shows its blank back, and no
 * far sign ever comes round to face front beside the one being read.
 */
const signAngle = (k: number, p: number) =>
  Math.max(-180, Math.min(180, (k - p) * 90));

/* --------------------------------------------------------------- component */

export default function PoleGallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const signRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Below xl there is no room for rail and panel side by side, and a
      // reduced-motion reader should not be handed a scrub at all.
      mm.add(
        { pinned: `${PINNED_MQ} and (prefers-reduced-motion: no-preference)` },
        (ctx) => {
          if (!ctx.conditions?.pinned) return;

          const apply = (p: number) => {
            signRefs.current.forEach((el, k) => {
              if (el) el.style.transform = `rotateY(${signAngle(k, p)}deg)`;
            });
            panelRefs.current.forEach((el, k) => {
              if (!el) return;
              // Each panel stays solid while its sign faces us and dissolves
              // across the turn. The opacity is the square root of the fade so
              // the two halves of a cross-dissolve sum to roughly constant
              // brightness instead of the section briefly going blank.
              const s = smoothstep(clamp01(1 - Math.abs(p - k)));
              el.style.opacity = String(Math.sqrt(s));
              el.style.transform = `translateY(${(1 - s) * 12}px) scale(${
                0.985 + 0.015 * s
              })`;
              const hidden = s <= 0.001;
              // A category coming back into view opens on its first event,
              // whatever the reader left it on last time.
              if (!hidden && el.style.visibility === "hidden") {
                el.querySelector("[aria-roledescription=carousel]")?.dispatchEvent(new Event(GALLERY_RESET));
              }
              el.style.visibility = hidden ? "hidden" : "visible";
              el.style.pointerEvents = s > 0.5 ? "auto" : "none";
            });
          };

          apply(0);

          // The signs keep their size; only a window too short to hold all
          // five above the fold shrinks the stack, so the post's foot always
          // shows under the last one.
          const fit = () => {
            const el = clusterRef.current;
            if (!el) return;
            const room = window.innerHeight - CLUSTER_TOP - GEO.footMin - 14;
            const scale = Math.min(1, room / CLUSTER_H);
            el.style.scale = scale < 1 ? String(scale) : "";
          };

          fit();
          window.addEventListener("resize", fit);

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

          // DEMO: one flick carries the pole all the way to the next sign.
          // When scrolling stops inside the section, the page finishes the
          // turn in the direction it was heading, through the smoother (GSAP's
          // own `snap` fights ScrollSmoother and throws the page to the top).
          // Only the reader's own scrolling snaps. A nav-link jump glides
          // through this section on its way elsewhere; snapping that would
          // strand it on a sign here.
          let lastInput = 0;
          const markInput = () => {
            lastInput = performance.now();
          };
          const inputs = ["wheel", "touchmove", "keydown"] as const;
          inputs.forEach((t) => window.addEventListener(t, markInput, { passive: true }));

          const onScrollEnd = () => {
            if (!SNAP_STEPS) return;
            if (performance.now() - lastInput > 1200) return;
            const p = st.progress;
            if (p <= 0 || p >= 1) return;
            const steps = N - 1;
            const u = p * steps;
            if (Math.abs(u - Math.round(u)) < 0.01) return;
            const target = (st.direction > 0 ? Math.ceil(u) : Math.floor(u)) / steps;
            const y = st.start + target * (st.end - st.start);
            const smoother = ScrollSmoother.get();
            if (smoother) smoother.scrollTo(y, true);
            else window.scrollTo({ top: y, behavior: "smooth" });
          };
          ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);

          return () => {
            ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
            inputs.forEach((t) => window.removeEventListener(t, markInput));
            st.kill();
            window.removeEventListener("resize", fit);
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
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: TOKENS.background }}
    >
      <div
        ref={stageRef}
        className="relative flex w-full flex-col py-16 xl:h-screen xl:py-0 xl:pt-0"
      >
        <Sticker
          tone="ink"
          className="mb-10 px-6 text-center text-[clamp(2.4rem,5vw,4.4rem)] xl:mt-[18px] xl:mb-10 xl:translate-x-[50px]"
        >
          Các sự kiện chính
        </Sticker>

        {/* -------------------------------------------- pinned, xl and up */}
        {/* The post: from under the nav to the bottom of the screen. */}
        <div
          className="absolute inset-y-0 left-0 z-10 hidden xl:block"
          style={{
            width: GEO.railWidth,
            perspective: "1100px",
            perspectiveOrigin: `${GEO.postCenter}px ${CLUSTER_TOP + CLUSTER_H / 2}px`,
          }}
        >
          <PostFeet />
          <Post />
          <div
            ref={clusterRef}
            className="absolute"
            style={{
              left: GEO.postCenter,
              top: CLUSTER_TOP,
              width: 0,
              height: CLUSTER_H,
              transformOrigin: "0 0",
              transformStyle: "preserve-3d",
            }}
          >
            <Collars />
            {TITLES.map((title, k) => (
              <SignArm
                key={k}
                title={title}
                index={k}
                ref={(el) => {
                  signRefs.current[k] = el;
                }}
              />
            ))}
          </div>
        </div>

        {/* The panels share one box and cross-fade in place. */}
        <div
          className="relative hidden min-h-0 flex-1 xl:block"
          style={{ marginLeft: GEO.railWidth, marginRight: 32 }}
        >
          {TITLES.map((title, k) => (
            <div
              key={k}
              ref={(el) => {
                panelRefs.current[k] = el;
              }}
              className="absolute inset-0"
              style={{
                opacity: k === 0 ? 1 : 0,
                visibility: k === 0 ? "visible" : "hidden",
                willChange: "opacity, transform",
              }}
              aria-hidden={k === 0 ? undefined : true}
            >
              <div
                className="mx-auto h-full"
                // 95% of the room beside the post: a little air either side.
                style={{ width: "95%", maxWidth: GEO.panelMaxWidth }}
              >
                {k === PROJECTS_INDEX ? (
                  <ProjectMirrors label={title.replace("\n", " ")} pinned />
                ) : (
                  <GallerySlider
                    slides={CATEGORIES[k].slides}
                    label={title.replace("\n", " ")}
                    fill
                    sizeWith={ALL_SLIDES}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ------------------------------- stacked fallback, below xl */}
        <div className="xl:hidden">
          {TITLES.map((title, k) => (
            <div key={k} className={k > 0 ? "mt-20" : ""}>
              <div className="relative mb-8" style={{ height: SIGNS[k].h }}>
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
                  <SignFace style={SIGNS[k]} title={title} />
                </div>
              </div>
              <div className="px-6">
                {k === PROJECTS_INDEX ? (
                  <ProjectMirrors label={title.replace("\n", " ")} />
                ) : (
                  <GallerySlider slides={CATEGORIES[k].slides} label={title.replace("\n", " ")} />
                )}
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
 * The key visual's post: a pink tube lit from the left, in the same pinks the
 * cover's pole is shaded with. Hard stops rather than a smooth blend are what
 * make it read as a cylinder at this width.
 */
const POST_FILL =
  "linear-gradient(90deg, #C9557D 0 3px, #FFE3EC 3px 30%, #F7A9C1 30% 62%, #E8779E 62% 88%, #C9557D 88% 100%)";

function Post() {
  return (
    <div
      aria-hidden="true"
      className="absolute"
      style={{
        top: GEO.postTop,
        bottom: POST_FOOT,
        left: GEO.postCenter - GEO.postWidth / 2,
        width: GEO.postWidth,
        background: POST_FILL,
      }}
    >
      <div
        className="absolute -left-[3px] -right-[3px] top-0 h-3 rounded-t-full"
        style={{ background: "linear-gradient(90deg, #E8779E, #FFE3EC 45%, #C9557D)" }}
      />
    </div>
  );
}

/**
 * The pole's base, drawn flat in the key visual's own colours (the art's base,
 * Key visual/7.png, is drawn in perspective and tilted). The post stops at the
 * middle of the hole, so it reads as standing in it.
 */
const FEET = { w: 98, h: 39, bottom: 4 };
/** Hole centre, from the base's bottom edge: 28 of the drawing's 40 units. */
const POST_FOOT = FEET.bottom + FEET.h * (28 / 40);

function PostFeet() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 40"
      className="absolute"
      style={{ left: GEO.postCenter - FEET.w / 2, bottom: FEET.bottom, width: FEET.w, height: FEET.h }}
    >
      <defs>
        <linearGradient id="feet-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EE9A8A" />
          <stop offset="1" stopColor="#DE5986" />
        </linearGradient>
      </defs>
      {/* The rim, then the top face, then the hole the post stands in. */}
      <path d="M2 12 L7 29 A43 9 0 0 0 93 29 L98 12 Z" fill="url(#feet-side)" />
      <ellipse cx="50" cy="12" rx="48" ry="10" fill="#DE5986" />
      <ellipse cx="50" cy="12" rx="15.8" ry="3.6" fill="#B8406C" />
    </svg>
  );
}

/** The green collars the cover's signs are clamped on, above the top sign. */
function Collars() {
  const band = `linear-gradient(90deg, ${TOKENS.collar}, ${TOKENS.collarHi} 40%, ${TOKENS.collar})`;
  const w = GEO.postWidth + 8;
  const at = (top: number) => (
    <div
      className="absolute h-2.5 rounded-full"
      style={{ left: -w / 2, width: w, top, background: band }}
    />
  );
  return (
    <div aria-hidden="true">
      {at(-26)}
      {at(-12)}
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
 * One sign, fixed across the post at its own middle. It carries a face on
 * each side so a sign turned away shows a blank back rather than its own text
 * mirrored. It pivots about its own middle, on the post's axis.
 */
function SignArm({
  title,
  index,
  ref,
}: {
  title: string;
  index: number;
  ref: (el: HTMLDivElement | null) => void;
}) {
  const s = SIGNS[index];

  return (
    <div
      ref={ref}
      className="absolute"
      style={{
        left: -s.w / 2,
        top: SIGN_TOPS[index],
        width: s.w,
        height: s.h,
        transformOrigin: "50% 50%",
        transform: `rotateY(${signAngle(index, 0)}deg)`,
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

/**
 * One sign face, in the cover's gummy finish: a soft top highlight, a darker
 * lower edge, a warm drop shadow. Omit `title` for the blank reverse.
 */
function SignFace({ style: s, title }: { style: SignStyle; title?: string }) {
  const gloss = "inset 0 3px 0 rgb(255 255 255 / 0.45), inset 0 -5px 0 rgb(120 0 40 / 0.18)";
  const drop = "0 14px 22px -12px rgb(63 10 38 / 0.45)";

  let outer: React.CSSProperties;
  let inner: React.CSSProperties | null = null;
  let ink: string;

  switch (s.shape) {
    case "oval":
      outer = {
        borderRadius: "50%",
        background: `linear-gradient(160deg, #FF5A95, ${TOKENS.pink} 55%, ${TOKENS.pinkDeep})`,
        boxShadow: `${gloss}, ${drop}`,
      };
      inner = { inset: 14, borderRadius: "50%", background: TOKENS.cream };
      ink = TOKENS.pinkDeep;
      break;
    case "blade":
      outer = {
        borderRadius: 10,
        background: `linear-gradient(100deg, #FF6F8E, ${TOKENS.pink} 45%, #F24FB1)`,
        boxShadow: `${gloss}, ${drop}`,
      };
      ink = "#FFFFFF";
      break;
    case "plate":
      outer = {
        borderRadius: 6,
        background: TOKENS.pinkPale,
        boxShadow: `inset 0 3px 0 rgb(255 255 255 / 0.7), ${drop}`,
      };
      inner = { inset: 7, borderRadius: 3, border: "3px solid #FF7FA3" };
      ink = "#F23A78";
      break;
  }

  return (
    <div className="absolute inset-0" style={outer}>
      {inner ? <span aria-hidden="true" className="absolute" style={inner} /> : null}
      {title ? (
        <span
          className="absolute inset-0 flex flex-col items-center justify-center whitespace-pre-line px-6 text-center font-display uppercase leading-[1.08]"
          style={{
            color: ink,
            fontSize: s.fontSize,
            textShadow: ink === "#FFFFFF" ? "0 2px 0 rgb(160 0 60 / 0.35)" : "none",
          }}
        >
          {title}
        </span>
      ) : null}
    </div>
  );
}

/**
 * The student-support projects: the KV's convex mirror, once per project,
 * with the project's picture in the glass and its name as a button out to
 * the project's page.
 */
function ProjectMirrors({ label, pinned = false }: { label: string; pinned?: boolean }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={
        pinned
          ? "flex h-full items-center justify-center gap-[clamp(48px,7vw,120px)] pb-10"
          : "flex flex-wrap items-start justify-center gap-x-12 gap-y-10"
      }
      style={
        {
          "--mirror": pinned
            ? "min(360px, calc(100svh - 330px))"
            : "min(280px, 72vw)",
        } as React.CSSProperties
      }
    >
      {SUPPORT_PROJECTS.projects.map((p) => (
        <ProjectMirror key={p.name} project={p} />
      ))}
    </div>
  );
}

function ProjectMirror({ project }: { project: SupportProject }) {
  return (
    <div className="flex flex-col items-center gap-7">
      <div
        className="relative aspect-square overflow-hidden rounded-full"
        style={{
          width: "var(--mirror)",
          // The pale plate sign's colours: its pale pink face, then its printed pink edge.
          boxShadow: `0 0 0 10px ${TOKENS.mirrorRim}, 0 0 0 14px ${TOKENS.mirrorRimHi}, 0 30px 44px -18px rgb(63 10 38 / 0.45)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={project.name}
          className="h-full w-full object-cover"
          draggable={false}
        />
        {/* The glass's own glint: the two pale streaks on the cover's mirror. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(125deg, transparent 22%, rgb(255 255 255 / 0.32) 27%, transparent 33%, transparent 40%, rgb(255 255 255 / 0.22) 44%, transparent 49%)",
            boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.4), inset 0 -18px 40px -20px rgb(0 60 30 / 0.35)",
          }}
        />
      </div>
      <ButtonLink href={project.href} external={project.href !== "#"} className="!font-display">
        {project.name}
      </ButtonLink>
    </div>
  );
}
