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
    .addToUi();
}

/* ------------------------------------------------------------------ main */

function syncAll() {
  var lock = LockService.getDocumentLock();
  lock.waitLock(60000);
  try {
    var src = SpreadsheetApp.openById(RESPOND_ID);
    var subs = readSource(src, 'online').concat(readSource(src, 'offline'));
    var report = [];
    var people = groupPeople(subs, report);

    var out = SpreadsheetApp.getActiveSpreadsheet();
    var counts = BANS.map(function (ban) {
      return writeBanTab(out, ban, people);
    });
    writeReport(out, people, report);

    var first = out.getSheetByName('Sheet1') || out.getSheetByName('Trang tính1');
    if (first && first.getLastRow() === 0 && out.getSheets().length > 1) out.deleteSheet(first);

    SpreadsheetApp.getActive().toast(
      BANS.map(function (b, i) { return b + ': ' + counts[i]; }).join(' · ') +
        ' — ' + report.length + ' mục trong "Kiểm tra"',
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

    var t = raw[r][timeCol];
    var info = {};
    INFO.forEach(function (f) {
      info[f[0]] = pick(row, f[1][0]).replace(/[ 	]+/g, ' ');
    });

    var nv1 = pick(row, NV1);
    var nv2 = pick(row, NV2);
    var nv = {};
    if (BANS.indexOf(nv1) !== -1) nv[nv1] = 'NV1';
    if (nv2 && nv2 !== KHONG && BANS.indexOf(nv2) !== -1) nv[nv2] = 'NV2';

    var ban = {};
    BANS.forEach(function (b) {
      ban[b] = cfg.ban[b].map(function (q) { return pick(row, q); });
    });

    subs.push({
      source: source,
      row: r + 1,
      time: t instanceof Date ? t : new Date(t),
      timeText: row[timeCol],
      info: info,
      nv: nv,
      common: cfg.common.map(function (q) { return pick(row, q); }),
      ban: ban,
      loiNhan: pick(row, LOI_NHAN),
    });
  }
  return subs;
}

/* -------------------------------------------------------------- matching */

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
 * Submissions are the same person when they share a phone number, an email or
 * a Facebook link AND the same name. A shared phone/email/link under two
 * different names is not merged — it goes to "Kiểm tra" for a human.
 */
function groupPeople(subs, report) {
  var parent = subs.map(function (_, i) { return i; });
  function find(i) { return parent[i] === i ? i : (parent[i] = find(parent[i])); }
  function union(a, b) { parent[find(a)] = find(b); }

  var byKey = {};
  subs.forEach(function (s, i) {
    var keys = [];
    var p = normPhone(s.info['Số điện thoại']);
    var e = normEmail(s.info['Email']);
    var f = normFb(s.info['Link Facebook']);
    if (p) keys.push('p:' + p);
    if (e) keys.push('e:' + e);
    if (f) keys.push('f:' + f);
    keys.forEach(function (k) { (byKey[k] = byKey[k] || []).push(i); });
  });

  var conflictSeen = {};
  Object.keys(byKey).forEach(function (k) {
    var list = byKey[k];
    for (var a = 0; a < list.length; a++) {
      for (var b = a + 1; b < list.length; b++) {
        var sa = subs[list[a]], sb = subs[list[b]];
        if (normName(sa.info['Họ và tên']) === normName(sb.info['Họ và tên'])) {
          union(list[a], list[b]);
        } else {
          var tag = [list[a], list[b]].sort().join('-');
          if (conflictSeen[tag]) continue;
          conflictSeen[tag] = true;
          report.push([
            '⚠ Trùng ' + keyName(k) + ' nhưng khác tên — KHÔNG gộp, cần kiểm tra',
            sa.info['Họ và tên'] + '  ·  ' + sb.info['Họ và tên'],
            where(sa) + '  ·  ' + where(sb),
          ]);
        }
      }
    }
  });

  var groups = {};
  subs.forEach(function (s, i) {
    var g = find(i);
    (groups[g] = groups[g] || []).push(s);
  });

  var people = Object.keys(groups).map(function (g) {
    return buildPerson(groups[g], report);
  });

  // Same name, nothing else in common: may be one person who changed both
  // phone and email, or two people who share a name. A human decides.
  var byName = {};
  people.forEach(function (p) {
    var n = normName(p.info['Họ và tên']);
    (byName[n] = byName[n] || []).push(p);
  });
  Object.keys(byName).forEach(function (n) {
    if (byName[n].length < 2) return;
    report.push([
      'Cần xem: trùng tên, khác SĐT/email/FB — để riêng ' + byName[n].length + ' dòng',
      byName[n][0].info['Họ và tên'],
      byName[n].map(function (p) { return p.subs.map(where).join(', '); }).join('  ·  '),
    ]);
  });

  people.sort(function (a, b) { return a.firstTime - b.firstTime; });
  return people;
}

function keyName(k) {
  return k.charAt(0) === 'p' ? 'SĐT' : k.charAt(0) === 'e' ? 'email' : 'link Facebook';
}
function where(s) {
  return (s.source === 'online' ? 'Online' : 'Offline') + ' dòng ' + s.row + ' (' + s.timeText + ')';
}

/**
 * One applicant from all their submissions. The latest submission wins for
 * their info and shared answers; each Ban's answers come from the latest
 * submission that applied to that Ban; the Ban list is every Ban they ever
 * applied to.
 */
function buildPerson(subs, report) {
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
  // Everyone who switched email to apply again: show every address used.
  var emails = [];
  subs.forEach(function (s) {
    var e = s.info['Email'];
    if (e && emails.map(normEmail).indexOf(normEmail(e)) === -1) emails.push(e);
  });
  info['Email'] = emails.join('\n');

  var bans = {};
  subs.forEach(function (s) { Object.keys(s.nv).forEach(function (b) { bans[b] = true; }); });

  var person = {
    id: idFor(subs[0]),
    info: info,
    subs: subs,
    firstTime: subs[0].time,
    bans: bans,
    online: sideFor(online),
    offline: sideFor(offline),
  };

  if (online.length > 1) {
    report.push(['Gộp: nộp online ' + online.length + ' lần — lấy câu trả lời mới nhất', info['Họ và tên'], online.map(where).join('  ·  ')]);
  }
  if (offline.length > 1) {
    report.push(['Gộp: nộp offline ' + offline.length + ' lần — lấy câu trả lời mới nhất', info['Họ và tên'], offline.map(where).join('  ·  ')]);
  }
  if (online.length && offline.length) {
    report.push(['Gộp: nộp cả online và offline (Onl + Off)', info['Họ và tên'], subs.map(where).join('  ·  ')]);
  }
  if (Object.keys(bans).length > 2) {
    report.push(['⚠ ỨNG TUYỂN CẢ 3 BAN', info['Họ và tên'], subs.map(function (s) {
      return where(s) + ': ' + Object.keys(s.nv).join(' + ');
    }).join('  ·  ')]);
  }
  return person;
}

/** One source's answers for a person: shared ones from the latest, each Ban's from the latest that chose it. */
function sideFor(subs) {
  if (!subs.length) return null;
  var latest = subs[subs.length - 1];
  var side = { time: latest.timeText, common: latest.common, loiNhan: latest.loiNhan, ban: {}, nv: {}, times: {} };
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

/** Stable across re-runs: the person's first submission. */
function idFor(s) {
  return (s.source === 'online' ? 'ON' : 'OFF') + '|' + s.timeText + '|' + normEmail(s.info['Email']);
}

/* -------------------------------------------------------------- writing */

function writeBanTab(ss, ban, people) {
  var on = SOURCES.online, off = SOURCES.offline;
  var onCols = ['Thời gian gửi', 'Nguyện vọng']
    .concat(['Hoạt động ngoại khóa', 'Thành tích, giải thưởng', '1 từ về bản thân', 'Thành tựu cá nhân'])
    .concat(on.ban[ban]).concat(['Lời nhắn']);
  var offCols = ['Thời gian gửi', 'Nguyện vọng']
    .concat(['Hoạt động ngoại khóa', '1 từ về bản thân'])
    .concat(off.ban[ban].map(function (q) {
      return q.replace('Em hãy chấm điểm những kỹ năng về truyền thông sau đây? ', 'Chấm điểm ');
    }))
    .concat(['Lời nhắn']);
  var infoCols = INFO.map(function (f) { return f[0]; });
  var lead = ['Kết quả vòng 1', 'Ghi chú'];
  var header = lead.concat(infoCols, onCols, offCols, ['ID']);
  var width = header.length;

  var sh = ss.getSheetByName(ban) || ss.insertSheet(ban);
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
    infoCols.forEach(function (k) { row.push(k === 'Số điện thoại' ? phoneText(p.info[k]) : p.info[k]); });
    if (o) {
      row = row.concat([o.times[ban], o.nv[ban]], o.common, o.ban[ban], [o.loiNhan]);
    } else {
      row = row.concat(blank(onCols.length));
    }
    if (f) {
      row = row.concat([f.times[ban], f.nv[ban]], f.common, f.ban[ban], [f.loiNhan]);
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
    sh.setColumnWidth(g[0] + 1, 90);
    for (var i = 2; i < g[1]; i++) sh.setColumnWidth(g[0] + i, 300);
  });
  sh.getRange(2, onStart, body + 1, 2).setWrap(true);
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

function writeReport(ss, people, report) {
  var sh = ss.getSheetByName('Kiểm tra') || ss.insertSheet('Kiểm tra');
  sh.clear();
  var stamp = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');
  var bans = BANS.map(function (b) {
    return b + ': ' + people.filter(function (p) { return p.bans[b]; }).length;
  }).join(' · ');
  var rows = [
    ['Cập nhật lúc ' + stamp, people.length + ' ứng viên (sau khi gộp)', bans],
    ['Loại', 'Ứng viên', 'Chi tiết'],
  ].concat(report.length ? report : [['Không có gì cần kiểm tra', '', '']]);
  sh.getRange(1, 1, rows.length, 3).setValues(rows).setWrap(true).setVerticalAlignment('top');
  sh.getRange(1, 1, 1, 3).setFontWeight('bold');
  sh.getRange(2, 1, 1, 3).setFontWeight('bold').setBackground('#F3E3EA');
  sh.setFrozenRows(2);
  sh.setColumnWidth(1, 380);
  sh.setColumnWidth(2, 220);
  sh.setColumnWidth(3, 620);
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
