/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { CONTACT, SPONSORS } from "@/lib/site";

/**
 * Last year's footer, this year's content: the three institutional logos on
 * the left, the sponsors in the middle (Bạc and Đồng side by side over Đồng
 * hành), and the contact lines on the right.
 *
 * Every logo is sized off one height, --logo: the institutional marks are 1,
 * sponsors take their tier's share (Bạc 0.8, Đồng 0.6, Đồng hành 0.4).
 */

function Tier({ tier, scale, logos, logosClass = "" }: (typeof SPONSORS)[number] & { logosClass?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="font-display text-sm uppercase tracking-wide text-pink-700">{tier}</h3>
      <div className={`flex flex-wrap items-center justify-center gap-4 ${logosClass}`}>
        {logos.map((l) => (
          <img
            key={l.name}
            src={l.logo}
            alt={l.name}
            className="w-auto"
            style={{ height: `calc(var(--logo) * ${scale})` }}
          />
        ))}
      </div>
    </div>
  );
}

function Line({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="leading-relaxed">
      <span className="font-semibold text-pink-700">{label}:</span> {children}
    </li>
  );
}

/** Brand marks for the three channels, each a button out to the page. */
const SOCIALS = [
  {
    label: "Facebook",
    href: CONTACT.fanpage,
    color: "#1877F2",
    path: "M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12Z",
  },
  {
    label: "YouTube",
    href: CONTACT.youtube,
    color: "#FF0000",
    path: "M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 3.9 12 3.9 12 3.9s-7.5 0-9.4.5A3 3 0 0 0 .5 6.5C0 8.4 0 12 0 12s0 3.6.5 5.5a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.5.5-5.5s0-3.6-.5-5.5ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z",
  },
  {
    label: "TikTok",
    href: CONTACT.tiktok,
    color: "#010101",
    path: "M16.6 5.8a4.8 4.8 0 0 1-1.1-3.1h-3.3v13.2a2.9 2.9 0 1 1-2-2.8V9.7a6.2 6.2 0 1 0 5.3 6.1V9.4a8 8 0 0 0 4.6 1.5V7.6a4.8 4.8 0 0 1-3.5-1.8Z",
  },
];

const LINK = "break-words underline-offset-4 hover:underline";

export default function Footer() {
  const [silver, bronze, partners] = SPONSORS;

  return (
    <footer className="bg-pink-100 text-plum-900 [--logo:56px] md:[--logo:72px]">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-6 py-14 lg:grid-cols-[auto_1fr_auto] lg:gap-10 lg:px-10">
        {/* The three institutional logos. */}
        <div className="flex items-center justify-center gap-4 lg:-translate-y-[25px] lg:justify-start">
          <img src="/logo-ftu.webp" alt="Trường Đại học Ngoại thương" style={{ height: "var(--logo)" }} className="w-auto" />
          <img src="/logo-hsvvn.webp" alt="Hội Sinh viên Việt Nam" style={{ height: "var(--logo)" }} className="w-auto" />
          <img src="/logo-bff.png" alt="BFF — Big Fat Family" style={{ height: "var(--logo)" }} className="w-auto" />
        </div>

        {/* Nhà tài trợ: Bạc and Đồng side by side, Đồng hành beneath. */}
        <div className="flex flex-col items-center gap-7">
          <div className="flex flex-wrap items-start justify-center gap-x-14 gap-y-7">
            <Tier {...silver} logosClass="-translate-y-[2px]" />
            <Tier {...bronze} logosClass="translate-y-[5px]" />
          </div>
          <Tier {...partners} />
        </div>

        {/* Liên hệ. */}
        <div className="lg:max-w-[440px] lg:justify-self-end">
          <h2 className="font-display text-xl">Liên hệ</h2>
          <div className="mt-3 flex items-center gap-2.5">
            {SOCIALS.map((so) => (
              <a
                key={so.label}
                href={so.href}
                target="_blank"
                rel="noreferrer"
                aria-label={so.label}
                className="grid size-10 place-items-center rounded-full bg-white shadow-[var(--shadow-sm)] transition-transform duration-300 ease-[var(--ease-spring)] hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill={so.color} aria-hidden="true">
                  <path d={so.path} />
                </svg>
              </a>
            ))}
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            <Line label="Email">
              <a href={`mailto:${CONTACT.email}`} className={LINK}>
                {CONTACT.email}
              </a>
            </Line>
            <Line label="Địa chỉ">{CONTACT.address}</Line>
            <Line label="Hotline">
              <a href={`tel:${CONTACT.hotline.tel}`} className={LINK}>
                {CONTACT.hotline.display}
              </a>{" "}
              ({CONTACT.hotline.person})
            </Line>
          </ul>
        </div>
      </div>
      <div className="border-t border-plum-900/10">
        <p className="mx-auto max-w-[1440px] px-6 py-5 text-xs text-plum-900/60 lg:px-10">
          © Hội Sinh viên trường Đại học Ngoại thương · BFF – Big Fat Family
        </p>
      </div>
    </footer>
  );
}
