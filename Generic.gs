
--- FILE: Generic.gs ---

```javascript
/** EduCare School ERP — Generic.gs (schema-driven CRUD for all remaining modules) */

// Sheets editable via generic engine + which module permission guards them
var GENERIC_GUARD = {
  Parents:"Students", Classes:"Academics", Sections:"Academics", Subjects:"Academics", Houses:"Academics",
  AcademicYears:"Settings", Admissions:"Students", Teachers:"HR", Staff:"HR", Leaves:"HR", Timetable:"Academics",
  Exams:"Exams", ExamSubjects:"Exams", Marks:"Exams", Results:"Exams", Promotions:"Exams",
  FeeStructures:"Fees", FeeRefunds:"Fees", Expenses:"Finance", Income:"Finance", Salaries:"Payroll",
  Books:"Library", LibraryTransactions:"Library", Vehicles:"Transport", Routes:"Transport",
  RouteStops:"Transport", TransportAssignments:"Transport", Hostels:"Hostel", Rooms:"Hostel", Beds:"Hostel",
  HostelAssignments:"Hostel", Inventory:"Inventory", InventoryTransactions:"Inventory",
  Homework:"Academics", Notices:"Academics", Events:"Academics", PTM:"Academics",
  Certificates:"Students", Documents:"Students", Discipline:"Students",
  Users:"Users", Roles:"Users", ParentStudents:"Students", TeacherAttendance:"Attendance",
  StaffAttendance:"Attendance"
};

function genericList(user, sheet, filters, page, pageSize, search) {
  var mod = GENERIC_GUARD[sheet];
  if (!mod || !userCan(user, mod, "view")) return { status: "error", message: "Permission denied" };
  if (!SCHEMA[sheet]) return { status: "error", message: "Unknown module" };
  var recs = getAllRecords(sheet, { where: filters || {} });
  if (search) {
    var s = String(search).toLowerCase();
    recs = recs.filter(function(r) {
      for (var k in r) { if (String(r[k]).toLowerCase().indexOf(s) !== -1) return true; }
      return false;
    });
  }
  page = Math.max(1, page || 1); pageSize = Math.min(200, pageSize || 25);
  var total = recs.length;
  return { status: "ok", data: { records: recs.slice((page-1)*pageSize, page*pageSize), total: total, page: page, pageSize: pageSize, headers: SCHEMA[sheet] } };
}

function genericSave(user, sheet, data) {
  var mod = GENERIC_GUARD[sheet];
  if (!mod || !userCan(user, mod, data.id ? "edit" : "create")) return { status: "error", message: "Permission denied" };
  if (!SCHEMA[sheet]) return { status: "error", message: "Unknown module" };
  if (!data) return { status: "error", message: "No data provided" };
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    if (data.id) {
      var ok = updateRecord(sheet, data.id, data, user);
      logAudit(user, "UPDATE_" + sheet.toUpperCase(), sheet, data.id, "", ok ? "Success" : "Failed");
      return ok ? { status: "ok", message: "Record updated" } : { status: "error", message: "Record not found" };
    } else {
      var rec = insertRecord(sheet, data, user);
      if (data.status === undefined && SCHEMA[sheet].indexOf("status") !== -1) updateRecord(sheet, rec.id, { status: "Active" }, user);
      logAudit(user, "CREATE_" + sheet.toUpperCase(), sheet, rec.id, "", "Success");
      return { status: "ok", data: rec, message: "Record created successfully" };
    }
  } finally { lock.releaseLock(); }
}

function genericDelete(user, sheet, id) {
  var mod = GENERIC_GUARD[sheet];
  if (!mod || !userCan(user, mod, "delete")) return { status: "error", message: "Permission denied" };
  var rec = getRecordById(sheet, id);
  if (!rec) return { status: "error", message: "Record not found" };
  softDeleteRecord(sheet, id, user);
  logAudit(user, "DELETE_" + sheet.toUpperCase(), sheet, id, "", "Success");
  return { status: "ok", message: "Record deactivated" };
}
