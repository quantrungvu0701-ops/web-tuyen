// Single source of truth for every piece of real-world data this site needs.
// BCH: search this file for "TODO" and replace each one — nothing else in the
// codebase should need editing to launch with real content.

export const siteConfig = {
  orgName: "Hội Sinh viên trường Đại học Ngoại thương",
  orgShortName: "HSV FTU",

  // TODO: confirm the incoming cohort code (e.g. "K65") with BCH before launch.
  freshmanCohort: "K...",

  // TODO: replace with the real Google Form URL. Both CTA buttons on the page
  // read from this single constant, so updating it here updates the whole site.
  googleFormUrl: "https://forms.gle/TODO-REPLACE-WITH-REAL-FORM-URL",

  // TODO: confirm the real application deadline with BCH (ISO 8601, GMT+7).
  applicationDeadline: "2026-10-18T23:59:59+07:00",

  // TODO: fanpage URL, contact email and office location are all placeholders.
  contact: {
    fanpageUrl: "https://www.facebook.com/TODO-fanpage",
    email: "TODO@ftu.edu.vn",
    officeLocation: "[TODO: ví dụ — Tầng 1, Nhà B, Đại học Ngoại thương]",
  },
} as const;

export type Stat = {
  value: string;
  label: string;
};

// TODO: insert real numbers from BCH. Do not replace "[TODO]" with an invented
// figure — an honest placeholder is more trustworthy than a made-up stat.
export const trustStats: Stat[] = [
  { value: "[TODO]", label: "năm hoạt động" },
  { value: "[TODO]", label: "thành viên hiện tại" },
  { value: "[TODO]", label: "ban chuyên môn" },
  { value: "[TODO]", label: "thành tích tiêu biểu" },
];

export type Benefit = {
  title: string;
  description: string;
};

// TODO: these outcome descriptions are reasonable drafts, not verified
// quotes or figures. Swap in specific, real outcomes from past members
// before launch (e.g. an event they ran, a company they connected with).
export const benefits: Benefit[] = [
  {
    title: "Kỹ năng tổ chức sự kiện",
    description:
      "Từ lên kế hoạch đến vận hành thực tế — bạn trực tiếp đứng sau những sự kiện quy mô hàng trăm người, không chỉ ngồi nghe lý thuyết.",
  },
  {
    title: "Networking với doanh nghiệp & alumni",
    description:
      "Tiếp xúc trực tiếp với đối tác doanh nghiệp và mạng lưới cựu thành viên đã đi làm — những mối quan hệ khó có được nếu chỉ học trên giảng đường.",
  },
  {
    title: "Một dòng CV nổi bật",
    description:
      "Kinh nghiệm điều phối dự án, làm việc nhóm áp lực cao và ra quyết định thực tế — đúng thứ nhà tuyển dụng tìm kiếm ở một sinh viên năm nhất.",
  },
  {
    title: "Một cộng đồng thật sự",
    description:
      "Những người bạn cùng thức khuya chuẩn bị sự kiện, cùng ăn mừng khi hoàn thành — cộng đồng gắn bó trong suốt hành trình đại học của bạn.",
  },
];

export type Department = {
  name: string;
  description: string;
  skills: string[];
};

// TODO: verify these 2-3 line descriptions and skill tags with each ban's
// trưởng ban — they're accurate-in-spirit drafts, not confirmed final copy.
export const departments: Department[] = [
  {
    name: "Ban Tổ chức",
    description:
      "Đứng sau hậu trường của mọi sự kiện lớn nhỏ của Hội — từ lên kịch bản, điều phối nhân sự đến xử lý tình huống phát sinh ngay tại chỗ.",
    skills: ["Lập kế hoạch sự kiện", "Quản lý thời gian", "Xử lý tình huống"],
  },
  {
    name: "Ban Đối ngoại",
    description:
      "Cầu nối giữa Hội với doanh nghiệp, cựu sinh viên và các tổ chức bên ngoài — nơi bạn học cách đàm phán, thuyết trình và xây dựng quan hệ đối tác.",
    skills: ["Đàm phán & thuyết trình", "Xây dựng quan hệ đối tác", "Ngoại ngữ ứng dụng"],
  },
  {
    name: "Ban Truyền thông",
    description:
      "Kể câu chuyện của Hội tới hàng nghìn sinh viên — từ sản xuất nội dung, thiết kế hình ảnh đến lên chiến lược truyền thông cho từng chiến dịch.",
    skills: ["Sáng tạo nội dung", "Thiết kế & hình ảnh", "Chiến lược truyền thông"],
  },
];

