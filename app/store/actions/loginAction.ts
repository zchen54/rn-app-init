import {ActionTypes} from '../types';

export const login = (
  username: string,
  password: string,
  captcha?: string,
  callback?: Function,
) => ({
  type: ActionTypes.LOGIN,
  username,
  password,
  captcha,
  callback,
});

export const loginSuccess = (currentUserInfo: Array<any>) => ({
  type: ActionTypes.LOGIN_SUCCESS,
  currentUserInfo,
});

export const logout = (authToken: string, callback?: Function) => ({
  type: ActionTypes.LOGOUT,
  authToken,
  callback,
});

export const updateCurrentUserInfo = (currentUserInfo: any) => ({
  type: ActionTypes.UPDATE_CURRENT_USER_INFO,
  currentUserInfo,
});

export const fetchAllData = (
  authToken: string,
  isShowToast: boolean,
  callback?: Function,
) => ({
  type: ActionTypes.FETCH_ALL_DATA,
  authToken,
  isShowToast,
  callback,
});
