import type { ElementType, ReactNode } from "react";

/**
 * The key visual's lettering as live text: white face, pink outline, coral
 * extrusion (see `.sticker` in globals.css). `tone="ink"` swaps the face to
 * plum for pale grounds, where a white face has only its outline to stand on.
 */
export function Sticker({
  as: Tag = "h2",
  children,
  tone = "light",
  className = "",
}: {
  as?: ElementType;
  children: string;
  tone?: "light" | "ink";
  className?: string;
}) {
  return (
    <Tag className={`sticker ${className}`} data-tone={tone}>
      <span aria-hidden="true" className="sticker-back">
        {children}
      </span>
      <span className="sticker-front">{children}</span>
    </Tag>
  );
}

const BTN =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-accent tracking-[0.01em] transition-[transform,box-shadow,background-color] duration-300 ease-[var(--ease-spring)] active:scale-[0.97] active:duration-100";

/**
 * Gummy buttons, drawn the way the KV draws its props: a glossy top highlight
 * and a soft plum shadow underneath, lifting on hover like a sticker peeling.
 */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  /** Opens in a new tab: for pages that live outside this site. */
  external?: boolean;
}) {
  const sizes = size === "lg" ? "h-16 px-9 text-[1.35rem]" : "h-13 px-7 text-lg";
  const look =
    variant === "primary"
      ? "bg-pink-600 text-white shadow-[inset_0_2px_0_rgb(255_255_255/0.35),inset_0_-4px_0_rgb(120_0_40/0.25),var(--shadow-md)] hover:-translate-y-1 hover:bg-pink-700 hover:shadow-[inset_0_2px_0_rgb(255_255_255/0.35),inset_0_-4px_0_rgb(120_0_40/0.25),var(--shadow-lg)]"
      : "bg-white/90 text-plum-900 ring-2 ring-pink-200 shadow-[var(--shadow-sm)] hover:-translate-y-1 hover:ring-pink-300 hover:shadow-[var(--shadow-md)]";
  return (
    <a
      href={href}
      onClick={onClick}
      className={`${BTN} ${sizes} ${look} ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

/** A section's own heading block: sticker title plus an optional lead line. */
export function SectionHead({
  title,
  lead,
  tone = "light",
  align = "center",
  className = "",
}: {
  title: string;
  lead?: ReactNode;
  tone?: "light" | "ink";
  align?: "center" | "left";
  className?: string;
}) {
  const a = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col gap-5 ${a} ${className}`}>
      <Sticker tone={tone} className="text-[clamp(2.4rem,5.2vw,4.6rem)]">
        {title}
      </Sticker>
      {lead ? (
        <p className="max-w-[58ch] text-pretty text-base leading-relaxed text-plum-500 sm:text-lg">
          {lead}
        </p>
      ) : null}
    </div>
  );
}

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-5 transition-transform duration-300 ease-[var(--ease-spring)] group-hover:translate-x-1 ${className}`}
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