export type Testimonial = {
  // TODO: every field below is a placeholder. Replace with a real quote and
  // real attribution from a member who actually said it — never fabricate.
  quote: string;
  name: string;
  role: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "[TODO: trích dẫn cảm nhận thật từ một tân sinh viên năm ngoái đã tham gia HSV — ví dụ điều gì khiến bạn ấy quyết định nộp đơn, và trải nghiệm sau khi vào Hội.]",
    name: "[TODO: Họ và tên]",
    role: "[TODO: Ban ..., K...]",
  },
  {
    quote:
      "[TODO: trích dẫn cảm nhận thật từ một thành viên khác — có thể tập trung vào một khoảnh khắc hoặc sự kiện cụ thể đáng nhớ.]",
    name: "[TODO: Họ và tên]",
    role: "[TODO: Ban ..., K...]",
  },
  {
    quote:
      "[TODO: trích dẫn cảm nhận thật, ví dụ về kỹ năng hoặc mối quan hệ mà thành viên đó có được nhờ tham gia Hội.]",
    name: "[TODO: Họ và tên]",
    role: "[TODO: Ban ..., K...]",
  },
];

export type TimelineStep = {
  title: string;
  description: string;
  date: string;
};

// TODO: insert the real dates for each round from BCH.
export const timelineSteps: TimelineStep[] = [
  {
    title: "Nộp đơn",
    description: "Điền đơn ứng tuyển qua Google Form kèm thông tin cơ bản và nguyện vọng ban.",
    date: "[TODO]",
  },
  {
    title: "Vòng phỏng vấn",
    description: "Trò chuyện trực tiếp cùng BCH để hiểu hơn về bạn và định hướng phù hợp.",
    date: "[TODO]",
  },
  {
    title: "Vòng Teamwork",
    description: "Thử thách làm việc nhóm thực tế — nơi bạn thể hiện cách tư duy và phối hợp.",
    date: "[TODO]",
  },
  {
    title: "Kết quả",
    description: "Công bố kết quả và chào đón thành viên mới chính thức gia nhập HSV FTU.",
    date: "[TODO]",
  },
];

export type FaqItem = {
  question: string;
  answer: string;
};

// TODO: review these draft answers and add/adjust questions based on what
// BCH actually gets asked each year.
export const faqItems: FaqItem[] = [
  {
    question: "Mình chưa có kinh nghiệm thì có nộp được không?",
    answer:
      "Hoàn toàn được. HSV FTU tuyển thành viên dựa trên tinh thần chủ động và mong muốn học hỏi, không yêu cầu kinh nghiệm hoạt động trước đó. Mọi kỹ năng sẽ được đào tạo và tích lũy dần trong quá trình tham gia.",
  },
  {
    question: "Vào Hội có mất nhiều thời gian không?",
    answer:
      "Khối lượng công việc thay đổi theo từng giai đoạn — có tuần bận rộn khi chuẩn bị sự kiện lớn, có tuần nhẹ nhàng hơn. BCH luôn ưu tiên cân bằng để thành viên vẫn đảm bảo việc học trên lớp.",
  },
  {
    question: "Mình học ở cơ sở khác có tham gia được không?",
    answer:
      "Có. Nhiều hoạt động của Hội được tổ chức linh hoạt để thành viên ở các cơ sở khác nhau đều có thể tham gia và đóng góp.",
  },
];
