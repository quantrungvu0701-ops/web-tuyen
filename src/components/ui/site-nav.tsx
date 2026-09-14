import Image from "next/image";
import Link from "next/link";

// Sampled from the BFF logo.
const BRAND_RED = "#E80808";
// Sampled from the top row of hero-background.webp, so the band reads as one
// surface with the artwork below it.
const BAND = "#FEE9BA";

const GLASS = {
  backgroundColor: "rgba(255, 252, 245, 0.65)",
  borderColor: "rgba(255, 255, 255, 0.55)",
};

type NavLink = {
  label: string;
  href: string;
};

// "#" targets jump to a section on the home page; the rest are their own pages.
const LINKS: NavLink[] = [
  { label: "SKBL", href: "/skbl" },
  { label: "ABOUT", href: "#about" },
  { label: "TUYỂN", href: "#tuyen" },
  { label: "GALLERY", href: "/gallery" },
];

export default function SiteNav() {
  return (
    <header className="w-full px-4 py-4" style={{ backgroundColor: BAND }}>
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-6 rounded-full border px-4 py-2 shadow-[0_6px_24px_rgba(120,90,40,0.12)] backdrop-blur-xl"
        style={GLASS}
      >
        <Link href="/" aria-label="HSV FTU — về trang chủ" className="shrink-0">
          <Image
            src="/logo-bff.png"
            alt="BFF — Hội Sinh viên trường ĐH Ngoại thương"
            width={1902}
            height={827}
            priority={false}
            className="h-9 w-auto"
          />
        </Link>

        <ul className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="rounded-full px-3 py-2 text-sm font-semibold tracking-wide text-[#241F1C] transition-colors hover:bg-black/5 sm:px-4"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/don"
          className="shrink-0 rounded-full px-5 py-2.5 text-sm font-bold tracking-wide text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND_RED }}
        >
          ĐIỀN ĐƠN NGAY
        </Link>
      </nav>
    </header>
  );
}
