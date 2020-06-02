import { friendTypeConstants } from "../types";
// 获取本地好友列表
export const getFriendList = () => ({
  type: friendTypeConstants.GET_FRIENDS
});
// 获取好友列表（服务器）
export const fetchFriendList = (authToken: string, callback?: Function) => ({
  type: friendTypeConstants.FETCH_FRIENDLIST,
  authToken,
  callback
});

export const getFriendListSuccess = (friends: Array<any>) => ({
  type: friendTypeConstants.GET_FRIENDLIST_SUCCESS,
  friends
});

// 选择好友
export const selectFriend = (friendSelect: any) => ({
  type: friendTypeConstants.SELECT_FRIEND,
  friendSelect
});

// 请求添加好友
export const requestFriend = (
  authToken: string,
  email: string,
  callback?: Function
) => ({
  type: friendTypeConstants.ADD_FRIEND_BY_EMAIL,
  authToken,
  email,
  callback
});

// 删除好友
export const deleteFriend = (
  authToken: string,
  friendId: string,
  callback?: Function
) => ({
  type: friendTypeConstants.DELETE_FRIEND,
  authToken,
  friendId,
  callback
});

export const deleteFriendSuccess = (friendId: string) => ({
  type: friendTypeConstants.DELETE_FRIEND_SUCCESS,
  friendId
});

// 搜索user信息byEmail
export const searchUserByEmail = (
  authToken: string,
  email: string,
  callback?: Function
) => ({
  type: friendTypeConstants.SEARCH_USER_BY_EMAIL,
  authToken,
  email,
  callback
});
