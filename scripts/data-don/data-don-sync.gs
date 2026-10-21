/**
 * DATA ĐƠN — the review sheet for vòng đơn.
 *
 * Reads the two input tabs of the "Respond" Sheet (never writes to it) and
 * builds one tab per Ban here, one row per applicant:
 *
 *   Ban Tổ chức · Ban Truyền thông · Ban Đối ngoại  — who applied to that Ban,
 *       their info, then their ONLINE answers, then their OFFLINE answers,
 *       and a "Kết quả vòng 1" dropdown for the reviewers.
 *   Kiểm tra  — every merge the script made and everything it wants a human
 *       to look at (3-Ban applicants, same phone but different name, ...).
 *
 * Re-running is safe: the reviewers' "Kết quả vòng 1" and "Ghi chú" are read
 * first and written back onto the same applicant, matched by the hidden ID
 * column at the far right.
 *
 * ── Setup ────────────────────────────────────────────────────────────────
 * 1. Create a new Google Sheet named "DATA ĐƠN" (same account that owns
 *    "Respond").
 * 2. Extensions → Apps Script. Delete what is there, paste this file, Save.
 * 3. Reload the Sheet. A "HSV" menu appears → "Cập nhật dữ liệu".
 *    The first run asks for permission (it needs to read "Respond").
 * 4. Run it again any time new answers arrive. Nothing else to deploy.
 */

/** The input Sheet ("Respond"). Read only. */
var RESPOND_ID = '1WchE0gdV7sqJzry1zJucX0wFdLeTs0nZlN8vIDnD53Y';
var ONLINE_TAB = 'Đơn ứng tuyển';
var OFFLINE_TAB = 'donoffonl';

var BAN_TC = 'Ban Tổ chức';
var BAN_TT = 'Ban Truyền thông';
var BAN_DN = 'Ban Đối ngoại';
var BANS = [BAN_TC, BAN_TT, BAN_DN];
var KHONG = 'Không';

var RESULT_OPTIONS = ['Trượt', 'Pending', 'Đỗ', 'Off', 'Onl + Off'];
var AUTO_RESULTS = ['', 'Off', 'Onl + Off'];
var RESULT_COLORS = {
  'Trượt': ['#F4C7C3', '#8C1D18'],
  'Pending': ['#FCE8B2', '#7A5300'],
  'Đỗ': ['#B7E1CD', '#0B5C36'],
  'Off': ['#C9DAF8', '#1C3F8A'],
  'Onl + Off': ['#D9D2E9', '#4A2A7A'],
};

/*
 * Columns are found by the start of their header text, not by position: the
 * Respond tabs grew a column whenever a question's wording changed (the
 * "Thành tích" question has two columns online), so positions are not stable.
 * Every key below lists the header beginnings it accepts.
 */
var INFO = [
  ['Họ và tên', ['Họ và Tên']],
  ['Giới tính', ['Giới tính']],
  ['Ngày sinh', ['Ngày, tháng, năm sinh']],
  ['Lớp - Chuyên ngành - Khoá', ['Lớp - Chuyên ngành']],
  ['Email', ['Email']],
  ['Số điện thoại', ['Số điện thoại']],
  ['Link Facebook', ['Link Facebook']],
  ['Trường THPT', ['Trường THPT']],
];

