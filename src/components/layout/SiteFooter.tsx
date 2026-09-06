import Link from "next/link";
import {
  FacebookLogo,
  InstagramLogo,
  ThreadsLogo,
  TiktokLogo,
} from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/lib/site-config";

const socials = [
  { label: "Facebook", href: siteConfig.contact.facebookUrl, Icon: FacebookLogo },
  { label: "TikTok", href: siteConfig.contact.tiktokUrl, Icon: TiktokLogo },
  { label: "Instagram", href: siteConfig.contact.instagramUrl, Icon: InstagramLogo },
  { label: "Threads", href: siteConfig.contact.threadsUrl, Icon: ThreadsLogo },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card py-10 md:py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 sm:px-6 md:flex-row md:items-start md:justify-between md:gap-8 lg:px-8">
        {/* TODO: swap the wordmark for the real HSV FTU logo file when supplied. */}
        <Link href="/" className="font-display text-3xl font-semibold tracking-tight">
          {siteConfig.orgShortName}
        </Link>

        <div className="flex flex-col gap-3">
          <h2 className="text-base font-bold">Contact</h2>
          <p className="text-sm text-muted-foreground">Hotline: {siteConfig.contact.hotline}</p>
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="inline-flex min-h-[44px] items-center text-sm text-muted-foreground transition-colors duration-200 hover:text-accent"
          >
            Email: {siteConfig.contact.email}
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-base font-bold">Follow us</h2>
          <ul className="flex items-center gap-3">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-11 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:border-accent hover:text-accent"
                >
                  <Icon aria-hidden="true" weight="fill" className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
