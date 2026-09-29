import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

/**
 * The key visual's own faces, self-hosted from the official element pack.
 *
 * UTM Bango Pro is the cover's "Thế hệ thứ 24" lettering: rounded, heavy, full
 * Vietnamese. It carries every heading.
 *
 * LF Negrita Pro is the cover's round-name lettering ("Vòng đơn", the hooked
 * g). Full Vietnamese too; it carries buttons and small accents.
 *
 * PS Bolden is the condensed title face, but its Việt hóa build stops at 172
 * glyphs — ò ô ă đ ơ ư ấ ế ệ ị ỏ ớ ứ are all missing. It is only ever given
 * Latin-only strings (digits, dates). The Vietnamese title ships as the
 * designer's own lettering.
 */
const display = localFont({
  src: "./fonts/utm-bango-pro.woff2",
  variable: "--font-bango",
  display: "swap",
});

const accent = localFont({
  src: "./fonts/lf-negrita-pro.woff2",
  variable: "--font-lf-negrita",
  display: "swap",
});

const sign = localFont({
  src: "./fonts/ps-bolden.woff2",
  variable: "--font-ps-bolden",
  display: "swap",
});

// Designed in Vietnam for Vietnamese: stacked diacritics (ể, ộ, ữ) keep their
// spacing at body sizes, where most Latin families crowd them.
const body = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * Absolute base for the share image. Vercel sets its production domain at
 * build time; NEXT_PUBLIC_SITE_URL overrides it once a custom domain exists.
 * Without this, Facebook and Zalo previews would point at localhost.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Tuyển Cộng tác viên Thế hệ thứ 24 — Hội Sinh viên trường ĐH Ngoại thương",
  description:
    "Hội Sinh viên trường Đại học Ngoại thương tuyển Cộng tác viên Thế hệ thứ 24 — nhận đơn từ 01/10 đến 20/10. Big Fat Family chờ em!",
  openGraph: {
    title: "Tuyển Cộng tác viên Thế hệ thứ 24 — HSV FTU",
    description: "Nhận đơn từ 01/10 đến 20/10. Big Fat Family chờ em!",
    images: ["/kv/og.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FDE8DC",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${display.variable} ${accent.variable} ${sign.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