/** Per source: the shared questions, then each Ban's own, in the form's order. */
var SOURCES = {
  online: {
    tab: ONLINE_TAB,
    label: 'ĐƠN ONLINE',
    common: [
      'Hoạt động ngoại khóa mà em từng tham gia?',
      'Thành tích, giải thưởng mà em đã đạt được?',
      'Hãy dùng 1 từ để anh chị hiểu rõ nhất về bản thân em',
      'Em hãy kể về một thành tựu cá nhân',
    ],
    ban: {},
  },
  offline: {
    tab: OFFLINE_TAB,
    label: 'ĐƠN OFFLINE',
    common: [
      'Hoạt động ngoại khóa mà em từng tham gia?',
      'Hãy dùng 1 từ để anh chị hiểu rõ nhất về bản thân em',
    ],
    ban: {},
  },
};
SOURCES.online.ban[BAN_TC] = [
  'Theo em, công việc của Ban Tổ chức Hội Sinh viên',
  'Nghĩ về một sự kiện em từng tham dự',
  'Em phụ trách điều phối MC chính',
  'Nếu 4 năm Đại học của em có một bài hát chủ đề',
];
SOURCES.online.ban[BAN_TT] = [
  'Theo em, Ban Truyền thông sẽ đảm nhận những công việc gì?',
  'Em có những kỹ năng truyền thông nào sau đây?',
  'Nếu em đã từng tham gia vào các hoạt động sáng tạo',
  'Em hay dùng thiết bị nào để thực hiện ấn phẩm',
  'Nếu em phải kể về Ban Truyền thông',
];
SOURCES.online.ban[BAN_DN] = [
  'Theo em, công việc của Ban Đối ngoại ở trong một chương trình',
  'Em mong muốn được học hỏi và phát triển những kỹ năng nào',
  'Với tư cách là một nhân sự Ban Đối ngoại',
  'Nếu được phân công tìm kiếm nhà tài trợ',
];
SOURCES.offline.ban[BAN_TC] = [
  'Theo em, yếu tố cần có nhất của một Cộng tác viên Ban Tổ chức',
  'Đâu là thước đo đánh giá chính xác nhất',
];
SOURCES.offline.ban[BAN_TT] = [
  'Em hãy chấm điểm những kỹ năng về truyền thông sau đây? [Viết lách]',
  'Em hãy chấm điểm những kỹ năng về truyền thông sau đây? [Quay và edit video]',
  'Em hãy chấm điểm những kỹ năng về truyền thông sau đây? [Chụp ảnh]',
  'Em hãy chấm điểm những kỹ năng về truyền thông sau đây? [Graphic design]',
  'Em hay dùng phần mềm, thiết bị nào',
  'Hãy cho anh/chị biết tên 3 content creator',
];
SOURCES.offline.ban[BAN_DN] = [
  'Ba từ em dùng để miêu tả chính mình',
  'Em nghĩ điều gì khiến Ban Đối Ngoại khác biệt',
];
var LOI_NHAN = 'Em có điều gì gửi gắm tới anh chị không?';
var NV1 = 'Chọn ban em muốn ứng tuyển';
var NV2 = 'Em có muốn ứng tuyển vào ban nào khác không?';
var TIME = 'Thời gian gửi';

/* ------------------------------------------------------------------ menu */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('HSV')
    .addItem('Cập nhật dữ liệu', 'syncAll')
    .addItem('Tạo dropdown chọn Ban trong Respond (chạy 1 lần)', 'setupRespondDropdowns')
    .addToUi();
}

/* ------------------------------------------------------------------ main */

function syncAll() {
  var lock = LockService.getDocumentLock();
  lock.waitLock(60000);
  try {
    var src = SpreadsheetApp.openById(RESPOND_ID);
    var subs = readSource(src, 'online').concat(readSource(src, 'offline'));
    var people = groupPeople(subs);

    var out = SpreadsheetApp.getActiveSpreadsheet();
    var counts = BANS.map(function (ban) {
      return writeBanTab(out, ban, people);
    });
    colorNguyenVong(out);
    addSummaryRows(out);
    writeResultTabs(out);
    var old = out.getSheetByName('Kiểm tra');
    if (old) out.deleteSheet(old);

    var first = out.getSheetByName('Sheet1') || out.getSheetByName('Trang tính1');
    if (first && first.getLastRow() === 0 && out.getSheets().length > 1) out.deleteSheet(first);

    SpreadsheetApp.getActive().toast(
      BANS.map(function (b, i) { return b + ': ' + counts[i]; }).join(' · '),
      'Đã cập nhật', 10
    );
  } finally {
    lock.releaseLock();
  }
}

/* -------------------------------------------------------------- reading */

