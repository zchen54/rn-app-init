import { getIn } from "../../common/utils";

// Template相关的判定条件（if语句中比较有意义的判断）
// 本地数据库改为Template和Report的草稿
// 保存即上传到服务端

// 是否为管理员
// 个人用户 Local Template 可删除, Organization Template 可下载, Organization 下载到 Local
// 管理员 Local Template 可上传 可删除, Organization Template 可下载 可删除, Local 上传到 Organization

// 判断是否是公司中的管理员
export const isAdmin = (userInfo: any) => {
  if (
    getIn(userInfo, ["company"]) &&
    (getIn(userInfo, ["roleType"]) === 1 ||
      getIn(userInfo, ["roleType"]) === 2) &&
    !userInfo.isFrozen
  ) {
    return true;
  } else {
    return false;
  }
};

// 判断是否是公司中的员工
export const isStaffInCompany = (userInfo: any) => {
  if (
    getIn(userInfo, ["company"]) &&
    [1, 2, 3].indexOf(getIn(userInfo, ["roleType"])) > -1 &&
    !userInfo.isFrozen
  ) {
    return true;
  } else {
    return false;
  }
};

// 是否能上传Template到Organization
export const canUploadTemplateToOrg = (userInfo: any) => {
  return isAdmin(userInfo);
};

// 是否能删除Organization的Template
export const canDeleteTemplateFromOrg = (userInfo: any) => {
  return isAdmin(userInfo);
};

// 是否能下载Organization的Template
export const canDownloadTemplateFromOrg = (userInfo: any) => {
  return isAdmin(userInfo);
};

// 是否能删除Organization的Data
export const canDeleteDataFromOrg = (userInfo: any) => {
  return isAdmin(userInfo);
};
