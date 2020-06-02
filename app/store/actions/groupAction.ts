import { groupTypeConstants } from "../types";

// 获取用户所在的group列表
export const fetchGroupList = (
  authToken: string,
  isCreator: boolean,
  callback?: Function
) => ({
  type: groupTypeConstants.FETCH_GROUPS,
  authToken,
  isCreator,
  callback
});

export const getGroupList = () => ({
  type: groupTypeConstants.GET_GROUPS
});

export const fetchGroupsSuccess = (
  groups: Array<any>,
  createdGroups: Array<any>
) => ({
  type: groupTypeConstants.FETCH_GROUPS_SUCCESS,
  groups,
  createdGroups
});

// 创建群组
export const createGroup = (
  authToken: string,
  name: string,
  remark: string,
  invitee: Array<string>,
  callback?: Function
) => ({
  type: groupTypeConstants.CREATE_GROUP,
  authToken,
  name,
  remark,
  invitee,
  callback
});

// 获取指定群组下的所有用户
export const getGroupMembers = (
  authToken: string,
  groupId: string,
  callback?: Function
) => ({
  type: groupTypeConstants.GET_GROUP_MEMBERS,
  authToken,
  groupId,
  callback
});

export const getGroupMembersSuccess = (group: Array<any>) => ({
  type: groupTypeConstants.GET_GROUP_MEMBERS_SUCCESS,
  group
});

// 选择群组
export const selectGroup = (groupSelect: any) => ({
  type: groupTypeConstants.SELECT_GROUP,
  groupSelect
});
// 清除选择的群组
export const clearGroupSelect = () => ({
  type: groupTypeConstants.CLEAR_GROUP_SELECT
});

// 更新群组信息
export const updateGroup = (
  authToken: string,
  groupId: string,
  name: string,
  remark: string,
  callback?: Function
) => ({
  type: groupTypeConstants.UPDATE_GROUP,
  authToken,
  groupId,
  name,
  remark,
  callback
});

// 邀请用户加入群组
export const joinGroup = (
  authToken: string,
  usersId: Array<string>,
  groupId: string,
  callback?: Function
) => ({
  type: groupTypeConstants.JOIN_GROUP,
  authToken,
  usersId,
  groupId,
  callback
});

// 退出群组
export const exitGroup = (
  authToken: string,
  groupId: string,
  callback?: Function
) => ({
  type: groupTypeConstants.EXIT_GROUP,
  authToken,
  groupId,
  callback
});

// z转让群组 undo
export const transferGroup = (
  authToken: string,
  userId: string,
  groupId: string,
  callback?: Function
) => ({
  type: groupTypeConstants.TRANSFER_GROUP,
  authToken,
  userId,
  groupId,
  callback
});

// 删除指定群组中的指定用户
export const deleteUser = (
  authToken: string,
  usersId: Array<string>,
  groupId: string,
  callback?: Function
) => ({
  type: groupTypeConstants.DELETE_USER,
  authToken,
  usersId,
  groupId,
  callback
});
