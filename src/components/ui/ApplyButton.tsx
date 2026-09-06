import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/lib/site-config";

type ApplyButtonProps = {
  className?: string;
  size?: "md" | "lg";
  label?: string;
};

/**
 * The single application CTA. Always points at siteConfig.googleFormUrl so
 * every button on the site stays in sync — update the URL in one place.
 */
export function ApplyButton({ className = "", size = "lg", label = "Đăng ký ngay" }: ApplyButtonProps) {
  const padding = size === "lg" ? "px-8 py-4 text-base" : "px-5 py-3 text-sm";

  return (
    <a
      href={siteConfig.googleFormUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent font-semibold text-accent-foreground shadow-[0_6px_20px_rgba(166,25,46,0.25)] transition-colors duration-200 hover:bg-accent-hover ${padding} ${className}`}
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
