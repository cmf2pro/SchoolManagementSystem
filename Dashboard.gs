/** EduCare School ERP — Dashboard.gs (lightweight bootstrap, per §73) */

function bootstrap(token) {
  var user = getSession(token);
  if (!user) return { status: "error", message: "Session expired" };
  var year = getActiveYear();
  var students = getAllRecords("Students", { where: { academic_year: year ? year.year : "" } });
  var active = students.filter(function(s){ return s.status === "Active"; });
  var teachers = getAllRecords("Teachers").filter(function(t){ return t.status === "Active"; });
  var staff = getAllRecords("Staff").filter(function(t){ return t.status === "Active"; });
  var classes = getAllRecords("Classes");
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  var attToday = getAllRecords("Attendance", { where: { date: today } });
  var payments = getAllRecords("FeePayments");
  var expenses = getAllRecords("Expenses");
  var books = getAllRecords("Books");
  var notices = getAllRecords("Notices").slice(-5).reverse();

  var collected = payments.reduce(function(a,p){ return a + (Number(p.amount)||0); }, 0);
  var expTotal  = expenses.reduce(function(a,p){ return a + (Number(p.amount)||0); }, 0);

  var byClass = {};
  students.forEach(function(s){ var c = s.class_id; byClass[c] = (byClass[c]||0)+1; });
  var classLabels = classes.map(function(c){ return c.name; });
  var classCounts = classes.map(function(c){ return byClass[c.id] || 0; });

  var stats = {
    totalStudents: students.length, activeStudents: active.length, teachers: teachers.length,
    staff: staff.length, classes: classes.length,
    presentToday: attToday.filter(function(a){ return a.status === "Present"; }).length,
    absentToday: attToday.filter(function(a){ return a.status === "Absent"; }).length,
    lateToday: attToday.filter(function(a){ return a.status === "Late"; }).length,
    collected: collected, expenses: expTotal,
    books: books.length, issuedBooks: books.reduce(function(a,b){ return a + (b.total_copies - b.available_copies); }, 0)
  };

  return {
    status: "ok",
    data: {
      user: { username: user.username, name: user.name, role_name: user.role_name },
      academicYear: year ? year.year : "",
      stats: stats,
      charts: { classLabels: classLabels, classCounts: classCounts },
      recentNotices: notices,
      perms: ROLE_MODULE_PERMS[user.role_name] || {}
    }
  };
}

function getActiveYear() {
  var ys = getAllRecords("AcademicYears");
  for (var i = 0; i < ys.length; i++) if (ys[i].status === "Active") return ys[i];
  return ys.length ? ys[ys.length - 1] : null;
}
