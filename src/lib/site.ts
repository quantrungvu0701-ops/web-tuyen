/**
 * Every piece of copy and data the landing page shows, in one place.
 *
 * Anything in [BRACKETS] is a placeholder waiting for real content — search
 * this file for "[" to find them all. Dates, round names, Ban copy and
 * contacts are real (from the Thế hệ 24 key visual, the brief, and last
 * year's site).
 */

export const GENERATION = 24;

export const APPLY_HREF = "/don";

/* ------------------------------------------------------------------ rounds */

export type Round = {
  name: string;
  /** As printed on the key visual. */
  date: string;
  /** One line under the name. */
  blurb: string;
  photo?: string;
};

export const ROUNDS: Round[] = [
  {
    name: "Vòng đơn",
    date: "01/10 – 20/10",
    blurb: "[Một câu giới thiệu vòng đơn]",
  },
  {
    name: "Vòng phỏng vấn định hướng",
    date: "23/10 – 24/10",
    blurb: "[Một câu giới thiệu vòng phỏng vấn định hướng]",
  },
  {
    name: "Vòng teamwork",
    date: "27/10 – 01/11",
    blurb: "[Một câu giới thiệu vòng teamwork]",
  },
  {
    name: "Vòng phỏng vấn cá nhân",
    date: "07/11",
    blurb: "[Một câu giới thiệu vòng phỏng vấn cá nhân]",
  },
  {
    name: "Vòng hội nhập",
    // Not on the key visual — the one date still to confirm.
    date: "[Ngày]",
    blurb: "[Một câu giới thiệu vòng hội nhập]",
  },
];

/* --------------------------------------------------------------------- Ban */

export type Character = {
  id: "playmaker" | "connector" | "creator";
  title: string;
  ban: string;
  tagline: string;
  body: string;
  lamp: "red" | "yellow" | "green";
};

/** The brief's own words, verbatim. */
export const CHARACTERS: Character[] = [
  {
    id: "playmaker",
    title: "The Playmaker",
    ban: "Ban Tổ chức",
    tagline: "Bạn là người khiến cuộc chơi bắt đầu.",
    body: "Bạn thích biến một ý tưởng thành một hành trình thật sự. Từ những mảnh ghép nhỏ, bạn sắp xếp mọi thứ để cuộc chơi diễn ra đúng lúc, đúng chỗ và thật đáng nhớ.",
    lamp: "red",
  },
  {
    id: "connector",
    title: "The Connector",
    ban: "Ban Đối ngoại",
    tagline: "Bạn mở khóa những người đồng đội mới.",
    body: "Bạn luôn biết cách bắt đầu một cuộc trò chuyện, kết nối những con người khác nhau và mở ra những cơ hội bất ngờ. Với bạn, càng nhiều connection, map càng rộng.",
    lamp: "yellow",
  },
  {
    id: "creator",
    title: "The Creator",
    ban: "Ban Truyền thông",
    tagline: "Bạn khiến cuộc chơi được nhìn thấy.",
    body: "Bạn bắt được những khoảnh khắc đáng nhớ và biến chúng thành điều mọi người muốn xem, muốn share, muốn nhớ. Một chút sáng tạo, một chút tinh tế và cả một thế giới được kể lại theo cách của bạn.",
    lamp: "green",
  },
];

/* ------------------------------------------------------------------ events */

export type EventItem = { name: string; body: string; photos?: string[] };
export type EventCategory = { title: string; events: EventItem[] };

