/** EduCare School ERP — Attendance.gs */

function attendanceList(user, p) {
  var recs = getAllRecords("Attendance", { where: p.filters || {} });
  return { status: "ok", data: { records: recs } };
}

function attendanceSave(user, p) {
  if (!p.date || !p.records || !p.records.length) return { status: "error", message: "Date and records required" };
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sheet = getSheet("Attendance"), headers = getHeaders("Attendance");
    var existing = getAllRecords("Attendance", { where: { date: p.date } });
    var key = function(sid){ return p.date + "|" + sid; };
    var seen = {}; existing.forEach(function(r){ seen[key(r.student_id)] = true; });
    var rows = [], corrections = [];
    p.records.forEach(function(r) {
      var k = key(r.student_id);
      if (seen[k]) { corrections.push(r); return; }
      rows.push(headers.map(function(h) {
        if (h === "id") return generateId("Attendance");
        if (h === "date") return p.date;
        if (h === "marked_by") return user.username;
        if (h === "created_at") return new Date();
        return r[h] !== undefined ? r[h] : "";
      }));
    });
    if (rows.length) sheet.getRange(sheet.getLastRow()+1, 1, rows.length, headers.length).setValues(rows);
    // authorized corrections: update status of existing rows
    corrections.forEach(function(r) {
      existing.forEach(function(ex) {
        if (String(ex.student_id) === String(r.student_id) && ex.status !== r.status) {
          updateRecord("Attendance", ex.id, { status: r.status, remarks: "Corrected by " + user.username }, user);
        }
      });
    });
    logAudit(user, "SAVE_ATTENDANCE", "Attendance", p.date, rows.length + " marked, " + corrections.length + " corrected", "Success");
    return { status: "ok", message: "Attendance saved (" + rows.length + " new, " + corrections.length + " corrected)" };
  } finally { lock.releaseLock(); }
}
