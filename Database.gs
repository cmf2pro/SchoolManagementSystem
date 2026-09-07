/** EduCare School ERP — Database.gs (schema + generic DB layer) */

var SCHEMA = {
  Users:        ["id","username","password_hash","name","role_id","role_name","link_id","email","phone","status","must_change_password","created_at","created_by","updated_at","updated_by"],
  Roles:        ["id","name","description","is_system","permissions","status","created_at"],
  Students:     ["id","admission_no","roll_no","first_name","last_name","gender","dob","blood_group","category","admission_date","academic_year","class_id","section_id","house_id","father_name","mother_name","guardian_name","parent_id","phone","email","address","emergency_contact","transport_id","hostel_id","photo_url","medical_notes","status","deleted","created_at","created_by","updated_at","updated_by"],
  Parents:      ["id","name","relationship","phone","alt_phone","email","occupation","address","username","status","deleted","created_at"],
  ParentStudents: ["id","parent_id","student_id","relationship"],
  Teachers:     ["id","employee_id","name","gender","dob","phone","email","address","qualification","specialization","department","designation","joining_date","salary","status","deleted","created_at","created_by"],
  Staff:        ["id","employee_id","name","department","designation","phone","email","joining_date","salary","status","deleted","created_at"],
  Classes:      ["id","name","code","order","class_teacher_id","capacity","academic_year","status","deleted"],
  Sections:     ["id","class_id","name","room","capacity","class_teacher_id","status","deleted"],
  Subjects:     ["id","code","name","class_id","teacher_id","type","max_marks","pass_marks","theory_marks","practical_marks","status","deleted"],
  Houses:       ["id","name","color","teacher_id","status","deleted"],
  AcademicYears:["id","year","start_date","end_date","status"],
  Admissions:   ["id","application_no","student_name","dob","gender","parent_name","phone","email","previous_school","previous_class","applying_class_id","academic_year","address","status","remarks","created_at","created_by"],
  Attendance:   ["id","date","student_id","class_id","section_id","status","remarks","marked_by","created_at"],
  TeacherAttendance: ["id","date","teacher_id","status","marked_by","created_at"],
  StaffAttendance:   ["id","date","staff_id","status","marked_by","created_at"],
  Leaves:       ["id","person_type","person_id","person_name","leave_type","from_date","to_date","reason","status","approved_by","created_at"],
  Timetable:    ["id","class_id","section_id","day","period","start_time","end_time","subject_id","teacher_id","room","status","deleted"],
  Exams:        ["id","name","type","academic_year","class_id","start_date","end_date","max_marks","pass_marks","status","deleted"],
  ExamSubjects: ["id","exam_id","subject_id","max_marks","pass_marks","date"],
  Marks:        ["id","exam_id","class_id","section_id","subject_id","student_id","max_marks","marks","grade","remarks","status","locked","created_by","created_at"],
  Results:      ["id","exam_id","student_id","class_id","total","max_total","percentage","grade","rank","status"],
  Promotions:   ["id","from_year","to_year","student_id","from_class","to_class","result","created_at","created_by"],
  FeeStructures:["id","academic_year","class_id","fee_type","amount","frequency","status","deleted"],
  Fees:         ["id","student_id","academic_year","fee_type","amount","discount","late_fee","due_date","status","created_at"],
  FeePayments:  ["id","receipt_no","student_id","amount","discount","late_fee","method","txn_id","remarks","collected_by","created_at","deleted"],
  FeeRefunds:   ["id","payment_id","student_id","amount","reason","method","status","approved_by","created_at"],
  Expenses:     ["id","date","category","description","amount","paid_to","payment_method","created_by","created_at","deleted"],
  Income:       ["id","date","source","description","amount","created_by","created_at","deleted"],
  Salaries:     ["id","month","employee_type","employee_id","employee_name","basic","hra","allowance","bonus","deduction","pf","gross","net","status","created_at"],
  Books:        ["id","book_code","isbn","title","author","publisher","category","edition","price","rack","total_copies","available_copies","status","deleted"],
  LibraryTransactions: ["id","book_id","book_title","borrower_type","borrower_id","borrower_name","issue_date","due_date","return_date","fine","status","created_at"],
  Vehicles:     ["id","vehicle_no","type","capacity","driver","driver_phone","status","insurance_expiry","fitness_expiry","permit_expiry","deleted"],
  Routes:       ["id","name","stops","vehicle_id","driver","pickup_time","drop_time","status","deleted"],
  RouteStops:   ["id","route_id","stop_name","order","time","fare"],
  TransportAssignments: ["id","student_id","route_id","stop_id","status"],
  Hostels:      ["id","name","type","warden","capacity","status","deleted"],
  Rooms:        ["id","hostel_id","room_no","capacity","occupied","status"],
  Beds:         ["id","room_id","hostel_id","bed_no","occupied","student_id","status"],
  HostelAssignments: ["id","student_id","hostel_id","room_id","bed_id","check_in","check_out","status"],
  Inventory:    ["id","item_name","category","quantity","unit","price","supplier","purchase_date","location","min_stock","status","deleted"],
  InventoryTransactions: ["id","item_id","type","quantity","date","handled_by","remarks"],
  Homework:     ["id","class_id","section_id","subject_id","teacher_id","title","description","assigned_date","due_date","attachment_url","status","deleted"],
  Notices:      ["id","title","description","audience","publish_date","expiry","priority","attachment_url","status","created_by","created_at","deleted"],
  Events:       ["id","title","type","date","time","venue","description","audience","status","created_at"],
  PTM:          ["id","title","class_id","teacher_id","date","time","notes","parent_attendance","status"],
  Certificates: ["id","cert_no","type","student_id","issued_date","issued_by","status"],
  Documents:    ["id","owner_type","owner_id","doc_type","name","url","uploaded_by","created_at"],
  Discipline:   ["id","student_id","date","incident","category","description","action","fine","teacher_id","status","created_at"],
  AuditLogs:    ["id","timestamp","user","role","action","module","record_id","description","status"],
  Settings:     ["key","value"]
};