/** Every submission of one source tab as { source, time, info, nv, common, ban, loiNhan }. */
function readSource(ss, source) {
  var cfg = SOURCES[source];
  var sh = ss.getSheetByName(cfg.tab);
  if (!sh || sh.getLastRow() < 2) return [];

  var range = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn());
  var display = range.getDisplayValues();
  var raw = range.getValues();
  var headers = display[0];

  // All columns whose header starts with `prefix` — "Thành tích" online has two.
  function cols(prefix) {
    var p = norm(prefix);
    var found = [];
    headers.forEach(function (h, i) {
      if (norm(h).indexOf(p) === 0) found.push(i);
    });
    return found;
  }
  function pick(row, prefix) {
    var c = cols(prefix);
    for (var i = 0; i < c.length; i++) {
      var v = String(row[c[i]]).trim();
      if (v) return v;
    }
    return '';
  }

  var timeCol = cols(TIME)[0];
  var subs = [];
  for (var r = 1; r < display.length; r++) {
    var row = display[r];
    if (!row.join('').trim()) continue;

    var timeText = timeCol === undefined ? '' : String(row[timeCol]).trim();
    var info = {};
    INFO.forEach(function (f) {
      info[f[0]] = pick(row, f[1][0]).replace(/[ 	]+/g, ' ');
    });

    var nv1 = banName(pick(row, NV1));
    var nv2 = banName(pick(row, NV2));
    var nv = {};
    if (nv1) nv[nv1] = 'NV1';
    if (nv2) nv[nv2] = 'NV2';

    var ban = {};
    BANS.forEach(function (b) {
      ban[b] = cfg.ban[b].map(function (q) { return pick(row, q); });
    });

    subs.push({
      source: source,
      row: r + 1,
      time: submissionTime(timeCol === undefined ? '' : raw[r][timeCol], timeText, r),
      timeText: timeText,
      info: info,
      dob: info['Ngày sinh'],
      sex: info['Giới tính'],
      nv: nv,
      common: cfg.common.map(function (q) { return pick(row, q); }),
      ban: ban,
      loiNhan: pick(row, LOI_NHAN),
    });
  }
  return subs;
}

/* -------------------------------------------------------------- matching */

/**
 * When a row was sent. A typed-in row may leave the time blank (or type it as
 * text, dd/mm/yyyy): blank counts as "typed in later than the rows above it",
 * in the order the rows are written, so the lower row wins a tie.
 */
function submissionTime(value, text, rowIndex) {
  if (value instanceof Date && !isNaN(value)) return value;
  var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(text);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  return new Date(4102444800000 + rowIndex * 1000);
}

/** "ban tổ chức ", "BAN TỔ CHỨC" -> the Ban's proper name; anything else -> ''. */
function banName(text) {
  var n = norm(text);
  for (var i = 0; i < BANS.length; i++) if (norm(BANS[i]) === n) return BANS[i];
  return '';
}

function norm(s) {
  return String(s || '').normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
}
function normName(s) {
  return norm(s);
}
/** 0912 345 678, +84912345678 and 912345678 (Sheets drops the 0) are one number. */
function normPhone(s) {
  var d = String(s || '').replace(/\D/g, '');
  if (d.indexOf('84') === 0 && d.length >= 11) d = d.slice(2);
  d = d.replace(/^0+/, '');
  return d.length >= 8 ? d : '';
}
function normEmail(s) {
  return norm(s);
}
/** facebook.com/x, https://www.facebook.com/x/?locale=vi and m.facebook.com/x are one link. */
function normFb(s) {
  var u = norm(s).replace(/^https?:\/\//, '').replace(/^(www\.|m\.|web\.)/, '');
  if (u.indexOf('facebook.com/profile.php') === 0) {
    var id = /[?&]id=(\d+)/.exec(u);
    return id ? 'fb:' + id[1] : '';
  }
  u = u.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return u.indexOf('facebook.com/') === 0 && u.length > 'facebook.com/'.length ? u : '';
}

/**
 * Test rows to leave out entirely, by email. Not real applicants.
 */
var EXCLUDE_EMAILS = ['quantrungvu0701@gmail.com', 'ok@gmail.com'];

/**
 * Decisions taken by hand: each entry is one person. Every submission whose
 * phone or email matches any key in the entry is merged into that person,
 * whatever the name or birthday says. Keys: 'p:<phone>' or 'e:<email>'.
 */
var MANUAL_SAME = [];

/** 6/1/2008, 06/01/2008 and a real date cell are one birthday. */
function normDob(s) {
  var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim());
  return m ? (+m[1]) + '/' + (+m[2]) + '/' + m[3] : norm(s);
}

/**
 * The rule: same name, phone, birthday and sex is one person (all four must be
 * filled in). Anything looser is a human's call — see MANUAL_SAME.
 */
