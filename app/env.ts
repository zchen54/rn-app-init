'use strict';

export let releaseMode = false;
const productionServer = 'https://www.template2data.com/api/';
const testServer = 'https://data2go.allsworth.cn/api/';

export let serverURL = releaseMode ? productionServer : testServer;

export const setReleaseMode = (isRelease: boolean) => {
  releaseMode = isRelease;
  serverURL = releaseMode ? productionServer : testServer;
  // serverURL = productionServer;
};

export const fileTypeKey = 'fileType';
export const fileUploadURL = serverURL + 'api/FileUpload';
export const usernamePasswordKey = 'password';
export const ErrorTitle = 'Operate Failed';
export const ErrorMessage_400 = 'Bad Request';
export const ErrorMessage_403 = 'Permission Deny';
export const ErrorMessage_404 = 'Not Found';
export const ErrorMessage_415 = 'Unsupported Media Type';
export const ErrorMessage_Network_Offline = 'App is offline';
export const PlatFormAndroid = 'android';
export const PlatFormIOS = 'ios';
export const RedirectToLogin = -2; // api端定义的登录超时的错误码
export const ThumbFolderName = 'Thumbs';
export const Roles = {
  Admin: 'Admin',
  HR: 'HR',
  User: 'User',
};
