import Image from "next/image";

/* ------------------------------------------------------------------ tokens
 * TODO(footer-bg): salmon sampled from the reference — confirm the exact hex.
 */
const TOKENS = {
  background: "#F6A9A0",
  heading: "#E0332B",
  text: "#C42B25",
} as const;

/** TODO(contact): confirm every link and the hotline before launch. */
const CONTACTS = [
  {
    icon: "facebook",
    label: "Fanpage",
    value: "https://bit.ly/hoisinhvienftu",
    href: "https://bit.ly/hoisinhvienftu",
  },
  {
    icon: "tiktok",
    label: "Tiktok",
    value: "https://bit.ly/tiktok_hsvftu",
    href: "https://bit.ly/tiktok_hsvftu",
  },
  {
    icon: "tiktok",
    label: "",
    value: "https://bit.ly/tiktokcuahsvftu",
    href: "https://bit.ly/tiktokcuahsvftu",
  },
  {
    icon: "youtube",
    label: "Youtube",
    value: "https://bit.ly/youtube_hsvftu",
    href: "https://bit.ly/youtube_hsvftu",
  },
  {
    icon: "mail",
    label: "Email",
    value: "hoisinhvien@ftu.edu.vn",
    href: "mailto:hoisinhvien@ftu.edu.vn",
  },
  {
    icon: "pin",
    label: "Địa chỉ",
    value:
      "Văn phòng Hội Sinh viên trường Đại học Ngoại thương - Tầng 1, Nhà B, 91 Chùa Láng, phường Láng, Hà Nội",
    href: null,
  },
  {
    icon: "phone",
    label: "Hotline",
    value: "(+84) 915 818 556 (Ms. Khánh Linh)",
    href: "tel:+84915818556",
  },
];

function ContactIcon({ name }: { name: string }) {
  const common = "h-5 w-5 shrink-0";
  switch (name) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="#1877F2" aria-hidden="true">
          <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="#010101" aria-hidden="true">
          <path d="M16.6 5.8a4.8 4.8 0 0 1-1.1-3.1h-3.3v13.2a2.9 2.9 0 1 1-2-2.8V9.7a6.2 6.2 0 1 0 5.3 6.1V9.4a8 8 0 0 0 4.6 1.5V7.6a4.8 4.8 0 0 1-3.5-1.8Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="#FF0000" aria-hidden="true">
          <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 3.9 12 3.9 12 3.9s-7.5 0-9.4.5A3 3 0 0 0 .5 6.5C0 8.4 0 12 0 12s0 3.6.5 5.5a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.5.5-5.5s0-3.6-.5-5.5ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <rect width="22" height="16" x="1" y="4" rx="3" fill="#E0332B" />
          <path d="M3 7.5 12 13l9-5.5" stroke="#fff" strokeWidth="1.8" fill="none" />
        </svg>
      );
    case "pin":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="#E0332B" aria-hidden="true">
          <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={common} fill="#E0332B" aria-hidden="true">
          <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .7-.2 1l-2.3 2.2Z" />
        </svg>
      );
  }
}

export default function SiteFooter() {
  return (
    <footer
      className="w-full px-6 py-12 md:px-10"
      style={{ backgroundColor: TOKENS.background }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        {/* Organisation marks */}
        <div className="flex items-center justify-center gap-6 lg:justify-start">
          <Image
            src="/logo-ftu.webp"
            alt="Trường Đại học Ngoại thương"
            width={300}
            height={300}
            className="h-20 w-20 object-contain md:h-24 md:w-24"
          />
          <Image
            src="/logo-hsvvn.webp"
            alt="Hội Sinh viên Việt Nam"
            width={300}
            height={300}
            className="h-20 w-20 object-contain md:h-24 md:w-24"
          />
          <Image
            src="/logo-bff.png"
            alt="BFF — Hội Sinh viên trường ĐH Ngoại thương"
            width={1902}
            height={827}
            className="h-14 w-auto object-contain md:h-16"
          />
        </div>

        {/* Contact */}
        <ul
          className="flex flex-col gap-2 text-sm font-bold lg:max-w-md"
          style={{ color: TOKENS.text }}
        >
          {CONTACTS.map((item) => (
            <li key={item.value} className="flex items-start gap-2">
              <span className="mt-0.5">
                <ContactIcon name={item.icon} />
              </span>
              <span className="leading-snug">
                {item.label && <>{item.label}: </>}
                {item.href ? (
                  <a
                    href={item.href}
                    className="underline-offset-2 hover:underline"
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
