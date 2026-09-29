/* eslint-disable @next/next/no-img-element */
import { APPLY_HREF, CONTACT } from "@/lib/site";

const LINKS = [
  { label: "Giới thiệu", href: "#gioi-thieu" },
  { label: "Các sự kiện chính", href: "#su-kien" },
  { label: "Lời nhắn gửi", href: "#loi-nhan" },
  { label: "Chọn nhân vật", href: "#nhan-vat" },
  { label: "Hành trình ứng tuyển", href: "#hanh-trinh" },
  { label: "Điền đơn", href: APPLY_HREF },
];

export default function Footer() {
  return (
    <footer className="bg-plum-900 text-pink-100">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-12 pt-20 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <div className="flex items-center gap-4">
            <img src="/logo-bff.png" alt="BFF — Big Fat Family" className="h-12 w-auto rounded-lg bg-white/95 p-1.5" />
            <img src="/logo-ftu.webp" alt="Trường Đại học Ngoại thương" className="size-12" />
            <img src="/logo-hsvvn.webp" alt="Hội Sinh viên Việt Nam" className="size-12" />
          </div>
          <p className="mt-6 max-w-[34ch] font-display text-2xl leading-snug text-white">
            Hội Sinh viên trường Đại học Ngoại thương
          </p>
          <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-pink-100/75">{CONTACT.address}</p>
        </div>

        <nav aria-label="Liên kết trong trang">
          <h2 className="font-display text-lg text-white">Khám phá</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="underline-offset-4 transition-colors hover:text-white hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-lg text-white">Liên hệ</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="underline-offset-4 transition-colors hover:text-white hover:underline">
                {CONTACT.email}
              </a>
            </li>
            {CONTACT.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-6 py-6 text-xs text-pink-100/60 lg:px-10">
          © 2026 Hội Sinh viên trường Đại học Ngoại thương · BFF – Big Fat Family
        </p>
      </div>
    </footer>
  );
}
