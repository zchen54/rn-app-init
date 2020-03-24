export const API_v2 = {
  // auth
  signIn: { method: "POST", url: "auth" }, // 1
  logout: { method: "DELETE", url: "auth" }, // 1
  loginWeb: { method: "PUT", url: "auth/qrcode" }, // 1
  // company
  getCompany: { method: "GET", url: "company" }, // 1
  createCompany: { method: "POST", url: "company" }, // 1
  updateCompany: { method: "PUT", url: "company" }, // ---
  getDepartment: { method: "GET", url: "company/department" }, // ---
  createDepartment: { method: "POST", url: "company/department" }, // ---
  updateDepartment: { method: "PUT", url: "company/department" }, // ---
  deleteDepartment: { method: "DELETE", url: "company/department" }, // ---
  getStaff: { method: "GET", url: "company/staff" }, // 1
  updateStaff: { method: "PUT", url: "company/staff" }, // 1
  removeStaff: { method: "DELETE", url: "company/staff" }, // ---
  addManager: { method: "POST", url: "company/department/manager" }, // ---
  removeManager: { method: "DELETE", url: "company/department/manager" }, // ---
  activateCompany: { method: "POST", url: "company/activation" }, // ---
  deactivateCompany: { method: "DELETE", url: "company/activation" }, // ---
  // dynamic TODO...

  // email
  sendSignUpCode: { method: "POST", url: "email/code" }, // 1
  sendResetCode: { method: "PUT", url: "email/code" }, // 1
  // feedback
  createFeedback: { method: "POST", url: "feedback" }, // 1
  // file
  uploadFile: { method: "POST", url: "file" }, // 1
  // friend
  getFriend: { method: "GET", url: "friend" }, // 1
  deleteFriend: { method: "DELETE", url: "friend" }, // 1
  // group
  getGroup: { method: "GET", url: "group" }, // 1
  createGroup: { method: "POST", url: "group" }, // 1
  updateGroup: { method: "PUT", url: "group" }, // 1
  getGroupMember: { method: "GET", url: "group/member" }, // 1
  groupMemberExit: { method: "DELETE", url: "group/member" }, // 1
  // message
  getMessage: { method: "GET", url: "message" }, // 1
  updateMessage: { method: "PUT", url: "message" }, // 1
  getMessageUnreadCount: { method: "GET", url: "message/unread" }, // 1
  joinCompany: { method: "POST", url: "message/staff" }, // 1
  exitCompany: { method: "DELETE", url: "message/staff" }, // 1
  handleJoinCompany: { method: "POST", url: "message/staff/audit" }, // 1
  handleExitCompany: { method: "DELETE", url: "message/staff/audit" }, // 1
  inviteGroupMember: { method: "POST", url: "message/group/member" }, // 1
  handleGroupInvite: { method: "POST", url: "message/group/member/audit" }, // 1
  getDynamic: { method: "GET", url: "message/dynamic" }, // 1
  createDynamic: { method: "POST", url: "message/dynamic" }, // 1
  addFriend: { method: "POST", url: "message/friend" }, // 1
  handleAddFriend: { method: "POST", url: "message/friend/audit" }, // 1
  // permission
  getPermission: { method: "GET", url: "permission" }, // ---
  createPermission: { method: "POST", url: "permission" }, // ---
  updatePermission: { method: "PUT", url: "permission" }, // ---
  deletePermission: { method: "DELETE", url: "permission" }, // ---
  getPermissionGroup: { method: "GET", url: "permission/group" }, // ---
  createPermissionGroup: { method: "POST", url: "permission/group" }, // ---
  updatePermissionGroup: { method: "PUT", url: "permission/group" }, // ---
  deletePermissionGroup: { method: "DELETE", url: "permission/group" }, // ---
  // region
  getReseller: { method: "GET", url: "dealer/list" }, // 1
  getCountry: { method: "GET", url: "region/country" }, // 1
  getCity: { method: "GET", url: "region/city" }, // 1
  // report
  getReportInfo: { method: "GET", url: "report" }, // 1
  getUserReport: { method: "GET", url: "report/user" }, // 1
  createUserReport: { method: "POST", url: "report/user" }, // 1
  updateUserReport: { method: "PUT", url: "report/user" }, // 1
  deleteUserReport: { method: "DELETE", url: "report/user" }, // 1
  getCompanyReport: { method: "GET", url: "report/company" }, // 1
  createCompanyReport: { method: "POST", url: "report/company" }, // 1
  updateCompanyReport: { method: "PUT", url: "report/company" }, // ---
  deleteCompanyReport: { method: "DELETE", url: "report/company" }, // 1
  createReportByShare: { method: "POST", url: "report/share" }, // 1
  getReportFields: { method: "GET", url: "report/field" }, // 1
  // role TODO...

  // simplycool
  getTodayStatistic: { method: "GET", url: "simplycool/statistic" }, // ---
  getSimplyCoolReport: { method: "GET", url: "simplycool/report" }, // ---
  // system
  getSystemConfig: { method: "GET", url: "system/config" }, //
  updateSystemConfig: { method: "PUT", url: "system/config" }, // ---
  getVersion: { method: "GET", url: "system/version" }, //
  createVersion: { method: "POST", url: "system/version" }, // ---
  updateVersion: { method: "PUT", url: "system/version" }, // ---
  getVersionList: { method: "GET", url: "system/version/list" }, // ---
  // template
  getTemplateInfo: { method: "GET", url: "template" }, // ---
  getUserTemplate: { method: "GET", url: "template/user" }, // 1
  createUserTemplate: { method: "POST", url: "template/user" }, // 1
  updateUserTemplate: { method: "PUT", url: "template/user" }, // 1
  deleteUserTemplate: { method: "DELETE", url: "template/user" }, // 1
  getCompanyTemplate: { method: "GET", url: "template/company" }, // 1
  createCompanyTemplate: { method: "POST", url: "template/company" }, // 1
  updateCompanyTemplate: { method: "PUT", url: "template/company" }, // 1
  deleteCompanyTemplate: { method: "DELETE", url: "template/company" }, // 1
  templateNameIsExist: { method: "GET", url: "template/name/exist" }, // 1
  getSystemTemplate: { method: "GET", url: "template/system" }, // 1
  shareTemplate: { method: "PUT", url: "template/share" }, // 1
  getTemplateByShare: { method: "GET", url: "template/share" }, // 1
  // user
  getUserInfo: { method: "GET", url: "user" }, // 1
  signUp: { method: "POST", url: "user" }, // 1
  modifyUserInfo: { method: "PUT", url: "user" }, // 1
  resetPassword: { method: "POST", url: "user/password" }, // 1
  modifyPassword: { method: "PUT", url: "user/password" } // 1
};
