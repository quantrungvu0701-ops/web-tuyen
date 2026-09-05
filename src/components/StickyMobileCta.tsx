import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/lib/site-config";

export function StickyMobileCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <a
        href={siteConfig.googleFormUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-accent text-base font-semibold text-accent-foreground transition-colors duration-200 active:bg-accent-hover"
      >
        Đăng ký ngay
        <ArrowUpRight aria-hidden="true" weight="bold" className="size-[1.1em]" />
      </a>
    </div>
  );
}
