/**
 * The /donoffonl form's questions. Same flow as the main đơn (nguyện vọng 1,
 * nguyện vọng 2, lời nhắn) with a shorter question set: the common step drops
 * three questions, and each Ban has its own short list.
 *
 * Answers land on their own tab ("donoffonl"), so field names here only have
 * to be unique within this form.
 */
import {
  BAN_DOI_NGOAI,
  BAN_TO_CHUC,
  BAN_TRUYEN_THONG,
  COMMON_FIELDS,
  SCALE_1_5,
  type Field,
  type FormSchema,
} from "@/lib/application-form";

/** Dropped from the common step on this form. */
const LEFT_OUT = new Set(["link_facebook", "thanh_tich", "thanh_tuu_ca_nhan"]);

const BTC: readonly Field[] = [
  {
    name: "btc_q1",
    label: "Theo em, yếu tố cần có nhất của một Cộng tác viên Ban Tổ chức là gì?",
    type: "longtext",
    required: true,
  },
  {
    name: "btc_q2",
    label: "Đâu là thước đo đánh giá chính xác nhất sự thành công của một chương trình?",
    type: "longtext",
    required: true,
  },
];

const BDN: readonly Field[] = [
  {
    name: "bdn_q1",
    label: "Ba từ em dùng để miêu tả chính mình khi làm việc với người khác là gì?",
    type: "longtext",
    required: true,
  },
  {
    name: "bdn_q2",
    label:
      "Em nghĩ điều gì khiến Ban Đối Ngoại khác biệt so với các Ban khác trong Hội Sinh viên?",
    type: "longtext",
    required: true,
  },
];

const RATING_QUESTION = "Em hãy chấm điểm những kỹ năng về truyền thông sau đây?";
const SKILLS = [
  ["btt_viet_lach", "Viết lách"],
  ["btt_quay_edit", "Quay và edit video"],
  ["btt_chup_anh", "Chụp ảnh"],
  ["btt_graphic", "Graphic design"],
] as const;

const BTT: readonly Field[] = [
  // Question 1: one mark out of 5 per skill, one Sheet column each.
  ...SKILLS.map(
    ([name, skill], i): Field => ({
      name,
      label: `${RATING_QUESTION} [${skill}]`,
      display: skill,
      heading: i === 0 ? RATING_QUESTION : undefined,
      type: "scale",
      required: true,
      options: SCALE_1_5,
    }),
  ),
  {
    name: "btt_q2",
    label: "Em hay dùng phần mềm, thiết bị nào để thực hiện các công việc trên?",
    type: "longtext",
    required: true,
  },
  {
    name: "btt_q3",
    label: "Hãy cho anh/chị biết tên 3 content creator mà em yêu thích?",
    type: "longtext",
    required: true,
  },
];

export const DONOFFONL_SCHEMA: FormSchema = {
  common: COMMON_FIELDS.filter((f) => !LEFT_OUT.has(f.name)),
  byBan: {
    [BAN_TO_CHUC]: BTC,
    [BAN_TRUYEN_THONG]: BTT,
    [BAN_DOI_NGOAI]: BDN,
  },
};