function groupPeople(subs) {
  subs = subs.filter(function (s) {
    return EXCLUDE_EMAILS.indexOf(normEmail(s.info['Email'])) === -1;
  });
  var parent = subs.map(function (_, i) { return i; });
  function find(i) { return parent[i] === i ? i : (parent[i] = find(parent[i])); }
  function union(a, b) { parent[find(a)] = find(b); }

  var first = {};
  function link(key, i) {
    if (first[key] === undefined) first[key] = i;
    else union(i, first[key]);
  }
  subs.forEach(function (s, i) {
    var n = normName(s.info['Họ và tên']);
    var p = normPhone(s.info['Số điện thoại']);
    var d = s.dob ? normDob(s.dob) : '';
    var x = norm(s.sex);
    if (n && p && d && x) link('id:' + [n, p, d, x].join('|'), i);

    var e = normEmail(s.info['Email']);
    MANUAL_SAME.forEach(function (entry, m) {
      var hit = entry.some(function (k) {
        var kind = k.slice(0, 2), val = k.slice(2);
        return kind === 'p:' ? (p && normPhone(val) === p) : (e && normEmail(val) === e);
      });
      if (hit) link('manual:' + m, i);
    });
  });

  var groups = {};
  subs.forEach(function (s, i) {
    var g = find(i);
    (groups[g] = groups[g] || []).push(s);
  });
  var people = Object.keys(groups).map(function (g) { return buildPerson(groups[g]); });
  people.sort(function (a, b) { return a.firstTime - b.firstTime; });
  return people;
}

/**
 * One applicant from all their submissions. The latest submission wins for
 * their info (email included: only the newest one is kept) and shared
 * answers; each Ban's answers come from the latest submission that applied
 * to that Ban; the Ban list is every Ban they ever applied to.
 */
function buildPerson(subs) {
  subs.sort(function (a, b) { return a.time - b.time; });
  var latest = subs[subs.length - 1];
  var online = subs.filter(function (s) { return s.source === 'online'; });
  var offline = subs.filter(function (s) { return s.source === 'offline'; });

  var info = {};
  INFO.forEach(function (f) {
    var k = f[0];
    info[k] = latest.info[k];
    if (!info[k]) {
      for (var i = subs.length - 1; i >= 0; i--) if (subs[i].info[k]) { info[k] = subs[i].info[k]; break; }
    }
  });

  var bans = {};
  subs.forEach(function (s) { Object.keys(s.nv).forEach(function (b) { bans[b] = true; }); });

  return {
    id: idFor(subs[0]),
    info: info,
    subs: subs,
    firstTime: subs[0].time,
    bans: bans,
    online: sideFor(online),
    offline: sideFor(offline),
  };
}

/** One source's answers for a person: shared ones from the latest, each Ban's from the latest that chose it. */
function sideFor(subs) {
  if (!subs.length) return null;
  var latest = subs[subs.length - 1];
  var side = { time: latest.timeText, common: latest.common, loiNhan: latest.loiNhan, ban: {}, nv: {}, times: {}, order: nvOrder(latest) };
  BANS.forEach(function (b) {
    for (var i = subs.length - 1; i >= 0; i--) {
      if (subs[i].nv[b]) {
        side.ban[b] = subs[i].ban[b];
        side.nv[b] = subs[i].nv[b];
        side.times[b] = subs[i].timeText;
        return;
      }
    }
  });
  return side;
}

/** [NV1, NV2] of one submission, in the order the applicant chose them. */
function nvOrder(s) {
  var order = ['', ''];
  Object.keys(s.nv).forEach(function (b) { order[s.nv[b] === 'NV1' ? 0 : 1] = b; });
  return order;
}

/**
 * The person's NV1 / NV2 for the info columns — the same in every Ban tab.
 * Online and offline usually agree; when they don't, both are shown, tagged.
 */
function nvText(p, i) {
  var on = p.online ? p.online.order[i] : '';
  var off = p.offline ? p.offline.order[i] : '';
  if (!p.online) return off;
  if (!p.offline || on === off) return on;
  return [on && on + ' (Onl)', off && off + ' (Off)'].filter(String).join('\n');
}

/** Stable across re-runs: the person's first submission. */
function idFor(s) {
  var who = normEmail(s.info['Email']) || normPhone(s.info['Số điện thoại']);
  return (s.source === 'online' ? 'ON' : 'OFF') + '|' + s.timeText + '|' + who + '|' + normName(s.info['Họ và tên']);
}

/* -------------------------------------------------------------- writing */

