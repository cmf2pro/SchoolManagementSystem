/** EduCare School ERP — Fees.gs */

function feesList(user, p) {
  var filters = p.filters || {};
  if (user.role_name === "Parent") {
    var children = findRecords("ParentStudents", "parent_id", user.link_id).map(function(x){ return String(x.student_id); });
    filters.student_id = filters.student_id && children.indexOf(String(filters.student_id)) !== -1 ? filters.student_id : children;
  }
  var rec

> ⚠️ The response reached the length limit. Reply **continue** to get the rest.
