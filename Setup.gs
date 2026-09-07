/** EduCare School ERP — Setup.gs (idempotent) */

function setupSchoolSystem() {
  getAllSheets().forEach(ensureSheet);

  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    // Roles (skip if exist)
    if (getAllRecords("Roles").length === 0) {
      Object.keys(ROLE_MODULE_PERMS).forEach(function(r) {
        insertRecord("Roles", { name: r, description: r + " role", is_system: true,
          permissions: JSON.stringify(ROLE_MODULE_PERMS[r]), status: "Active" }, null);
      });
    }
    // Super Admin (idempotent)
    var admins = getAllRecords("Users", { where: { username: "admin" } });
    if (admins.length === 0) {
      var role = getAllRecords("Roles").filter(function(r){ return r.name === "Super Admin"; })[0];
      insertRecord("Users", { username: "admin", password_hash: hashPassword("admin123"),
        name: "System Administrator", role_id: role ? role.id : "", role_name: "Super Admin",
        status: "Active", must_change_password: true }, null);
 Equality }
    // Settings
    var defaults = {
      school_name: "EduCare School", school_subtitle: "Complete School Management System",
      address: "", city: "", state: "", country: "", pincode: "", phone: "", email: "",
      website: "", principal_name: "", school_code: "", affiliation_no: "", registration_no: "",
      currency: "₹", date_format: "dd/MM/yyyy", timezone: Session.getScriptTimeZone(),
      receipt_prefix: "REC", student_prefix: "STU", employee_prefix: "EMP",
      current_academic_year: "2025-26", late_fee_per_day: "10", grading_scale: "A1:91-100|A2:81-90|B1:71-80|B2:61-70|C1:51-60|C2:41-50|D:33-40|E:0-32"
    };
    var existingSettings = getAllRecords("Settings");
    Object.keys(defaults).forEach(function(k) {
      var found = existingSettings.some(function(s){ return s.key === k; });
      if (!found) getSheet("Settings").appendRow([k, defaults[k]]);
    });
    // Academic year
    if (getAllRecords("AcademicYears").length === 0) {
      insertRecord("AcademicYears", { year: "2025-26", start_date: "2025-04-01",
        end_date: "2026-03-31", status: "Active" }, null);
    }
    logAudit(null, "SETUP", "System", "", "setupSchoolSystem executed", "Success");
    return { status: "ok", message: "Setup complete. Login: admin / admin123" };
  } finally { lock.releaseLock(); }
}