function writeBanTab(ss, ban, people) {
  var on = SOURCES.online, off = SOURCES.offline;
  var onCols = ['Thời gian gửi']
    .concat(['Hoạt động ngoại khóa', 'Thành tích, giải thưởng', '1 từ về bản thân', 'Thành tựu cá nhân'])
    .concat(on.ban[ban]).concat(['Lời nhắn']);
  var offCols = ['Thời gian gửi']
    .concat(['Hoạt động ngoại khóa', '1 từ về bản thân'])
    .concat(off.ban[ban].map(function (q) {
      return q.replace('Em hãy chấm điểm những kỹ năng về truyền thông sau đây? ', 'Chấm điểm ');
    }))
    .concat(['Lời nhắn']);
  var infoCols = INFO.map(function (f) { return f[0]; }).concat(['Nguyện vọng 1', 'Nguyện vọng 2']);
  var lead = ['Kết quả vòng 1', 'Ghi chú'];
  var header = lead.concat(infoCols, onCols, offCols, ['ID']);
  var width = header.length;

  var sh = ss.getSheetByName(ban) || ss.insertSheet(ban);
  removeSummaryRow(sh);
  var kept = readMarks(sh);

  var rows = [];
  people.forEach(function (p) {
    var o = p.online && p.online.ban[ban] ? p.online : null;
    var f = p.offline && p.offline.ban[ban] ? p.offline : null;
    if (!o && !f) return;

    var def = o && f ? 'Onl + Off' : f ? 'Off' : '';
    var mark = kept[p.id] || { result: '', note: '' };
    // Blank, Off and Onl + Off are the script's own labels and follow the
    // data; Trượt, Pending and Đỗ are a reviewer's decision and are kept.
    var result = AUTO_RESULTS.indexOf(mark.result) !== -1 ? def : mark.result;

    var row = [result, mark.note];
    infoCols.forEach(function (k) {
      if (k === 'Nguyện vọng 1') row.push(nvText(p, 0));
      else if (k === 'Nguyện vọng 2') row.push(nvText(p, 1) || KHONG);
      else row.push(k === 'Số điện thoại' ? phoneText(p.info[k]) : p.info[k]);
    });
    if (o) {
      row = row.concat([o.times[ban]], o.common, o.ban[ban], [o.loiNhan]);
    } else {
      row = row.concat(blank(onCols.length));
    }
    if (f) {
      row = row.concat([f.times[ban]], f.common, f.ban[ban], [f.loiNhan]);
    } else {
      row = row.concat(blank(offCols.length));
    }
    row.push(p.id);
    rows.push(row);
  });

  // Rebuild from scratch: values, formats, rules, protection.
  sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(function (pr) { pr.remove(); });
  if (sh.getFilter()) sh.getFilter().remove();
  sh.getRange(1, 1, 1, sh.getMaxColumns()).breakApart();
  sh.setFrozenColumns(0);
  sh.showColumns(1, sh.getMaxColumns());
  sh.clear();
  sh.clearConditionalFormatRules();
  sh.getDataRange().clearDataValidations();
  if (sh.getMaxColumns() < width) sh.insertColumnsAfter(sh.getMaxColumns(), width - sh.getMaxColumns());
  var needRows = rows.length + 2;
  if (sh.getMaxRows() < needRows) sh.insertRowsAfter(sh.getMaxRows(), needRows - sh.getMaxRows());

  // Row 1: the groups. Row 2: the questions. The first group also takes the
  // name column, so the frozen edge (after the name) never cuts a merge.
  var infoStart = lead.length + 1;
  var frozen = lead.length + 1;
  var onStart = infoStart + infoCols.length;
  var offStart = onStart + onCols.length;
  var groupRow = blank(width);
  groupRow[0] = 'ỨNG VIÊN';
  groupRow[frozen] = 'THÔNG TIN';
  groupRow[onStart - 1] = on.label;
  groupRow[offStart - 1] = off.label;
  sh.getRange(1, 1, 1, width).setValues([groupRow]);
  sh.getRange(2, 1, 1, width).setValues([header]);
  if (rows.length) sh.getRange(3, 1, rows.length, width).setValues(rows);

  [[1, frozen, '#3F0A26'], [frozen + 1, onStart - frozen - 1, '#8A3A5E'], [onStart, onCols.length, '#E0115F'], [offStart, offCols.length, '#1C6E8C']]
    .forEach(function (g) {
      sh.getRange(1, g[0], 1, g[1]).merge().setBackground(g[2]).setFontColor('#FFFFFF')
        .setFontWeight('bold').setHorizontalAlignment('center');
      sh.getRange(2, g[0], 1, g[1]).setBackground(lighten(g[2])).setFontWeight('bold')
        .setWrap(true).setVerticalAlignment('middle');
    });

  var body = Math.max(rows.length, 1);
  sh.getRange(3, 1, body, width).setWrap(true).setVerticalAlignment('top');
  sh.getRange(3, infoStart + infoCols.indexOf('Số điện thoại'), body, 1).setNumberFormat('@');
  sh.setFrozenRows(2);
  sh.setFrozenColumns(frozen);

  sh.setColumnWidth(1, 120);
  sh.setColumnWidth(2, 180);
  for (var c = infoStart; c < onStart; c++) sh.setColumnWidth(c, 150);
  [[onStart, onCols.length], [offStart, offCols.length]].forEach(function (g) {
    sh.setColumnWidth(g[0], 140);
    for (var i = 1; i < g[1]; i++) sh.setColumnWidth(g[0] + i, 300);
  });
  sh.hideColumns(width);

  if (rows.length) {
    var results = sh.getRange(3, 1, rows.length, 1);
    results.setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(RESULT_OPTIONS, true).setAllowInvalid(false).build()
    ).setHorizontalAlignment('center').setFontWeight('bold');
    sh.setConditionalFormatRules(RESULT_OPTIONS.map(function (opt) {
      return SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo(opt)
        .setBackground(RESULT_COLORS[opt][0])
        .setFontColor(RESULT_COLORS[opt][1])
        .setRanges([results])
        .build();
    }));
    sh.getRange(2, 1, rows.length + 1, width).createFilter();
  }

  // Everyone can mark; editing the answers themselves asks "are you sure?",
  // and would be overwritten by the next update anyway.
  var protection = sh.protect().setDescription('Dữ liệu từ Respond — chỉ sửa Kết quả và Ghi chú');
  protection.setWarningOnly(true);
  if (rows.length) protection.setUnprotectedRanges([sh.getRange(3, 1, rows.length, lead.length)]);

  return rows.length;
}