/** The four categories on the signpost, in sign order. Copy is the brief's. */
export const EVENTS: EventCategory[] = [
  {
    title: "Chương trình\nchính trị",
    events: [
      {
        name: "Phong trào Sinh viên 5 tốt",
        body: "Hành trình hoàn thiện bản thân trên 5 tiêu chí: Đạo đức tốt – Học tập tốt – Thể lực tốt – Tình nguyện tốt – Hội nhập tốt. Hội Sinh viên trường Đại học Ngoại thương là đơn vị đồng hành cùng sinh viên trên hành trình chinh phục danh hiệu và tôn vinh những tấm gương tiêu biểu, xuất sắc dựa trên 5 tiêu chí trên, qua 2 sự kiện chính là \"Tuần lễ Sinh viên 5 tốt\" và \"Lễ tuyên dương Sinh viên 5 tốt các cấp và khen thưởng các Chi hội xuất sắc\".",
      },
      {
        name: "Đại hội Đại biểu Hội Sinh viên Việt Nam trường Đại học Ngoại thương",
        body: "Sự kiện chính trị quan trọng của Hội Sinh viên trường Đại học Ngoại thương, được tổ chức nhằm tổng kết hoạt động của nhiệm kỳ vừa qua và đề ra phương hướng cho nhiệm kỳ mới. Đây cũng là dịp ghi nhận những cá nhân có đóng góp xuất sắc cho phong trào sinh viên.",
      },
      {
        name: "Hội nghị Kiện toàn Ban Chấp hành, Ban Thư ký, Ban Kiểm tra và các chức danh chủ chốt Hội Sinh viên trường Đại học Ngoại thương",
        body: "Cột mốc chuyển giao và kiện toàn bộ máy Hội Sinh viên trường Đại học Ngoại thương, nơi Ban Chấp hành, Ban Thư ký, Ban Kiểm tra và các chức danh chủ chốt được hiệp thương cho nhiệm kỳ mới, đồng thời tổng kết hoạt động của nhiệm kỳ trước.",
      },
    ],
  },
  {
    title: "Chương trình\nsân khấu",
    events: [
      {
        name: "Duyên dáng Ngoại thương – Beauty & Charm",
        body: "Cuộc thi sắc đẹp được tổ chức 2 năm một lần bởi Hội Sinh viên trường Đại học Ngoại thương, với sứ mệnh tìm kiếm và tôn vinh vẻ đẹp, trí tuệ, tài năng và bản lĩnh của nữ sinh Ngoại thương. Là một trong những chương trình sân khấu quy mô lớn của trường, chương trình thu hút sự quan tâm của đông đảo sinh viên trong và ngoài trường cũng như cộng đồng yêu thích các cuộc thi sắc đẹp.",
      },
      {
        name: "TEDx FTUHanoi",
        body: "Thực hiện sứ mệnh “Ideas change everything” và được tổ chức theo quy chuẩn quốc tế của TED, là nơi kết nối và chia sẻ những câu chuyện truyền cảm hứng với các giá trị tích cực, chương trình khơi dậy niềm tin, động lực và những góc nhìn mới trong mỗi cá nhân, góp phần xây dựng một xã hội phát triển toàn diện và bền vững.",
      },
      {
        name: "HOTSTEPS",
        body: "Là sân chơi với quy mô toàn miền Bắc, được phối hợp tổ chức bởi Hội Sinh viên trường Đại học Ngoại thương và FTU's Dancing Club 2 năm một lần. Đây là cơ hội cho những người trẻ đam mê nhảy múa gặp gỡ, giao lưu và cháy hết mình với sáng tạo và bản lĩnh, đồng thời truyền tải những lý tưởng sống qua từng bước nhảy.",
      },
      {
        name: "Cuộc thi Âm nhạc Soul of Melody",
        body: "Là cuộc thi âm nhạc không chuyên lớn nhất toàn miền Bắc dành cho học sinh, sinh viên được Hội Sinh viên trường Đại học Ngoại thương phối hợp cùng CLB Âm nhạc tổ chức. Đây là nơi những giọng ca trẻ thể hiện cá tính, tỏa sáng và theo đuổi niềm đam mê âm nhạc.",
      },
    ],
  },
  {
    title: "Chương trình\ntình nguyện",
    events: [
      {
        name: "Mùa hè Xanh",
        body: "Được tổ chức thường niên mỗi dịp hè, là chương trình tình nguyện dài ngày mang đến những trải nghiệm khó quên cho sinh viên trường Đại học Ngoại thương, đồng thời là cầu nối giữa tuổi trẻ Ngoại thương với cộng đồng, xã hội.",
      },
      {
        name: "Ngày hội hiến máu toàn trường Đại học Ngoại thương – Happy Day",
        body: "Được phối hợp tổ chức bởi Hội Sinh viên trường Đại học Ngoại thương và CLB Kết nối trái tim – Đội máu Ngoại thương (CHC), nơi những giọt máu được trao đi để tiếp thêm hy vọng cho người bệnh, đồng thời lan tỏa tinh thần sẻ chia, trách nhiệm với cộng đồng và giúp sinh viên rèn luyện, hoàn thiện bản thân.",
      },
    ],
  },
  {
    title: "Chương trình\nnội bộ",
    events: [
      {
        name: "Training toàn Hội",
        body: "Là dịp để các BFFers khoá mới cùng nhau làm nóng tinh thần, khám phá văn hoá Hội và gắn kết với đại gia đình BFF. Không chỉ là một buổi training, đây còn là cơ hội để các em làm quen, thể hiện màu sắc riêng và cùng nhau tạo nên những khoảnh khắc thật đáng nhớ.",
      },
      {
        name: "Noel toàn Hội",
        body: "Đêm hội Giáng sinh thường niên dành riêng cho đại gia đình BFF, nơi những phần quà bất ngờ, những tiết mục văn nghệ và giải trí đặc sắc trở thành kỷ niệm đáng nhớ. Noel cũng là sự kiện đánh dấu mốc đầu tiên trong hành trình của một BFFer mà các Cộng tác viên \"tân binh\" được tự lên ý tưởng và thực hiện.",
      },
      {
        name: "Sinh nhật Hội",
        body: "Là dấu mốc hằng năm ghi nhận hành trình cống hiến và trưởng thành của Hội Sinh viên trường Đại học Ngoại thương. Đây là dịp các thế hệ Cộng tác viên cùng trở về, ôn lại những kỷ niệm đáng nhớ, chia sẻ và gắn kết trong không gian ấm cúng, đồng thời tiếp thêm ngọn lửa nhiệt huyết cho nhau để sẵn sàng chào đón một tuổi mới.",
      },
      {
        name: "Du xuân",
        body: "Là một nét văn hóa đặc trưng của BFF với chuyến đi đầu Xuân dành riêng cho các thành viên. Đây là dịp để mọi người cùng quây quần, trò chuyện, lưu giữ kỷ niệm và bắt đầu một năm mới thật rực rỡ bên nhau.",
      },
    ],
  },
];

