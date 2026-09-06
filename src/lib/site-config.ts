// Single source of truth for every piece of real-world data this site needs.
// BCH: search this file for "TODO" and replace each one — nothing else in the
// codebase should need editing to launch with real content.

export const siteConfig = {
  orgName: "Hội Sinh viên trường Đại học Ngoại thương",
  orgShortName: "HSV FTU",

  // TODO: confirm the incoming cohort code (e.g. "K65") with BCH before launch.
  freshmanCohort: "K65",

  // TODO: replace with the real Google Form URL. Every "Đăng ký ngay" button
  // on the site reads from this single constant.
  googleFormUrl: "https://forms.gle/TODO-REPLACE-WITH-REAL-FORM-URL",

  // TODO: confirm the real application deadline with BCH (ISO 8601, GMT+7).
  applicationDeadline: "2026-10-18T23:59:59+07:00",

  // TODO: fanpage URL, contact email, hotline and socials are placeholders.
  contact: {
    hotline: "[TODO: (+84) số hotline] (Ms. [TODO])",
    email: "TODO@ftu.edu.vn",
    facebookUrl: "https://www.facebook.com/TODO-fanpage",
    tiktokUrl: "https://www.tiktok.com/@TODO",
    instagramUrl: "https://www.instagram.com/TODO",
    threadsUrl: "https://www.threads.net/@TODO",
  },
} as const;

/* ------------------------------------------------------------------ *
 * 1. Hero — promo banner for the side event
 * ------------------------------------------------------------------ */

export const promoBanner = {
  // TODO: drop the side-event banner artwork in as public/promo-banner.png
  // (wide strip, transparent or full-bleed). Until then a placeholder strip
  // renders in its place.
  imageSrc: "/promo-banner.png",
  alt: "[TODO: tên sự kiện bên lề]",
  href: "/skbl",
} as const;

/* ------------------------------------------------------------------ *
 * 2. About
 * ------------------------------------------------------------------ */

export const about = {
  label: "About us",
  paragraphs: [
    "Hội Sinh viên trường Đại học Ngoại thương được thành lập ngày 15 tháng 03 năm 2003, là một tổ chức Chính trị - Xã hội trực thuộc Hội Sinh viên Việt Nam.",
    "Hội Sinh viên trường Đại học Ngoại thương là tổ chức đại diện cho ngôi nhà chung BFF – Big Fat Family – với 3 Ban và 2 Câu lạc bộ trực thuộc.",
  ],
  // TODO: replace with a real photo of the Hội (public/about.jpg).
  imageSrc: "/about.jpg",
  imageAlt: "[TODO: mô tả ảnh tập thể HSV FTU]",
} as const;

/* ------------------------------------------------------------------ *
 * 3. Events
 * ------------------------------------------------------------------ */

export type EventImage = {
  /** 1–28, matches public/images/events/<n>.jpg so files are easy to drop in. */
  index: number;
  caption: string;
  href: string;
};

export type EventRow = {
  title: string;
  /** Label alignment; images scroll the opposite way. */
  align: "left" | "right";
  direction: "right" | "left";
  images: EventImage[];
};

// TODO: every caption and "see more" link below is a placeholder. Images are
// numbered 1–28 — drop files in as public/images/events/1.jpg … 28.jpg.
function makeImages(from: number, to: number): EventImage[] {
  return Array.from({ length: to - from + 1 }, (_, i) => ({
    index: from + i,
    caption: `[TODO: tên sự kiện ${from + i}]`,
    href: "https://example.com/TODO",
  }));
}

export const eventRows: EventRow[] = [
  {
    title: "Chương trình chính trị",
    align: "left",
    direction: "right",
    images: makeImages(1, 8),
  },
  {
    title: "Chương trình sân khấu",
    align: "right",
    direction: "left",
    images: makeImages(9, 16),
  },
  {
    title: "Chương trình thiện nguyện",
    align: "left",
    direction: "right",
    images: makeImages(17, 22),
  },
  {
    title: "Chương trình nội bộ",
    align: "right",
    direction: "left",
    images: makeImages(23, 28),
  },
];

export type SupportProject = {
  name: string;
  imageSrc: string;
  href: string;
};

// TODO: swap in the real project artwork and links.
export const supportProjects: SupportProject[] = [
  {
    name: "FTU Lost and Found",
    imageSrc: "/images/projects/lost-and-found.jpg",
    href: "https://example.com/TODO",
  },
  {
    name: "FTU Act for Change",
    imageSrc: "/images/projects/act-for-change.jpg",
    href: "https://example.com/TODO",
  },
];

/* ------------------------------------------------------------------ *
 * 4. Bộ 7 — Big Fat Family
 * ------------------------------------------------------------------ */

export type Member = {
  id: string;
  name: string;
  role: string;
  /** public/images/members/<id>.png — transparent cut-out works best. */
  imageSrc: string;
};

// TODO: replace names A–G with the real BCH members and drop their cut-out
// portraits in as public/images/members/a.png … g.png.
export const topRowMembers: Member[] = [
  { id: "a", name: "A", role: "Phó chủ tịch", imageSrc: "/images/members/a.png" },
  { id: "b", name: "B", role: "Phó chủ tịch", imageSrc: "/images/members/b.png" },
  { id: "c", name: "C", role: "Phó chủ tịch", imageSrc: "/images/members/c.png" },
  { id: "d", name: "D", role: "Phó chủ tịch", imageSrc: "/images/members/d.png" },
];

export const bottomRowMembers: Member[] = [
  { id: "e", name: "E", role: "Trưởng Ban đối ngoại", imageSrc: "/images/members/e.png" },
  { id: "f", name: "F", role: "Trưởng Ban tổ chức", imageSrc: "/images/members/f.png" },
  { id: "g", name: "G", role: "Trưởng Ban truyền thông", imageSrc: "/images/members/g.png" },
];

/* ------------------------------------------------------------------ *
 * 5. Ba ban — the bottom row morphs into these, E → F → G, left to right
 * ------------------------------------------------------------------ */

export type Department = {
  /** Matches the member id it morphs from. */
  memberId: string;
  name: string;
};

export const departments: Department[] = [
  { memberId: "e", name: "Đối ngoại" },
  { memberId: "f", name: "Tổ chức" },
  { memberId: "g", name: "Truyền thông" },
];

/* ------------------------------------------------------------------ *
 * 6. Tuyển
 * ------------------------------------------------------------------ */

export type RecruitStep = {
  name: string;
  /** Shown when the step is hovered or tapped. */
  duration: string;
};

// TODO: confirm the five round names and their real dates with BCH.
export const recruitSteps: RecruitStep[] = [
  { name: "Mở đơn", duration: "[TODO: ngày – ngày]" },
  { name: "Hạn nộp đơn", duration: "[TODO: ngày]" },
  { name: "Vòng phỏng vấn", duration: "[TODO: ngày – ngày]" },
  { name: "Vòng Teamwork", duration: "[TODO: ngày – ngày]" },
  { name: "Kết quả", duration: "[TODO: ngày]" },
];

export const recruitVideos = {
  // TODO: replace with the real YouTube video IDs (the part after "v=").
  main: {
    youtubeId: "TODO_VIDEO_ID",
    title: "[TODO: tiêu đề video giới thiệu]",
  },
  mv: {
    heading: `MV dành cho ${siteConfig.freshmanCohort}`,
    youtubeId: "TODO_MV_VIDEO_ID",
    title: `[TODO: tiêu đề MV dành cho ${siteConfig.freshmanCohort}]`,
  },
} as const;
