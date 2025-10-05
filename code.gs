const FOLDER_NAME = 'EODreps';
const SPREADSHEET_NAME = 'EOD Report';
const HEADERS = ['Ord#', 'Time Block', 'Amount', 'Pmnt Type', 'Covers'];

function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.range) {
      const { ss } = ensureSetup_();
      const sheetName = e.parameter.sheet || e.parameter.s || null;
      let sheet;
      if (sheetName) {
        sheet = ss.getSheetByName(sheetName);
        if (!sheet) return json_({ ok: false, error: 'Sheet not found', sheet: sheetName }, 404);
      } else {
        sheet = ensureSetup_().sheet; // default to today's sheet
      }
      const rangeA1 = e.parameter.range;
      const raw = sheet.getRange(rangeA1).getDisplayValues();
      const values = sanitizeValues_(raw);
      return json_({ ok: true, spreadsheetId: ss.getId(), sheet: sheet.getName(), range: rangeA1, values });
    }

    const info = ensureSetup_();
    return json_({ ok: true, spreadsheetId: info.ss.getId(), sheet: info.sheet.getName() });
  } catch (err) {
    return json_({ ok: false, error: String(err) }, 500);
  }
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    if (!payload || !Array.isArray(payload.rows)) {
      return json_({ ok: false, error: 'Missing rows array' }, 400);
    }

    var sheetParam = (e && e.parameter && (e.parameter.sheet || e.parameter.s)) || (payload && payload.sheet) || null;
    const { sheet } = ensureSetup_(sheetParam);
    ensureHeaders_(sheet);

    // Reset specific summary ranges before writing new data
    resetSummaryRanges_(sheet);

    const values = payload.rows
      .filter(r => r && (r.ord || r.time || r.amount || r.payment || r.covers))
      .map(r => [
        safeString_(r.ord),
        safeString_(r.time),
        safeNumber_(r.amount),
        safeString_(r.payment),
        safeString_(r.covers)
      ]);

    let appended = 0;
    if (values.length) {
      // Force write from row 2, columns A:E, regardless of other data in sheet
      const startRow = 2;
      const startCol = 1;
      const width = HEADERS.length; // A..E

      // Clear existing A:E rows we are about to write (and any previous content below)
      const existingRows = Math.max(sheet.getLastRow() - 1, 0); // rows below header
      const clearCount = Math.max(existingRows, values.length);
      if (clearCount > 0) {
        sheet.getRange(startRow, startCol, clearCount, width).clearContent();
      }

      sheet.getRange(startRow, startCol, values.length, width).setValues(values);
      appended = values.length;
    }

    return json_({ ok: true, appended, sheet: sheet.getName() });
  } catch (err) {
    return json_({ ok: false, error: String(err) }, 500);
  }
}

function ensureSetup_(optSheetName) {
  const folder = ensureFolder_(FOLDER_NAME);
  const ss = ensureSpreadsheetInFolder_(folder, SPREADSHEET_NAME);
  const sheetName = optSheetName || Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Bangkok', 'ddMMyy');
  const sheet = ensureSheet_(ss, sheetName);
  return { folder, ss, sheet };
}

function ensureFolder_(name) {
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

function ensureSpreadsheetInFolder_(folder, name) {
  const files = folder.getFilesByName(name);
  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.openById(file.getId());
  }
  const ss = SpreadsheetApp.create(name);
  // Move new spreadsheet into target folder
  DriveApp.getFileById(ss.getId()).moveTo(folder);
  return ss;
}

function ensureSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;

  var template = ss.getSheetByName('template');
  if (template) {
    var copy = template.copyTo(ss);
    copy.setName(name);
    // Move copy to end to keep ordering predictable
    ss.setActiveSheet(copy);
    ss.moveActiveSheet(ss.getNumSheets());
    return copy;
  }

  // Fallback if no template exists
  return ss.insertSheet(name);
}

function ensureHeaders_(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const current = range.getDisplayValues()[0];
  const hasAny = current.some((v) => (v || '').toString().trim() !== '');
  if (!hasAny) {
    range.setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
}

function resetSummaryRanges_(sheet) {
  // Set H2:K2 and H6:K6 to 0 prior to data write
  sheet.getRange(2, 8, 1, 4).setValues([[0, 0, 0, 0]]); // H2:K2
  sheet.getRange(6, 8, 1, 4).setValues([[0, 0, 0, 0]]); // H6:K6
}

function parsePayload_(e) {
  if (!e) return null;
  try {
    if (e.postData && e.postData.type === 'application/json' && e.postData.contents) {
      return JSON.parse(e.postData.contents);
    }
  } catch (_) { }
  // Fallback: URL-encoded form field named `rows`
  if (e.parameter && e.parameter.rows) {
    try {
      return { rows: JSON.parse(e.parameter.rows) };
    } catch (_) {
      return null;
    }
  }
  return null;
}

function json_(obj, status) {
  // Apps Script Web Apps ignore status codes; include in body for clarity
  const out = ContentService.createTextOutput(JSON.stringify({ status: status || 200, ...obj }));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

function sanitizeValues_(values) {
  return values.map(function (row) {
    return row.map(function (cell) {
      if (cell === '#DIV/0!') return '0.00';
      return cell;
    });
  });
}

function safeString_(v) {
  return v == null ? '' : String(v);
}

function safeNumber_(v) {
  if (v == null || v === '') return '';
  const n = Number(v);
  return isNaN(n) ? '' : n;
}