function getSheet(name) {
  if (!SCHEMA[name]) throw new Error("Unknown sheet: " + name);
  var s = ss().getSheetByName (!s) s = ensureSheet(name);
  return s;
}

function ensureSheet(name) {
  var headers = SCHEMA[name];
  var s = ss().getSheetByName(name);
  if (!s) {
    s = ss().insertSheet(name);
    s.appendRow(headers);
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
  } else {
    var existing = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0];
    headers.forEach(function(h) { if (existing.indexOf(h) === -1) { existing.push(h); } });
    if (existing.length > s.getLastColumn()) s.getRange(1, 1, 1, existing.length).setValues([existing]);
  }
  return s;
}

function getAllSheets() { return Object.keys(SCHEMA); }

function getAllRecords(name, opts) {
  opts = opts || {};
  var s = getSheet(name), headers = getHeaders(name);
  var lr = s.getLastRow();
  if (lr < 2) return [];
  var values = s.getRange(2, 1, lr - 1, headers.length).getValues();
  var recs = [];
  for (var i = 0; i < values.length; i++) {
    var r = {};
    for (var c = 0; c < headers.length; c++) r[headers[c]] = values[i][c];
    if (r.deleted === true || r.deleted === "TRUE") continue;
    if (opts.where) {
      var ok = true;
      for (var k in opts.where) { if (String(r[k]) !== String(opts.where[k])) { ok = false; break; } }
      if (!ok) continue;
    }
    r._row = i + 2;
    recs.push(r);
  }
  return recs;
}

function getHeaders(name) {
  var s = getSheet(name);
  return s.getRange(1, 1, 1, Math.max(s.getLastColumn(), SCHEMA[name].length)).getValues()[0]
          .filter(function(h){ return h; });
}

function getRecordById(name, id) {
  var recs = getAllRecords(name);
  for (var i = 0; i < recs.length; i++) if (String(recs[i].id) === String(id)) return recs[i];
  return null;
}

function findRecords(name, field, value) {
  return getAllRecords(name).filter(function(r){ return String(r[field]) === String(value); });
}

function insertRecord(name, data, user) {
  var s = getSheet(name), headers = getHeaders(name);
  var row = headers.map(function(h) {
    if (h === "id") return data.id || generateId(name);
    if (h === "created_at") return new Date();
    if (h === "created_by") return user ? user.username : "";
    return data[h] !== undefined ? data[h] : "";
  });
  s.appendRow(row);
  return { id: row[headers.indexOf("id")] };
}

function updateRecord(name, id, data, user) {
  var recs = getAllRecords(name);
  for (var i = 0; i < recs.length; i++) {
    if (String(recs[i].id) === String(id)) {
      var s = getSheet(name), headers = getHeaders(name), row = i + 2;
      var vals = s.getRange(row, 1, 1, headers.length).getValues()[0];
      for (var c = 0; c < headers.length; c++) {
        if (data[headers[c]] !== undefined) vals[c] = data[headers[c]];
        if (headers[c] === "updated_at") vals[c] = new Date();
        if (headers[c] === "updated_by") vals[c] = user ? user.username : "";
      }
      s.getRange(row, 1, 1, headers.length).setValues([vals]);
      return true;
    }
  }
  return false;
}

function softDeleteRecord(name, id, user) {
  return updateRecord(name, id, { status: "Inactive", deleted: true }, user);
}

var ID_PREFIX = {
  Students:"STU", Parents:"PAR", Teachers:"TCH", Staff:"EMP", Classes:"CLS", Sections:"SEC",
  Subjects:"SUB", Houses:"HOU", AcademicYears:"AY", Admissions:"ADM", Exams:"EXM", Books:"BOOK",
  FeePayments:"REC", Expenses:"EXP", Income:"INC", Salaries:"PAY", Certificates:"CERT",
  Users:"USR", Roles:"ROL", Timetable:"TT", Notices:"NOT", Events:"EVT", Homework:"HW",
  Vehicles:"VEH", Routes:"RT", Hostels:"HST", Inventory:"INV", Leaves:"LV", PTM:"PTM",
  FeeStructures:"FS", Fees:"FEE", Marks:"MK", Results:"RES", Rooms:"RM", Beds:"BED",
  LibraryTransactions:"LIB", Discipline:"DIS", Documents:"DOC", TransportAssignments:"TA",
  HostelAssignments:"HA", RouteStops:"RS", ExamSubjects:"ES", Promotions:"PR", FeeRefunds:"FR",
  ParentStudents:"PS", InventoryTransactions:"IT", Attendance:"ATT", TeacherAttendance:"TATT",
  StaffAttendance:"SATT", AdmissionNo: "ADM"
};

function generateId(sheetName) {
  var prefix = ID_PREFIX[sheetName] || sheetName.substring(0,3).toUpperCase();
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties();
    var key = "SEQ_" + sheetName;
    var n = parseInt(props.getProperty(key) || "0", 10) + 1;
    props.setProperty(key, String(n));
    return prefix + "-" + ("000000" + n).slice(-6);
  } finally { lock.releaseLock(); }
}

function logAudit(user, action, module, recordId, description, status) {
  try {
    var s = getSheet("AuditLogs");
    s.appendRow([generateId("AuditLogs"), new Date(), user ? user.username : "system",
      user ? user.role_name", action, module || "", recordId || "", description || "", status || "Success"]);
  } catch(e) { /* never break flow on audit failure */ }
}
