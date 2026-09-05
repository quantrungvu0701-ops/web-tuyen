import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/lib/site-config";

type CtaButtonProps = {
  className?: string;
  variant?: "primary" | "inverted";
  size?: "md" | "lg";
  label?: string;
};

/**
 * The single application CTA. Always points at siteConfig.googleFormUrl so
 * every button on the page stays in sync — update the URL in one place.
 */
export function CtaButton({
  className = "",
  variant = "primary",
  size = "lg",
  label = "Đăng ký ngay",
}: CtaButtonProps) {
  const palette =
    variant === "primary"
      ? "bg-accent text-accent-foreground hover:bg-accent-hover"
      : "bg-background text-foreground hover:bg-muted";
  const padding = size === "lg" ? "px-7 py-4 text-base" : "px-5 py-3 text-sm";

  return (
    <a
      href={siteConfig.googleFormUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 ${palette} ${padding} ${className}`}
    >
      {label}
      <ArrowUpRight
        aria-hidden="true"
        weight="bold"
        className="size-[1.1em] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </a>
  );
}
