/** EduCare School ERP — Auth.gs (sessions + password hashing) */

var SESSION_HOURS = 6;

function hashPassword(pw) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, "EduCare"+pw+"" + pw + ""+pw+"salt");
  return raw.map(function(b){ var v = (b < 0 ? b + 256 : b).toString(16); return v.length === 1 ? "0" + v : v; }).join("");
}

function login(username, password) {
  try {
    if (!username || !password) return { status: "error", message: "Username and password required" };
    var users = getAllRecords("Users");
    var user = null;
    for (var i = 0; i < users.length; i++) {
      if (String(users[i].username).toLowerCase() === String(username).trim().toLowerCase()) { user = users[i]; break; }
    }
    if (!user || user.status !== "Active") return { status: "error", message: "Invalid credentials or disabled account" };
    if (user.password_hash !== hashPassword(password)) {
      logAudit({username: username, role_name: "?"}, "LOGIN_FAILED", "Auth", "", "Failed login", "Failed");
      return { status: "error", message: "Invalid credentials" };
    }
    var token = Utilities.getUuid();
    CacheService.getUserCache().put("sess_" + token, JSON.stringify({
      id: user.id, username: user.username, name: user.name, role_id: user.role_id,
      role_name: user.role_name, link_id: user.link_id
    }), SESSION_HOURS * 3600);
    logAudit(user, "LOGIN", "Auth", user.id, user.username + " logged in", "Success");
    return { status: "ok", data: { token: token, user: { username: user.username, name: user.name, role_name: user.role_name } } };
  } catch (e) {
    return { status: "error", message: "Login failed. Please try again." };
  }
}

function getSession(token) {
  if (!token) return null;
  var raw = CacheService.getUserCache().get("sess_" + token);
  return raw ? JSON.parse(raw) : null;
}

function logout(token) {
  var u = getSession(token);
  if (u) {
    CacheService.getUserCache().remove("sess_" + token);
    logAudit(u, "LOGOUT", "Auth", u.id, u.username + " logged out", "Success");
  }
  return { status: "ok" };
}

function changeMyPassword(token, oldPw, newPw) {
  var u = getSession(token);
  if (!u) return { status: "error", message: "Session expired" };
  var rec = getRecordById("Users", u.id);
  if (!rec || rec.password_hash !== hashPassword(oldPw)) return { status: "error", message: "Current password incorrect" };
  if (!newPw || newPw.length < 6) return { status: "error", message: "New password must be at least 6 characters" };
  updateRecord("Users", u.id, { password_hash: hashPassword(newPw), must_change_password: false }, u);
  logAudit(u, "CHANGE_PASSWORD", "Auth", u.id, "", "Success");
  return { status: "ok", message: "Password changed successfully" };
}