/** The reviewers' marks currently in the tab, by applicant ID. */
function readMarks(sh) {
  var marks = {};
  if (sh.getLastRow() < 3) return marks;
  var values = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  var header = values[1];
  var idCol = header.indexOf('ID');
  var resCol = header.indexOf('Kết quả vòng 1');
  var noteCol = header.indexOf('Ghi chú');
  if (idCol === -1 || resCol === -1) return marks;
  for (var r = 2; r < values.length; r++) {
    var id = values[r][idCol];
    if (id) marks[id] = { result: values[r][resCol], note: noteCol === -1 ? '' : values[r][noteCol] };
  }
  return marks;
}

/* ---------------------------------------------------------------- helpers */

function blank(n) {
  var a = [];
  for (var i = 0; i < n; i++) a.push('');
  return a;
}
/** Sheets stored phone numbers as numbers and dropped the 0; put it back. */
function phoneText(s) {
  var d = normPhone(s);
  return d ? '0' + d : String(s || '');
}
function lighten(hex) {
  var n = parseInt(hex.slice(1), 16);
  var mix = function (c) { return Math.round(c + (255 - c) * 0.82); };
  var r = mix(n >> 16), g = mix((n >> 8) & 255), b = mix(n & 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Makes the two Ban columns of the offline tab in Respond a dropdown, so a
 * hand-typed row cannot misspell a Ban. This is the one thing the script ever
 * changes in Respond — formatting only, never an answer — and only when this
 * menu item is run. Answers the website writes are unaffected.
 */
function setupRespondDropdowns() {
  var sh = SpreadsheetApp.openById(RESPOND_ID).getSheetByName(OFFLINE_TAB);
  if (!sh) throw new Error('Không thấy tab "' + OFFLINE_TAB + '" trong Respond.');
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0];
  var rows = Math.max(sh.getMaxRows() - 1, 1);

  [[NV1, BANS], [NV2, BANS.concat([KHONG])]].forEach(function (q) {
    var col = -1;
    headers.forEach(function (h, i) { if (col === -1 && norm(h).indexOf(norm(q[0])) === 0) col = i + 1; });
    if (col === -1) throw new Error('Không thấy cột "' + q[0] + '".');
    sh.getRange(2, col, rows, 1).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(q[1], true).setAllowInvalid(false).build()
    );
  });
  SpreadsheetApp.getActive().toast('Đã tạo dropdown cho 2 cột chọn Ban trong tab "' + OFFLINE_TAB + '".', 'Xong', 8);
}

