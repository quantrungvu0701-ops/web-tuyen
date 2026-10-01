/**
 * Every piece of copy and data the landing page shows, in one place.
 *
 * Anything in [BRACKETS] is a placeholder waiting for real content — search
 * this file for "[" to find them all. Dates, round names, Ban copy and
 * contacts are real (from the Thế hệ 24 key visual, the brief, and last
 * year's site).
 */

export const GENERATION = 24;

export const APPLY_HREF = "/dondangky";

/* ------------------------------------------------------------------ rounds */

export type Round = {
  name: string;
  /** As printed on the key visual. */
  date: string;
  /** One line under the name. */
  blurb: string;
  /** The round's level name, handwritten beside its photo. */
  level: string;
  photo?: string;
  /**
   * A video for the round, opened from a play button on its photo: a YouTube
   * link (watch, share or embed) or a direct .mp4. An empty string shows the
   * button with a "coming soon" note.
   */
  video?: string;
};

export const ROUNDS: Round[] = [
  {
    name: "Vòng đơn",
    photo: "/rounds/vong-1.webp",
    level: "Sign Bi up",
    date: "01/10 – 20/10",
    blurb: "[Một câu giới thiệu vòng đơn]",
  },
  {
    name: "Vòng phỏng vấn định hướng",
    photo: "/rounds/vong-2.webp",
    level: "No StandBi Zone",
    date: "23/10 – 24/10",
    blurb: "[Một câu giới thiệu vòng phỏng vấn định hướng]",
  },
  {
    name: "Vòng teamwork",
    photo: "/rounds/vong-3.webp",
    level: "Bye Bistander",
    date: "27/10 – 01/11",
    blurb: "[Một câu giới thiệu vòng teamwork]",
    // Unlisted on the Hội's YouTube.
    video: "https://youtu.be/YiYlTfBX5uY",
  },
  {
    name: "Vòng phỏng vấn cá nhân",
    photo: "/rounds/vong-4.webp",
    level: "Bipassers Only",
    date: "07/11",
    blurb: "[Một câu giới thiệu vòng phỏng vấn cá nhân]",
  },
  {
    name: "Chào mừng em về với\nđại gia đình BFF",
    photo: "/rounds/vong-5.webp",
    level: "Bi-yond the Lane",
    // The welcome, not a round: no date.
    date: "",
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
  /** TODO(photos): one picture of the Ban at work, 4:3. */
  photo?: string;
};

/** The brief's own words, verbatim. */
export const CHARACTERS: Character[] = [
  {
    id: "playmaker",
    title: "The Playmaker",
    ban: "Ban Tổ chức",
    photo: "/ban/to-chuc-v3.webp",
    tagline: "Bạn là người khơi mào cuộc chơi.",
    body: "Bạn thích biến một ý tưởng thành một hành trình thật sự. Từ những mảnh ghép nhỏ, bạn sắp xếp mọi thứ để cuộc chơi diễn ra đúng lúc, đúng chỗ và thật đáng nhớ.",
    lamp: "red",
  },
  {
    id: "connector",
    title: "The Connector",
    ban: "Ban Đối ngoại",
    photo: "/ban/doi-ngoai-v3.webp",
    tagline: "Bạn kết nối những người đồng đội mới.",
    body: "Bạn luôn biết cách bắt đầu một cuộc trò chuyện, kết nối những con người khác nhau và mở ra những cơ hội bất ngờ. Với bạn, càng nhiều kết nối, cuộc chơi càng thành công.",
    lamp: "green",
  },
  {
    id: "creator",
    title: "The Creator",
    ban: "Ban Truyền thông",
    photo: "/ban/truyen-thong.webp",
    tagline: "Bạn khiến cuộc chơi được lan rộng.",
    body: "Bạn bắt được những khoảnh khắc đáng nhớ và biến chúng thành điều mọi người muốn xem, muốn chia sẻ, muốn nhớ. Một chút sáng tạo, một chút tinh tế và cả cuộc chơi được kể lại theo cách của bạn.",
    lamp: "yellow",
  },
];

/* ------------------------------------------------------------------ events */

/** A sub-event, shown in a "Xem thêm" window under its parent event. */
export type EventDetail = { name: string; body: string };
export type EventItem = { name: string; body: string; photos?: string[]; more?: EventDetail[] };
export type EventCategory = { title: string; events: EventItem[] };

/** The four categories on the signpost, in sign order. Copy is the brief's. */
export const EVENTS: EventCategory[] = [
  {
    title: "Chương trình\nchính trị",
    events: [
      {
        name: "Phong trào Sinh viên 5 tốt",
        more: [
          { name: "Tuần lễ Sinh viên 5 tốt trường Đại học Ngoại thương", body: "Là chuỗi hoạt động được tổ chức nhằm tạo môi trường rèn luyện toàn diện cho sinh viên trên hành trình chinh phục danh hiệu “Sinh viên 5 tốt”. Thông qua các hoạt động đa dạng, sinh viên có cơ hội giao lưu, trau dồi đạo đức, nâng cao thể lực, phát triển kỹ năng và tăng cường năng lực hội nhập. Chương trình đồng thời giúp sinh viên từng bước hoàn thiện các tiêu chí của danh hiệu, qua đó khuyến khích tinh thần chủ động rèn luyện và phát triển bản thân." },
          {
            name: "Lễ Kỷ niệm Ngày truyền thống học sinh, sinh viên và Hội Sinh viên Việt Nam, Tuyên dương Sinh viên 5 tốt các cấp và Khen thưởng Chi hội xuất sắc trường Đại học Ngoại thương",
            body: "Là chương trình thường niên được tổ chức nhằm tuyên dương những sinh viên đạt danh hiệu “Sinh viên 5 tốt” các cấp - những cá nhân tiêu biểu trong học tập, rèn luyện và hoạt động phong trào. Qua đó, chương trình góp phần tạo động lực để sinh viên Ngoại thương tiếp tục phấn đấu, phát triển toàn diện trong những năm tháng đại học.",
          },
        ],
        photos: ["/events/sv5t-1.webp", "/events/sv5t-2-v2.webp", "/events/sv5t-3-v2.webp", "/events/sv5t-4.webp", "/events/sv5t-5.webp", "/events/sv5t-6.webp"],
        body: "Hành trình hoàn thiện bản thân trên 5 tiêu chí: Đạo đức tốt – Học tập tốt – Thể lực tốt – Tình nguyện tốt – Hội nhập tốt. Hội Sinh viên trường Đại học Ngoại thương là đơn vị đồng hành cùng sinh viên trên hành trình chinh phục danh hiệu và tôn vinh những tấm gương tiêu biểu, xuất sắc dựa trên 5 tiêu chí trên, với 2 sự kiện chính là \"Tuần lễ Sinh viên 5 tốt trường Đại học Ngoại thương\" và \"Lễ Kỷ niệm Ngày truyền thống học sinh, sinh viên và Hội Sinh viên Việt Nam, Tuyên dương Sinh viên 5 tốt các cấp và Khen thưởng Chi hội xuất sắc trường Đại học Ngoại thương\".",
      },
      {
        name: "Đại hội đại biểu Hội Sinh viên Việt Nam trường Đại học Ngoại thương",
        photos: ["/events/dai-hoi-1.webp", "/events/dai-hoi-2.webp", "/events/dai-hoi-3.webp"],
        body: "Sự kiện chính trị quan trọng của Hội Sinh viên trường Đại học Ngoại thương, được tổ chức nhằm tổng kết hoạt động của nhiệm kỳ vừa qua và đề ra nhiệm vụ, phương hướng cho nhiệm kỳ mới. Đây cũng là dịp ghi nhận những cá nhân có đóng góp xuất sắc cho công tác Hội và phong trào sinh viên, đồng thời kiện toàn và hoàn chỉnh bộ máy Ban Chấp hành Hội Sinh viên trường.",
      },
      {
        name: "Hội nghị Kiện toàn Ban Chấp hành, Ban Thư ký, Ban Kiểm tra và các chức danh chủ chốt Hội Sinh viên trường Đại học Ngoại thương",
        photos: ["/events/hoi-nghi-1.webp", "/events/hoi-nghi-2.webp", "/events/hoi-nghi-3.webp"],
        body: "Cột mốc chuyển giao và kiện toàn bộ máy Hội Sinh viên trường Đại học Ngoại thương giữa nhiệm kỳ, nơi Ban Chấp hành, Ban Thư ký, Ban Kiểm tra và các chức danh chủ chốt được hiệp thương cho giai đoạn mới, đồng thời tổng kết hoạt động của giai đoạn trước.",
      },
    ],
  },
  {
    title: "Chương trình\nsân khấu",
    events: [
      {
        name: "Duyên dáng Ngoại thương – Beauty & Charm",
        photos: ["/events/bnc-1.webp", "/events/bnc-2.webp", "/events/bnc-3.webp"],
        body: "Cuộc thi sắc đẹp được tổ chức 2 năm một lần bởi Hội Sinh viên trường Đại học Ngoại thương, với sứ mệnh tìm kiếm và tôn vinh vẻ đẹp, trí tuệ, tài năng và bản lĩnh của sinh viên Ngoại thương. Là một trong những chương trình sân khấu có quy mô lớn, chương trình thu hút sự quan tâm của đông đảo sinh viên trong và ngoài trường cũng như cộng đồng yêu thích các cuộc thi sắc đẹp.",
      },
      {
        name: "TEDx FTUHanoi",
        photos: ["/events/tedx-1.webp", "/events/tedx-2.webp", "/events/tedx-3.webp"],
        body: "Thực hiện sứ mệnh “Ideas change everything” và được tổ chức theo quy chuẩn quốc tế của TED, là nơi kết nối và chia sẻ những câu chuyện truyền cảm hứng với các giá trị tích cực, chương trình khơi dậy niềm tin, động lực và những góc nhìn mới trong mỗi cá nhân, góp phần xây dựng một xã hội phát triển toàn diện và bền vững.",
      },
      {
        name: "HOTSTEPS",
        photos: ["/events/hotsteps-1.webp", "/events/hotsteps-2.webp", "/events/hotsteps-3.webp"],
        body: "Là sân chơi với quy mô toàn miền Bắc, chương trình được phối hợp tổ chức bởi Hội Sinh viên trường Đại học Ngoại thương và FTU's Dancing Club 2 năm một lần. Đây là cơ hội cho những người trẻ đam mê nhảy được gặp gỡ, giao lưu và cháy hết mình với sáng tạo và bản lĩnh, đồng thời truyền tải những lý tưởng sống qua từng bước nhảy.",
      },
      {
        name: "Cuộc thi Âm nhạc Soul of Melody",
        photos: ["/events/som-1.webp", "/events/som-2.webp", "/events/som-3.webp"],
        body: "Là cuộc thi âm nhạc không chuyên lớn nhất toàn miền Bắc dành cho học sinh, sinh viên được Hội Sinh viên trường Đại học Ngoại thương phối hợp cùng FTU Music Club tổ chức. Đây là nơi những giọng ca trẻ thể hiện cá tính, tỏa sáng và theo đuổi niềm đam mê âm nhạc.",
      },
    ],
  },
  {
    title: "Chương trình\ntình nguyện",
    events: [
      {
        name: "Mùa hè Xanh",
        photos: ["/events/mhx-1-v2.webp", "/events/mhx-2.webp", "/events/mhx-3.webp"],
        body: "Được tổ chức thường niên mỗi dịp hè, là chương trình tình nguyện mang đến những trải nghiệm khó quên cho sinh viên trường Đại học Ngoại thương, đồng thời là cầu nối giữa tuổi trẻ Ngoại thương với cộng đồng, xã hội.",
      },
      {
        name: "Ngày hội hiến máu toàn trường Đại học Ngoại thương – Happy Day",
        photos: ["/events/happy-day-1.webp", "/events/happy-day-2.webp", "/events/happy-day-3.webp"],
        body: "Được phối hợp tổ chức bởi Hội Sinh viên trường Đại học Ngoại thương và CLB Kết nối trái tim – Đội máu Ngoại thương (CHC), nơi những giọt máu được trao đi để tiếp thêm hy vọng cho người bệnh, đồng thời lan tỏa tinh thần sẻ chia, trách nhiệm với cộng đồng và giúp sinh viên rèn luyện, hoàn thiện bản thân.",
      },
    ],
  },
  {
    title: "Chương trình\nnội bộ",
    events: [
      {
        name: "Sinh nhật Hội",
        photos: ["/events/sinh-nhat-1.webp", "/events/sinh-nhat-2.webp", "/events/sinh-nhat-3.webp"],
        body: "Là dấu mốc hằng năm ghi nhận hành trình cống hiến và trưởng thành của Hội Sinh viên trường Đại học Ngoại thương. Đây là dịp các thế hệ Cộng tác viên cùng trở về, ôn lại những kỷ niệm đáng nhớ, chia sẻ và gắn kết trong không gian ấm cúng, đồng thời tiếp thêm ngọn lửa nhiệt huyết cho nhau để sẵn sàng chào đón một tuổi mới.",
      },
      {
        name: "Training toàn Hội",
        photos: ["/events/training-1.webp", "/events/training-2.webp", "/events/training-3.webp"],
        body: "Là dịp để các BFFers khoá mới cùng nhau làm nóng tinh thần, khám phá văn hoá Hội và gắn kết với đại gia đình BFF. Không chỉ là một buổi training, đây còn là cơ hội để các em làm quen, thể hiện màu sắc riêng và cùng nhau tạo nên những khoảnh khắc thật đáng nhớ.",
      },
      {
        name: "Noel toàn Hội",
        photos: ["/events/noel-1.webp", "/events/noel-2.webp", "/events/noel-3.webp"],
        body: "Đêm hội Giáng sinh thường niên dành riêng cho đại gia đình BFF, nơi những phần quà bất ngờ, những tiết mục văn nghệ và giải trí đặc sắc trở thành kỷ niệm đáng nhớ. Noel cũng là sự kiện đánh dấu mốc đầu tiên trong hành trình của một BFFer mà các \"tân binh\" được tự lên ý tưởng và thực hiện.",
      },
      {
        name: "Du xuân",
        photos: ["/events/du-xuan-1.webp", "/events/du-xuan-2.webp", "/events/du-xuan-3.webp"],
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
 * Links go to each project's Facebook page.
 * TODO(photos): the original artwork; these are cropped from last year's site.
 */
export type SupportProject = { name: string; image: string; href: string };
export const SUPPORT_PROJECTS: { title: string; projects: SupportProject[] } = {
  title: "Các dự án\nhỗ trợ sinh viên",
  projects: [
    { name: "FTU Lost and Found", image: "/projects/lost-and-found-v2.webp", href: "https://web.facebook.com/share/g/19SZeWAeK2/" },
    { name: "FTU Act for Change", image: "/projects/act-for-change-v3.webp", href: "https://web.facebook.com/share/p/18Ef27FRfa/" },
  ],
};

export type Leader = {
  name: string;
  message: string;
  photo?: string;
};

/** TODO(content): the 8 leaders — presidents and heads of department. */
const LEADER_NAMES: [string, string, string][] = [
  ["Anh Lam Duy", "lam-duy", "Được đồng hành cùng Hội, cùng BFF có lẽ là điều tuyệt vời nhất trong khoảng thời gian 4 năm Đại học của anh. Hội chờ đón các em về nhà!"],
  ["Chị Hà Linh", "ha-linh", "Mong các em hãy thật tự tin, toả sáng và thể hiện được chất riêng của mình. Anh chị chờ các em về nhà!"],
  ["Chị Uyên Chi", "uyen-chi", "Nếu có một chút hồi hộp, mong các em nhớ rằng anh chị cũng đang háo hức được gặp mình. Cứ tự tin chia sẻ nhé, chúc các em thể hiện thật tốt những điều đã chuẩn bị!"],
  ["Chị Mai Trang", "mai-trang", "Mong những điều các em đã chuẩn bị đều được thể hiện thật trọn vẹn, những điều bất ngờ đều trở thành bất ngờ dễ thương. Chúc các em may mắn, anh chị chờ đón em!"],
  ["Chị Mẫn Nhi", "man-nhi", "Hy vọng hành trình sắp tới sẽ cho các em thật nhiều kỷ niệm đẹp, dù kết quả thế nào thì cứ tận hưởng hết mình nhé!"],
  ["Chị Hà My", "ha-my", "Mong các em sẽ cùng Ban Tổ chức tạo nên thật nhiều chương trình chỉn chu, đáng nhớ và đầy tiếng cười trong những năm tháng ở FTU nhé!"],
  ["Chị Bích Ngọc", "bich-ngoc", "Hy vọng Ban Truyền thông sẽ là nơi để các em thỏa sức sáng tạo, kể thật nhiều câu chuyện hay và lưu lại những khoảnh khắc đẹp cùng Hội."],
  ["Anh Đức Minh", "duc-minh", "Chúc các em khi đến với Ban Đối ngoại sẽ có thật nhiều cơ hội gặp gỡ, kết nối và mở ra những trải nghiệm mới thật thú vị!"],
];

export const LEADERS: Leader[] = LEADER_NAMES.map(([name, file, message]) => ({
  name,
  photo: `/leaders/${file}-v3.webp`,
  message,
}));

/* ----------------------------------------------------------------- contact */

/** From last year's site. */
export const CONTACT = {
  fanpage: "https://www.facebook.com/bigfatfamily",
  youtube: "https://youtube.com/@hoisinhvienftu?si=6mqdWs5KuPOzK6I5",
  tiktok: "https://www.tiktok.com/@ftu.hsv?lang=vi-VN",
  email: "hoisinhvien@ftu.edu.vn",
  address:
    "Văn phòng Hội Sinh viên trường Đại học Ngoại thương – Tầng 1, Nhà B, 91 Chùa Láng, phường Láng, Hà Nội",
  hotline: { display: "(+84) 973 301 835", tel: "+84973301835", person: "Mr. Lam Duy" },
};

/**
 * Nhà tài trợ, by tier. Logo heights follow the tier scale the club uses:
 * Bạc 0.8, Đồng 0.6, Đồng hành 0.4 of the institutional logos' height.
 */
export type Sponsor = { name: string; logo: string };
export const SPONSORS: { tier: string; scale: number; logos: Sponsor[] }[] = [
  { tier: "NTT Bạc", scale: 0.8, logos: [{ name: "Lan Tiên", logo: "/sponsors/lan-tien.webp" }] },
  {
    tier: "NTT Đồng",
    scale: 0.6,
    logos: [
      { name: "Vietint", logo: "/sponsors/vietint.webp" },
      { name: "MSB", logo: "/sponsors/msb.webp" },
    ],
  },
  {
    tier: "NTT Đồng hành",
    scale: 0.4,
    logos: [
      { name: "ToCoToCo", logo: "/sponsors/tocotoco.webp" },
      { name: "Sửa chữa Laptop 24h", logo: "/sponsors/laptop24h.webp" },
    ],
  },
];
