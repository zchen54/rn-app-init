import {loginTypeConstants} from '../types';

export const signUp = (
  formData: {
    email: string;
    password: string;
    vcode: string;
  },
  callback: Function,
) => ({
  type: loginTypeConstants.SIGN_UP,
  formData,
  callback,
});

export const login = (
  username: string,
  password: string,
  captcha?: string,
  callback?: Function,
) => ({
  type: loginTypeConstants.LOGIN,
  username,
  password,
  captcha,
  callback,
});

export const addLoginFailedCount = () => ({
  type: loginTypeConstants.ADD_LOGIN_FAILED_COUNT,
});

export const clearLoginFailedCount = () => ({
  type: loginTypeConstants.CLEAR_LOGIN_FAILED_COUNT,
});

export const loginSuccess = (currentUserInfo: Array<any>) => ({
  type: loginTypeConstants.LOGIN_SUCCESS,
  currentUserInfo,
});

export const logout = (authToken: string, callback?: Function) => ({
  type: loginTypeConstants.LOGOUT,
  authToken,
  callback,
});

export const updateCurrentUserInfo = (currentUserInfo: any) => ({
  type: loginTypeConstants.UPDATE_CURRENT_USER_INFO,
  currentUserInfo,
});

// change user info
export const changeUserInfo = (
  authToken: string,
  nickName: string,
  userPic: string,
  gender: number | undefined,
  phone: string | undefined,
  callback?: Function,
) => ({
  type: loginTypeConstants.CHANGE_USER_INFO,
  authToken,
  nickName,
  userPic,
  gender,
  phone,
  callback,
});

export const changeUserInfoSuccess = (
  nickName: string,
  userPic: string,
  gender: number,
  phone: string,
) => ({
  type: loginTypeConstants.CHANGE_USER_INFO_SUCCESS,
  nickName,
  userPic,
  gender,
  phone,
});

// 获取验证码
export const getVCode = (
  email: string,
  codeType: number,
  callback?: Function,
) => ({
  type: loginTypeConstants.GET_VCODE,
  email,
  codeType,
  callback,
});

// 忘记密码
export const resetPassword = (
  email: string,
  vcode: string,
  password: string,
  callback?: Function,
) => ({
  type: loginTypeConstants.RESET_PASSWORD,
  email,
  vcode,
  password,
  callback,
});

// 修改密码
export const changePassword = (
  authToken: string,
  oldPassword: string,
  password: string,
  callback?: Function,
) => ({
  type: loginTypeConstants.CHANGE_PASSWORD,
  authToken,
  oldPassword,
  password,
  callback,
});

export const fetchUserRole = (authToken: string, callback?: Function) => ({
  type: loginTypeConstants.FETCH_USER_ROLE,
  authToken,
  callback,
});

export const sendfeedBack = (
  authToken: string,
  options: {
    description: string;
    images: Array<string>;
    email: string;
  },
  callback: Function,
) => ({
  type: loginTypeConstants.SEND_FEEDBACK,
  authToken,
  options,
  callback,
});

export const fetchAllData = (
  authToken: string,
  isShowToast: boolean,
  callback?: Function,
  isFrozen?: boolean,
) => ({
  type: loginTypeConstants.FETCH_ALL_DATA,
  authToken,
  isShowToast,
  callback,
  isFrozen,
});