/**
 * NV1 / NV2 take the colour of that Ban's verdict, live: when Ban Tổ chức
 * marks someone Đỗ, "Ban Tổ chức" in their NV columns turns green in every
 * tab, so the other Ban sees it while deciding. Only the verdicts colour it —
 * Off / Onl + Off say how they applied, not how they did.
 *
 * Each rule reads column A of the other Ban's tab, finding the applicant by
 * the hidden ID (conditional formatting can only see another tab through
 * INDIRECT). Formulas are written in the Sheet's own syntax: a vi_VN Sheet
 * uses "," as the decimal mark and ";" between arguments, and a rule written
 * with "," silently never matches.
 */
var NV_COLOR_RESULTS = ['Trượt', 'Pending', 'Đỗ'];

function colorNguyenVong(ss) {
  var sep = argSeparator(ss);
  var tabs = {};
  BANS.forEach(function (ban) {
    var sh = ss.getSheetByName(ban);
    if (!sh || sh.getLastRow() < 3) return;
    var header = sh.getRange(2, 1, 1, sh.getLastColumn()).getValues()[0];
    tabs[ban] = {
      sh: sh,
      rows: sh.getLastRow() - 2,
      id: colLetter(header.indexOf('ID') + 1),
      nv: [header.indexOf('Nguyện vọng 1') + 1, header.indexOf('Nguyện vọng 2') + 1],
    };
  });

  Object.keys(tabs).forEach(function (ban) {
    var t = tabs[ban];
    var rules = t.sh.getConditionalFormatRules();
    t.nv.forEach(function (col) {
      if (col < 1) return;
      var range = t.sh.getRange(3, col, t.rows, 1);
      var cell = '$' + colLetter(col) + '3';
      Object.keys(tabs).forEach(function (other) {
        var o = tabs[other];
        var name = "'" + other + "'";
        NV_COLOR_RESULTS.forEach(function (res) {
          var formula =
            '=AND(ISNUMBER(SEARCH("' + other + '"' + sep + cell + '))' + sep +
            'IFERROR(INDEX(INDIRECT("' + name + '!A:A")' + sep +
            'MATCH($' + t.id + '3' + sep + 'INDIRECT("' + name + '!' + o.id + ':' + o.id + '")' + sep + '0))="' + res + '"' + sep + 'FALSE))';
          rules.push(SpreadsheetApp.newConditionalFormatRule()
            .whenFormulaSatisfied(formula)
            .setBackground(RESULT_COLORS[res][0])
            .setFontColor(RESULT_COLORS[res][1])
            .setBold(true)
            .setRanges([range])
            .build());
        });
      });
    });
    t.sh.setConditionalFormatRules(rules);
  });
}

/** "," or ";" — found by asking the Sheet itself to add 1 and 2, on a scratch tab. */
function argSeparator(ss) {
  if (argSeparator.cached) return argSeparator.cached;
  var sh = ss.insertSheet('_probe');
  sh.getRange(1, 1).setFormula('=SUM(1,2)');
  SpreadsheetApp.flush();
  var ok = sh.getRange(1, 1).getValue() === 3;
  ss.deleteSheet(sh);
  return (argSeparator.cached = ok ? ',' : ';');
}

/** The first Ban named in an NV cell ("Ban Tổ chức (Onl)\n..." -> "Ban Tổ chức"). */
function firstBan(text) {
  var first = String(text || '').split('\n')[0];
  for (var i = 0; i < BANS.length; i++) if (first.indexOf(BANS[i]) !== -1) return BANS[i];
  return '';
}

