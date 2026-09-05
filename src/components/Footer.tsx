import { EnvelopeSimple, FacebookLogo, MapPin } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";

const contactLinks = [
  {
    icon: FacebookLogo,
    label: "Fanpage",
    value: "Theo dõi HSV FTU",
    href: siteConfig.contact.fanpageUrl,
  },
  {
    icon: EnvelopeSimple,
    label: "Email",
    value: siteConfig.contact.email,
    href: `mailto:${siteConfig.contact.email}`,
  },
];

export function Footer() {
  return (
    <footer className="border-t border-background/10 bg-foreground pt-12 pb-28 text-background md:pb-16">
      <Container>
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-display text-xl font-semibold">{siteConfig.orgShortName}</span>
            <p className="max-w-xs text-sm text-background/60">{siteConfig.orgName}</p>
          </div>

          <div className="flex flex-col gap-4 text-sm">
            {contactLinks.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                target={label === "Fanpage" ? "_blank" : undefined}
                rel={label === "Fanpage" ? "noopener noreferrer" : undefined}
                className="flex min-h-[44px] items-center gap-3 text-background/80 transition-colors duration-200 hover:text-background"
              >
                <Icon aria-hidden="true" weight="bold" className="size-5 shrink-0 text-accent" />
                <span>{value}</span>
              </a>
            ))}
            <div className="flex items-start gap-3 text-background/80">
              <MapPin aria-hidden="true" weight="bold" className="mt-0.5 size-5 shrink-0 text-accent" />
              <span>{siteConfig.contact.officeLocation}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-background/10 pt-6 text-xs text-background/50">
          © {new Date().getFullYear()} {siteConfig.orgShortName}. Bản quyền thuộc về{" "}
          {siteConfig.orgName}.
        </div>
      </Container>
    </footer>
  );
}