function setupDemoData() {
  var r = setupSchoolSystem();
  if (getAllRecords("Students").length > 0) return { status: "ok", message: "Demo data already present. Use resetDemoData() first." };
  var year = "2025-26";
  // Houses
  ["Red House","Blue House","Green House","Yellow House"].forEach(function(h){ insertRecord("Houses", { name: h, color: "#ef4444" }, null); });
  // Teachers
  var tNames = ["Anita Sharma","Rajesh Kumar","Priya Verma","Sunil Patel","Meena Gupta"];
  tNames.forEach(function(n){ insertRecord("Teachers", { name: n, employee_id: generateId("Teachers"),
    gender: "Female", phone: "9876543210", email: n.split(" ")[0].toLowerCase()+"@educare.test",
    department: "Academics", designation: "Teacher", joining_date: "2024-04-01", salary: 35000, status: "Active" }, null); });
  var teachers = getAllRecords("Teachers");
  // Staff
  ["Ramesh Yadav|Security","Sunita Devi|Housekeeping","Vikram Singh|Transport","Geeta Joshi|Reception","Arun Nair|IT"]
    .forEach(function(x){ var p = x.split("|");
      insertRecord("Staff", { name: p[0], employee_id: generateId("Staff"), department: p[1],
        designation: p[1], phone: "9876500000", joining_date: "2024-06-01", salary: 18000, status: "Active" }, null); });
  // Classes + Sections
  for (var i = 1; i <= 5; i++) {
    var c = insertRecord("Classes", { name: "Class " + i, code: "C" + i, order: i,
      capacity: 40, academic_year: year, status: "Active", class_teacher_id: teachers[i-1] ? teachers[i-1].id : "" }, null);
    ["A","B"].forEach(function(s){ insertRecord("Sections", { class_id: c.id, name: s, room: "R-" + i + s, capacity: 20, status: "Active" }, null); });
  }
  var classes = getAllRecords("Classes"), sections = getAllRecords("Sections");
  // Parents + Students
  for (var p = 0; p < 10; p++) {
    var par = insertRecord("Parents", { name: "Parent " + (p+1), relationship: "Father",
      phone: "98765432" + (10+p), email: "parent"+(p+1)+"@test.com", status: "Active" }, null);
    for (var c = 0; c < 2; c++) {
      var cls = classes[(p*2+c) % classes.length], sec = sections.filter(function(s){ return s.class_id === cls.id; })[0];
      var st = insertRecord("Students", { first_name: "Student", last_name: (p*2+c+1), gender: c ? "Male" : "Female",
        admission_no: generateId("Students"), roll_no: (c+1), class_id: cls.id, section_id: sec ? sec.id : "",
        parent_id: par.id, status: "Active", academic_year: year }, null);
      insertRecord("ParentStudents", { parent_id: par.id, student_id: st.id, relationship: "Father" }, null);
    }
  }
  // Subjects
  var subs = ["English","Hindi","Mathematics","Science","Social Science"];
  classes.forEach(function(cl){ subs.forEach(function(sn){
    insertRecord("Subjects", { name: sn, code: sn.substring(0,3).toUpperCase() + "-" + cl.code,
      class_id: cl.id, type: "Core", max_marks: 100, pass_marks: 33, theory_marks: 100, status: "Active" }, null); }); });
  // Attendance for last 5 school days
  var students = getAllRecords("Students");
  for (var d = 1; d <= 5; d++) {
    var dt = new Date(); dt.setDate(dt.getDate() - d);
    var ds = Utilities.formatDate(dt, Session.getScriptTimeZone(), "yyyy-MM-dd");
    students.forEach(function(s, idx) {
      insertRecord("Attendance", { date: ds, student_id: s.id, class_id: s.class_id, section_id: s.section_id,
        status: (idx % 7 === 0 ? "Absent" : idx % 11 === 0 ? "Late" : "Present") }, null);
    });
  }
  // Exams + Marks
  var ex = insertRecord("Exams", { name: "Half Yearly Exam", type: "Half Yearly", academic_year: year,
    class_id: classes[0].id, start_date: "2025-09-15", end_date: "2025-09-25", max_marks: 100, pass_marks: 33, status: "Active" }, null);
  var sub1 = getAllRecords("Subjects", { where: { class_id: classes[0].id } })[0];
  students.filter(function(s){ return s.class_id === classes[0].id; }).forEach(function(s) {
    insertRecord("Marks", { exam_id: ex.id, class_id: classes[0].id, section_id: s.section_id, subject_id: sub1.id,
      student_id: s.id, max_marks: 100, marks: 50 + Math.floor(Math.random() * 45), grade: "", status: "Submitted" }, null);
  });
  // Fees + payments
  classes.forEach(function(cl){ ["Tuition","Exam","Library"].forEach(function(ft, i){
    insertRecord("FeeStructures", { academic_year: year, class_id: cl.id, fee_type: ft,
      amount: (i+1)*1000, frequency: "Annual", status: "Active" }, null); }); });
  students.slice(0, 10).forEach(function(s) {
    insertRecord("Fees", { student_id: s.id, academic_year: year, fee_type: "Tuition",
      amount: 1000, due_date: "2025-06-15", status: "Pending" }, null);
    if (Number(s.last_name) % 2 === 0) {
      var pid = generateId("FeePayments");
      insertRecord("FeePayments", { receipt_no: "REC-2025-" + pid.split("-")[1], student_id: s.id,
        amount: 1000, method: "Cash", collected_by: "admin" }, null);
    }
  });
  // Books
  ["Introduction to Physics|Newton","English Grammar|Wren","History of India|Guha","Mathematics Basics|Sharma","Chemistry Primer|Lee"]
    .forEach(function(b, i){ var q = b.split("|");
      insertRecord("Books", { book_code: "BOOK-" + (i+1), title: q[0], author: q[1], total_copies: 5, available_copies: 5, status: "Active" }, null); });
  // Vehicles + Routes
  ["DL01AB1234","DL02CD5678"].forEach(function(v, i){
    var veh = insertRecord("Vehicles", { vehicle_no: v, type: "Bus", capacity: 40, driver: "Driver " + (i+1),
      driver_phone: "9876500" + (10+i), status: "Active" }, null);
    insertRecord("Routes", { name: "Route " + (i+1), stops: "Stop A, Stop B, Stop C", vehicle_id: veh.id,
      pickup_time: "07:30", drop_time: "15:30", status: "Active" }, null);
  });
  // Notices + Events + Homework
  insertRecord("Notices", { title: "Welcome to 2025-26", description: "New academic year begins April 1.",
    audience: "Everyone", publish_date: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    priority: "High", status: "Active" }, null);
  insertRecord("Events", { title: "Annual Day", type: "Annual Day", date: "2025-12-20", venue: "Main Hall", status: "Active" }, null);
  insertRecord("Events", { title: "Parent Teacher Meeting", type: "PTM", date: "2025-11-10", venue: "Classrooms", status: "Active" }, null);
  insertRecord("Homework", { class_id: classes[0].id, subject_id: sub1.id, teacher_id: teachers[0].id,
    title: "Chapter 1 Exercise", description: "Complete all exercises.", assigned_date: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    due_date: "2025-10-30", status: "Active" }, null nest);
  logAudit(null, "SETUP", "System", "", "Demo data created", "Success");
  return { status: "ok", message: "Demo data created: " + getAllRecords("Students").length + " students, fees, attendance, books, transport." };
}

function resetDemoData() {
  var tx = ["Students","ParentStudents","Parents","Teachers","Staff","Classes","Sections","Subjects","Houses",
    "Attendance","Exams","Marks","FeeStructures","Fees","FeePayments","Books","Vehicles","Routes",
    "Notices","Events","Homework"];
  tx.forEach(function(name) {
    var s = getSheet(name);
    if (s.getLastRow() > 1) s.deleteRows(2, s.getLastRow() - 1);
  });
  return { status: "ok", message: "Demo data cleared. Run setupDemoData() to regenerate." };
}
