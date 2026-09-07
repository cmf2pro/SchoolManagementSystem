/** EduCare School ERP — Students.gs */

function studentsList(user, p) {
  var p = p || {};
  var recs = getAllRecords("Students", { where: p.filters || {} });
  var search = (p.search || "").toLowerCase();
  if (search) recs = recs.filter(function(r){
    return (String(r.first_name)+" "+String(r.last_name)+" "+String(r.admission_no)).toLowerCase().indexOf(search) !== -1;
  });
  var page = Math.max(1, p.page || 1), size = Math.min(100, p.pageSize || 25);
  var total = recs.length;
  recs = recs.slice((page-1)*size, page*size);
  // parent-child scoping for Parent/Student roles
  if (user.role_name === "Parent" || user.role_name === "Student") {
    var children = findRecords("ParentStudents", "parent_id", user.link_id).map(function(x){ return String(x.student_id); });
    var allowedIds = children.concat([String(user.link_id)]);
    recs = recs.filter(function(r){ return allowedIds.indexOf(String(r.id)) !== -1; });
 { status: "ok", data: { records: recs, total: total, page: page, pageSize: size } };
}

function studentsSave(user, d (!d.first_name || !d.class_id) return { status: "error", message: "First name and class are required" };
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var year = getActiveYear();
    d.id = generateId("Students");
    d.academic_year = year ? year.year : "";
    d.status = d.status || "Active";
    insertRecord("Students", d, user);
    logAudit(user, "CREATE_STUDENT", "Students", d.id, d.first_name + " " + (d.last_name||""), "Success");
    return { status: "ok", data: d, message: "Student added successfully" };
  } finally { lock.releaseLock(); }
}

function studentsUpdate(user, id, d) {
  var rec = getRecordById("Students", id);
  if (!rec) return { status: "error", message: "Student not found" };
  updateRecord("Students", id, d, user);
  logAudit(user, "UPDATE_STUDENT", "Students", id, "", "Success");
  return { status: "ok", message: "Student updated" };
}

function studentsDelete(user, id) {
  var rec = getRecordById("Students", id);
  if (!rec) returnerror", message: "Student not found" };
  softDeleteRecord("Students", id, user);
  logAudit(user, "DEACTIVATE_STUDENT", "Students", id, rec.first_name, "Success");
  return { status: "ok", message: "Student deactivated" };
}
