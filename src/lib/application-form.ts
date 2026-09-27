/**
 * The application form, transcribed from the 2025 Wix form's own schema.
 *
 * Structure notes worth keeping:
 *  - A Ban's question set can only ever be answered once. "Em muốn ứng tuyển
 *    vào Ban nào khác" never offers the Ban already chosen, so nguyện vọng 2 is
 *    always a different Ban from nguyện vọng 1. That means each Ban needs one
 *    set of field names, not one per round — which is why this is 27 columns
 *    where the Wix form carried 47 mostly-empty ones.
 *  - Every branch question is an essay. The Wix schema had most of them as
 *    single-line TEXT_INPUT; they are textareas here, because a paragraph
 *    answer typed into a one-line box is miserable.
 */

export const SCHEMA_VERSION = 1;
export const DRAFT_KEY = `hsvftu-don-draft-v${SCHEMA_VERSION}`;

export const BAN_TO_CHUC = "Ban Tổ chức";
export const BAN_TRUYEN_THONG = "Ban Truyền thông";
export const BAN_DOI_NGOAI = "Ban Đối ngoại";
export const KHONG = "Không";

export const ALL_BAN = [BAN_TO_CHUC, BAN_TRUYEN_THONG, BAN_DOI_NGOAI] as const;
export type Ban = (typeof ALL_BAN)[number];

export type FieldType =
  | "text"
  | "longtext"
  | "email"
  | "tel"
  | "url"
  | "date"
  | "radio"
  | "checkbox";

export type Field = {
  name: string;
  /** Verbatim from the Wix form. Doubles as the Sheet's column header. */
  label: string;
  type: FieldType;
  required: boolean;
  options?: readonly string[];
  placeholder?: string;
};

export type Answers = Record<string, string | string[]>;

/* ------------------------------------------------------------ step 1 */

export const COMMON_FIELDS: readonly Field[] = [
  { name: "ho_va_ten", label: "Họ và Tên", type: "text", required: true },
  {
    name: "gioi_tinh",
    label: "Giới tính",
    type: "radio",
    required: true,
    options: ["Nam", "Nữ"],
  },
  {
    name: "ngay_sinh",
    label: "Ngày, tháng, năm sinh",
    type: "date",
    required: true,
  },
  {
    name: "lop_chuyen_nganh_khoa",
    label: "Lớp - Chuyên ngành - Khoá",
    type: "text",
    required: true,
    placeholder: "VD: Anh 01 - Kinh tế đối ngoại - K65",
  },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "so_dien_thoai", label: "Số điện thoại", type: "tel", required: true },
  {
    name: "link_facebook",
    label: "Link Facebook",
    type: "url",
    required: true,
    placeholder: "https://facebook.com/...",
  },
  {
    name: "truong_thpt",
    label: "Trường THPT theo học",
    type: "text",
    required: true,
  },
  {
    name: "hoat_dong_ngoai_khoa",
    label: "Hoạt động ngoại khóa mà em từng tham gia?",
    type: "longtext",
    required: true,
  },
  {
    name: "thanh_tich",
    label: "Thành tích, giải thưởng mà em đã đạt được? (nếu có)",
    type: "longtext",
    required: true,
  },
  {
    name: "mot_tu_ve_ban_than",
    label:
      "Hãy dùng 1 từ để anh chị hiểu rõ nhất về bản thân em (giải thích vì sao)",
    type: "longtext",
    required: true,
  },
  {
    name: "thanh_tuu_ca_nhan",
    label:
      "Em hãy kể về một thành tựu cá nhân mà em cảm thấy tự hào và tâm đắc nhất? (giải thích vì sao)",
    type: "longtext",
    required: true,
  },
  {
    name: "nguyen_vong_1",
    label: "Em ứng tuyển vào Ban nào",
    type: "radio",
    required: true,
    options: ALL_BAN,
  },
];

/* ------------------------------------------------- per-Ban question sets */

