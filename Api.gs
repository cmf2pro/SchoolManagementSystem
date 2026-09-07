/** EduCare School ERP — Api.gs (single dispatcher) */

function processApiRequest(action, params) {
  params = params || {};
  try {
    var auth = authorize(params.token, action);
    if (!auth.allowed) return { status: "error", message: auth.message };
    switch (action) {
      case "auth.login":          return login(params.username, params.password);
      case "auth.logout":         return logout(params.token);
      case "auth.changePassword": return changeMyPassword(params.token, params.oldPassword, params.newPassword);
      case "bootstrap":           return bootstrap(params.token);
      case "students.list":       return studentsList(auth.user, params);
      case "students.save":       return studentsSave(auth.user, params.data);
      case "students.update":     return studentsUpdate(auth.user, params.id, params.data);
      case "students.delete":     return studentsDelete(auth.user, params.id);
      case "attendance.list":     return attendanceList(auth.user, params);
      case "attendance.save":     return attendanceSave(auth.user, params);
      case "fees.list":           return feesList(auth.user, params);
      case "fees.collect":        return feesCollect(auth.user, params);
      case "generic.list":        return genericList(auth.user, params.sheet, params.filters, params.page, params.pageSize, params.search);
      case "generic.save":        return genericSave(auth.user, params.sheet, params.data);
      case "generic.delete":      return genericDelete(auth.user, params.sheet, params.id);
      default: return { status: "error", message: "Unknown action: " + action };
    }
  } catch (e) {
    logAudit(null, "ERROR", "System", "", String(e && e.message || e), "Error");
    return { status: "error", message: "An internal error occurred. Please try again." };
  }
}
