/**
 * Receives applications from the đơn page and appends them to this Sheet,
 * the way a Google Form does: one row per submission, the header row being
 * the questions themselves.
 *
 * ── Setup ────────────────────────────────────────────────────────────────
 * 1. Open the Google Sheet the responses should land in.
 * 2. Extensions → Apps Script. Delete whatever is there, paste this in, Save.
 * 3. Deploy → New deployment → type "Web app".
 *      Execute as:      Me
 *      Who has access:  Anyone          <-- must be "Anyone", not "Anyone with
 *                                           Google account", or applicants who
 *                                           are not signed in get a 401.
 * 4. Copy the /exec URL it gives you.
 * 5. Put it in the site's environment as NEXT_PUBLIC_FORM_ENDPOINT — locally in
 *    .env.local, and in Vercel under Project → Settings → Environment Variables.
 *    Rebuild after changing it: the value is inlined at build time.
 *
 * Re-deploy (Deploy → Manage deployments → edit → New version) after any edit
 * here, or the old code keeps serving.
 */

/** Responses land on this tab; it is created on first submission. */
var SHEET_NAME = 'Đơn ứng tuyển';

/** Nobody may apply after this. Keep it in step with src/lib/deadline.ts. */
var DEADLINE = new Date('2026-10-20T23:59:59+07:00');

/** One application per email address. */
var ONE_PER_EMAIL = true;
var EMAIL_COLUMN = 'Email';

function doPost(e) {
  // Two submissions arriving together must not both read "the sheet ends at
  // row 40" and then both write row 41.
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var payload = JSON.parse(e.postData.contents);
    var answers = payload.answers || {};

    if (new Date() > DEADLINE) {
      return json({ ok: false, error: 'closed' });
    }

    var sheet = getSheet();
    var headers = getHeaders(sheet, answers);

    if (ONE_PER_EMAIL) {
      var email = String(answers[EMAIL_COLUMN] || '').trim().toLowerCase();
      if (email && alreadyApplied(sheet, headers, email)) {
        return json({ ok: false, error: 'duplicate' });
      }
    }

    var row = headers.map(function (header) {
      if (header === 'Thời gian gửi') {
        return payload.submittedAt
          ? new Date(payload.submittedAt)
          : new Date();
      }
      return answers[header] !== undefined ? answers[header] : '';
    });

    sheet.appendRow(row);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** So you can open the /exec URL in a browser and see that it is alive. */
function doGet() {
  return json({ ok: true, status: 'ready' });
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

/**
 * The header row is written from the first submission's own questions, and any
 * question it has never seen before is appended as a new column. That way the
 * questions can change on the site without this script needing to know them,
 * and existing rows keep their meaning instead of silently shifting sideways.
 */
function getHeaders(sheet, answers) {
  var width = sheet.getLastColumn();
  var headers =
    sheet.getLastRow() === 0 || width === 0
      ? []
      : sheet.getRange(1, 1, 1, width).getValues()[0].filter(String);

  if (headers.length === 0) {
    headers = ['Thời gian gửi'].concat(Object.keys(answers));
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return headers;
  }

  var added = Object.keys(answers).filter(function (key) {
    return headers.indexOf(key) === -1;
  });
  if (added.length) {
    sheet
      .getRange(1, headers.length + 1, 1, added.length)
      .setValues([added])
      .setFontWeight('bold');
    headers = headers.concat(added);
  }
  return headers;
}

function alreadyApplied(sheet, headers, email) {
  var col = headers.indexOf(EMAIL_COLUMN) + 1;
  if (col === 0 || sheet.getLastRow() < 2) return false;

  var values = sheet.getRange(2, col, sheet.getLastRow() - 1, 1).getValues();
  return values.some(function (r) {
    return String(r[0]).trim().toLowerCase() === email;
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