function colLetter(n) {
  var s = '';
  while (n > 0) {
    var m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/**
 * A live count above each Ban tab: total applicants, then how many are Đỗ,
 * Pending and Trượt. Added as a new row 1 after the tab is built (everything
 * below shifts down with it) and removed again at the start of each update.
 */
var SUMMARY_MARK = 'Tổng số đơn';

function addSummaryRows(ss) {
  var sep = argSeparator(ss);
  BANS.forEach(function (ban) {
    var sh = ss.getSheetByName(ban);
    if (!sh) return;
    sh.insertRowBefore(1);
    sh.setFrozenRows(3);
    var cells = [
      ['="' + SUMMARY_MARK + ': "&COUNTA($C$4:$C)', '#3F0A26', '#FFFFFF'],
      ['="Đỗ: "&COUNTIF($A$4:$A' + sep + '"Đỗ")', RESULT_COLORS['Đỗ'][0], RESULT_COLORS['Đỗ'][1]],
      ['="Pending: "&COUNTIF($A$4:$A' + sep + '"Pending")', RESULT_COLORS['Pending'][0], RESULT_COLORS['Pending'][1]],
      ['="Trượt: "&COUNTIF($A$4:$A' + sep + '"Trượt")', RESULT_COLORS['Trượt'][0], RESULT_COLORS['Trượt'][1]],
    ];
    cells.forEach(function (c, i) {
      sh.getRange(1, i + 1).setFormula(c[0]).setBackground(c[1]).setFontColor(c[2])
        .setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle');
    });
    sh.setRowHeight(1, 30);
  });
}

function removeSummaryRow(sh) {
  if (sh.getMaxRows() < 2) return;
  if (String(sh.getRange(1, 1).getDisplayValue()).indexOf(SUMMARY_MARK) === 0) {
    sh.setFrozenRows(0);
    sh.deleteRow(1);
  }
}

/**
 * Result lists, live from the Ban tabs' "Kết quả vòng 1": Họ và tên, Email,
 * Số điện thoại. "Đỗ <Ban>" holds everyone whose result there is anything
 * other than blank, Pending or Trượt (Đỗ, Off, Onl + Off). "Total đỗ" is the
 * three together, people who passed two Ban listed once; "Total trượt" is
 * everyone else.
 */
var RESULT_TABS = [
  ['Đỗ BTC', BAN_TC],
  ['Đỗ BDN', BAN_DN],
  ['Đỗ BTT', BAN_TT],
];
var PASS_WHERE = "Col1 is not null and Col1 <> 'Pending' and Col1 <> 'Trượt'";

function writeResultTabs(ss) {
  var sep = argSeparator(ss);
  // Data starts on row 4 (count row, groups, headers); C = name, G = email, H = phone.
  function range(ban) { return "'" + ban + "'!$A$4:$H"; }
  function query(src, where) {
    return 'QUERY(' + src + sep + '"select Col3, Col7, Col8 where ' + where + '"' + sep + '0)';
  }
  var all = 'VSTACK(' + BANS.map(range).join(sep) + ')';
  var passed = 'UNIQUE(' + query(all, PASS_WHERE) + ')';
  var everyone = 'UNIQUE(' + query(all, 'Col3 is not null') + ')';
  var key = function (arr) {
    return 'INDEX(' + arr + sep + sep + '1)&"|"&INDEX(' + arr + sep + sep + '2)';
  };

  var tabs = RESULT_TABS.map(function (t) {
    return [t[0], '=IFERROR(' + query(range(t[1]), PASS_WHERE) + sep + '"")'];
  }).concat([
    ['Total đỗ', '=IFERROR(' + passed + sep + '"")'],
    ['Total trượt', '=IFERROR(LET(all' + sep + everyone + sep + 'p' + sep + passed + sep +
      'FILTER(all' + sep + 'ISNA(MATCH(' + key('all') + sep + key('p') + sep + '0))))' + sep + '"")'],
  ]);

  tabs.forEach(function (t) {
    var sh = ss.getSheetByName(t[0]) || ss.insertSheet(t[0]);
    sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(function (pr) { pr.remove(); });
    sh.clear();
    sh.getRange(1, 1, 1, 3).setValues([['Họ và tên', 'Email', 'Số điện thoại']])
      .setFontWeight('bold').setBackground('#3F0A26').setFontColor('#FFFFFF');
    sh.getRange(2, 3, Math.max(sh.getMaxRows() - 1, 1), 1).setNumberFormat('@');
    sh.getRange(2, 1).setFormula(t[1]);
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 220);
    sh.setColumnWidth(2, 280);
    sh.setColumnWidth(3, 140);
    sh.protect().setDescription('Tự động từ các tab Ban').setWarningOnly(true);
  });
}