const BTC_FIELDS: readonly Field[] = [
  {
    name: "btc_q1",
    label:
      "Em nghĩ công việc của Ban Tổ chức Hội Sinh viên bao gồm những gì, và em phù hợp với những công việc ấy như thế nào?",
    type: "longtext",
    required: true,
  },
  {
    name: "btc_q2",
    label:
      'Theo em, đâu là thước đo để đánh giá một sự kiện là "được tổ chức chuyên nghiệp"?',
    type: "longtext",
    required: true,
  },
  {
    name: "btc_q3",
    label:
      "Nếu được giao một công việc mà em chưa từng biết đến, hoặc chưa từng làm qua, em sẽ lựa chọn tự mình khám phá, tìm tòi, hay sẽ tham khảo những người đi trước để biết cách giải quyết? Vì sao?",
    type: "longtext",
    required: true,
  },
  {
    name: "btc_q4",
    label:
      "Nếu được chọn một bài hát để miêu tả những kỳ vọng của em về môi trường Đại học, em sẽ lựa chọn bài hát nào? Vì sao?",
    type: "longtext",
    required: true,
  },
];

const BTT_FIELDS: readonly Field[] = [
  {
    name: "btt_q1",
    label:
      "Theo em, Ban Truyền thông sẽ đảm nhận những công việc gì? Hãy đánh giá mức độ phù hợp của em theo các tiêu chí: (1) Tinh thần học hỏi, (2) Sự sáng tạo, (3) Trách nhiệm, (4) Khả năng hòa hợp. Em có thể đánh giá trên thang điểm 5 và vì sao?",
    type: "longtext",
    required: true,
  },
  {
    name: "btt_ky_nang",
    label: "Em đã có những kỹ năng truyền thông nào sau đây?",
    type: "checkbox",
    required: true,
    options: ["Viết lách", "Chụp ảnh", "Thiết kế"],
  },
  {
    name: "btt_q3",
    label:
      "Nếu em yêu thích công việc sáng tạo nội dung, nhiếp ảnh, quay phim, thiết kế hay mỹ thuật, hãy chia sẻ cho anh chị sản phẩm của em nhé? Nhớ là càng chi tiết càng tốt nhé!",
    type: "longtext",
    required: true,
  },
  {
    name: "btt_q4",
    label:
      "Theo em, chiến dịch truyền thông nào gần đây được xem là thành công và để lại cho em nhiều ấn tượng? Chia sẻ thêm với anh chị về chiến dịch đó và lý do em ấn tượng với nó nha.",
    type: "longtext",
    required: true,
  },
];

const BDN_FIELDS: readonly Field[] = [
  {
    name: "bdn_q1",
    label:
      "Theo em, công việc của Ban Đối ngoại ở trong 1 chương trình là gì? Em hãy đánh giá mức độ phù hợp của bản thân với những công việc đó.",
    type: "longtext",
    required: true,
  },
  {
    name: "bdn_q2",
    label:
      "Em mong muốn được học hỏi và phát triển những kỹ năng nào nhất khi lựa chọn tham gia vào Ban Đối ngoại?",
    type: "longtext",
    required: true,
  },
  {
    name: "bdn_q3",
    label:
      "Với tư cách là một nhân sự Ban Đối ngoại, em nghĩ bản thân cần chuẩn bị những gì để gây ấn tượng tốt với Nhà tài trợ trong buổi đầu gặp mặt?",
    type: "longtext",
    required: true,
  },
  {
    name: "bdn_q4",
    label:
      'Em hãy kể ra các lĩnh vực Nhà tài trợ phù hợp với Chương trình "Duyên dáng Ngoại thương - Beauty & Charm"',
    type: "longtext",
    required: true,
  },
];

export const QUESTIONS_BY_BAN: Record<Ban, readonly Field[]> = {
  [BAN_TO_CHUC]: BTC_FIELDS,
  [BAN_TRUYEN_THONG]: BTT_FIELDS,
  [BAN_DOI_NGOAI]: BDN_FIELDS,
};

export const NGUYEN_VONG_2 = "nguyen_vong_2";
export const LOI_NHAN = "loi_nhan";

const LOI_NHAN_FIELD: Field = {
  name: LOI_NHAN,
  label: "Em có điều gì gửi gắm tới anh chị không?",
  type: "longtext",
  required: false,
};