/* ----------------------------------------------------------------- leaders */

/**
 * The fifth sign on the events pole: projects rather than events, so they get
 * the KV's mirrors (a photo each, and a button out to the project's page)
 * instead of a gallery.
 *
 * TODO(links): the project pages' real URLs.
 * TODO(photos): the original artwork; these are cropped from last year's site.
 */
export type SupportProject = { name: string; image: string; href: string };
export const SUPPORT_PROJECTS: { title: string; projects: SupportProject[] } = {
  title: "Các dự án\nhỗ trợ sinh viên",
  projects: [
    { name: "Lost and Found", image: "/projects/lost-and-found.webp", href: "#" },
    { name: "FTU Act for Change", image: "/projects/act-for-change.webp", href: "#" },
  ],
};

export type Leader = {
  name: string;
  role: string;
  message: string;
  photo?: string;
};

/** TODO(content): the 8 leaders — presidents and heads of department. */
export const LEADERS: Leader[] = Array.from({ length: 8 }, (_, i) => ({
  name: `[Họ và tên ${i + 1}]`,
  role: "[Chức vụ]",
  message:
    "[Lời nhắn gửi tới các em K65 — khoảng hai đến bốn câu, viết như đang nói chuyện trực tiếp với một em tân sinh viên.]",
}));

/* ----------------------------------------------------------------- contact */

/** From last year's site. */
export const CONTACT = {
  email: "hoisinhvien@ftu.edu.vn",
  address: "Trường Đại học Ngoại thương, 91 Chùa Láng, Đống Đa, Hà Nội",
  socials: [
    { label: "Fanpage", href: "https://bit.ly/hoisinhvienftu" },
    { label: "TikTok", href: "https://bit.ly/tiktok_hsvftu" },
    { label: "YouTube", href: "https://bit.ly/youtube_hsvftu" },
  ],
};
