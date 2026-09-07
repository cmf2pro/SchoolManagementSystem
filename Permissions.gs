/** EduCare School ERP — Permissions.gs (server-side RBAC) */

var MODULE_ACTIONS = {}; // action -> required module permission e.g. "students.save" -> {module:"Students", perm:"edit"}

function regAction(action, module, perm) { MODULE_ACTIONS[action] = { module: module, perm: perm }; }

// Registry: every API action registers its requirement
regAction("auth.login", null, null);
regAction("auth.logout", null, null);
regAction("auth.changePassword", null, null);
regAction("bootstrap", null, "view");
regAction("students.list", "Students", "view");
regAction("students.save", "Students", "create");
regAction("students.update", "Students", "edit");
regAction("students.delete", "Students", "delete");
regAction("attendance.list", "Attendance", "view");
regAction("attendance.save", "Attendance", "manage");
regAction("fees.list", "Fees", "view");
regAction("fees.collect", "Fees", "create");
regAction("generic.list", null, "view");
regAction("generic.save", null, "create");
regAction("generic.delete", null, "delete");

var ROLE_MODULE_PERMS = {
  "Super Admin": { "*": "manage" },
  "Administrator": { Students:"manage", Attendance:"manage", Fees:"manage", Exams:"manage", Marks:"manage", Settings:"view", Users:"manage", Library:"manage", Transport:"manage", HR:"manage", Hostel:"manage", Inventory:"manage", Reports:"view", Academics:"manage" },
  "Principal": { Students:"view", Attendance:"view", Exams:"view", Marks:"approve", Fees:"view", Library:"view", Reports:"view", Academics:"manage", HR:"view" },
  "Vice Principal": { Students:"view", Attendance:"edit", Exams:"view", Marks:"edit", Fees:"view", Reports:"view", Academics:"edit" },
  "Teacher": { Students:"view", Attendance:"manage", Exams:"view", Marks:"create", Homework:"manage", Library:"view", Reports:"view", Academics:"view" },
  "Class Teacher": { Students:"view", Attendance:"manage", Exams:"view", Marks:"edit", Reports:"view", Academics:"view" },
  "Accountant": { Fees:"manage", Finance:"manage", Payroll:"manage", Students:"view", Reports:"view" },
  "HR Manager": { HR:"manage", Payroll:"manage", Staff:"manage", Reports:"view" },
  "Librarian": { Library:"manage", Students:"view", Reports:"view" },
  "Receptionist": { Admissions:"manage", Students:"view", Notices:"manage" },
  "Transport Manager": { Transport:"manage", Students:"view" },
  "Hostel Warden": { Hostel:"manage", Students:"view" },
  "Inventory Manager": { Inventory:"manage" },
  "Parent": { Students:"view", Fees:"view", Exams:"view", Attendance:"view", Homework:"view", Notices:"view" },
  "Student": { Students:"view", Fees:"view", Exams:"view", Attendance:"view", Homework:"view", Notices:"view" },
  "Staff": { Notices:"view" }
};

function userCan(user, moduleName, perm) {
  if (!user) return false;
  var map = ROLE_MODULE_PERMS[user.role_name];
  if (!map) return false;
  if (map["*"]) return true; // Super Admin style wildcard
  var have = map[moduleName];
  if (!have) return false;
  if (have === "manage") return true;
  var order = ["view","create","edit","delete","approve","export","print","manage"];
  return order.indexOf(have) >= order.indexOf(perm);
}

function authorize(token, action) {
  var user = getSession(token);
  if (!user) return { user: null, allowed: false, message: "Session expired. Please login again." };
  var req = MODULE_ACTIONS[action];
  if (!req) return { user: user, allowed: false, message: "Unknown action" };
  if (!req.module) return { user: user, allowed: true }; // auth actions
  if (req.module === "generic") return { user: user, allowed: true }; // handler re-checks per sheet
  if (!userCan(user, req.module, req.perm)) return { user: user, allowed: false, message: "Permission denied" };
  return { user: user, allowed: true };
}