/** The second-choice question never offers the Ban already picked. */
export function nguyenVong2Field(nv1: Ban): Field {
  return {
    name: NGUYEN_VONG_2,
    label: "Em muốn ứng tuyển vào Ban nào khác không",
    type: "radio",
    required: true,
    options: [...ALL_BAN.filter((b) => b !== nv1), KHONG],
  };
}

/* ----------------------------------------------------------------- steps */

export type Step = {
  title: string;
  hint?: string;
  fields: readonly Field[];
  /**
   * The genuinely final step. Never infer this from the step count: the list
   * only grows as branches unlock, so on step 2 of 4 `steps.length` is still
   * 2 and the form would offer to submit itself half-finished.
   */
  terminal?: boolean;
};

export function buildSteps(answers: Answers): Step[] {
  const nv1 = answers.nguyen_vong_1 as Ban | undefined;
  const nv2 = answers[NGUYEN_VONG_2] as string | undefined;

  const steps: Step[] = [
    {
      title: "Thông tin chung",
      hint: "Một vài thông tin để anh chị làm quen với em.",
      fields: COMMON_FIELDS,
    },
  ];

  if (nv1 && QUESTIONS_BY_BAN[nv1]) {
    steps.push({
      title: "Bộ câu hỏi — Nguyện vọng 1",
      hint: nv1,
      fields: [...QUESTIONS_BY_BAN[nv1], nguyenVong2Field(nv1)],
    });
  }

  if (nv2 && nv2 !== KHONG && QUESTIONS_BY_BAN[nv2 as Ban]) {
    steps.push({
      title: "Bộ câu hỏi — Nguyện vọng 2",
      hint: nv2,
      fields: QUESTIONS_BY_BAN[nv2 as Ban],
    });
  }

  // Only offered once the path through the Ban questions is settled, so the
  // last step is never reachable before the branch above it is answered.
  if (nv2) {
    steps.push({
      title: "Lời nhắn",
      hint: "Phần này không bắt buộc.",
      fields: [LOI_NHAN_FIELD],
      terminal: true,
    });
  }

  return steps;
}

/**
 * Every column the Sheet can ever hold, in a fixed order, independent of which
 * branch an applicant took — the same way a Google Form keeps one column per
 * question and leaves the untaken branches blank.
 */
export const ALL_FIELDS: readonly Field[] = [
  ...COMMON_FIELDS,
  nguyenVong2Field(BAN_TO_CHUC),
  ...BTC_FIELDS,
  ...BTT_FIELDS,
  ...BDN_FIELDS,
  LOI_NHAN_FIELD,
];

/* ------------------------------------------------------------ validation */

export function isBlank(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) return value.length === 0;
  return !value || value.trim() === "";
}

/** Names of the required fields on this step that are still empty. */
export function missingOn(step: Step, answers: Answers): string[] {
  return step.fields
    .filter((f) => f.required && isBlank(answers[f.name]))
    .map((f) => f.name);
}

/** `2026-10-15` reads as `15/10/2026` in the Sheet, as Vietnamese dates do. */
function formatValue(field: Field, value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join(", ");
  if (!value) return "";
  if (field.type === "date") {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  }
  return value;
}

/**
 * The payload for the Sheet: keyed by the question text itself, so the script
 * on the other end stays dumb and the header row reads like a Google Form's.
 *
 * Answers belonging to a Ban that is no longer either choice are dropped. Some
 * one who fills in Ban Tổ chức, goes back and switches to Ban Truyền thông
 * leaves those first answers sitting in state — harmless to keep while they
 * edit, since that Ban may yet come back as nguyện vọng 2, but they must not
 * reach the Sheet under a Ban nobody applied to.
 */
export function toSubmission(answers: Answers) {
  const chosen = new Set(
    [answers.nguyen_vong_1, answers[NGUYEN_VONG_2]].filter(
      (b): b is Ban => typeof b === "string" && b in QUESTIONS_BY_BAN,
    ),
  );
  const dropped = new Set(
    ALL_BAN.filter((b) => !chosen.has(b)).flatMap((b) =>
      QUESTIONS_BY_BAN[b].map((f) => f.name),
    ),
  );

  const row: Record<string, string> = {};
  for (const field of ALL_FIELDS) {
    row[field.label] = dropped.has(field.name)
      ? ""
      : formatValue(field, answers[field.name]);
  }
  return row;
}
