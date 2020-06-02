'use strict';
import {
  ErrorMessage_400,
  ErrorMessage_403,
  ErrorMessage_404,
  ErrorMessage_415,
  ErrorMessage_Network_Offline,
  ErrorTitle,
  fileTypeKey,
  fileUploadURL,
  RedirectToLogin,
} from '../../env';
import {Platform} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {PlatFormIOS, serverURL} from '../../env';
import {Toast, Modal, Portal} from '@ant-design/react-native';
import {clearUserInfo} from './storageUtils';
import NavigationService from './navigationService';

const isJsonString = (str: string) => {
  try {
    if (typeof JSON.parse(str) === 'object') {
      return true;
    }
  } catch (e) {}
  return false;
};

// 网络状态（防止多次弹出网络未连接的提示）
export let networkState = true;
// 服务器错误
export let serverError = false;

const handleResponseStatus = (response: any) => {
  // console.log("response--", response);

  switch (response.status) {
    case 400:
      return {RCode: 400, result: ErrorTitle, error: ErrorMessage_400};
    case 403:
      return {RCode: 403, result: ErrorTitle, error: ErrorMessage_403};
    case 404:
      return {RCode: 404, result: ErrorTitle, error: ErrorMessage_404};
    case 415:
      return {RCode: 415, result: ErrorTitle, error: ErrorMessage_415};
    default: {
      let json;
      try {
        json = response.json();
        return json;
      } catch (error) {
        return {
          result: 'failed',
          error: 'Server exception! Please try again later.',
        };
      }
    }
  }
};

// on iOS, the listener is fired immediately after registration
// on Android, we need to use `isConnected.fetch`, that returns a promise which resolves with a boolean
export const isNetworkConnected = () => {
  return new Promise(resolve => {
    NetInfo.fetch().then(state => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
      resolve(state.isConnected);
    });
  });
};

// export const uploadFile = (authToken, fileType, files, dispatch) => {
//   return isNetworkConnected()
//     .then(isConnected => {
//       if (isConnected) {
//         let headers = {
//           Accept: "application/json",
//           Authorization: "Bearer " + (authToken ? authToken : "")
//         };
//         let body = new FormData();
//         body.append(fileTypeKey, fileType);
//         if (files && files.length > 0) {
//           files.forEach(file => {
//             body.append("files", {
//               uri: file.uri,
//               name: file.fileName,
//               type: file.type
//             });
//           });
//         }
//         return fetch(fileUploadURL, { method: "POST", body, headers })
//           .then(res => {
//             if (res && res.status) {
//               return handleResponseStatus(res);
//             }
//           })
//           .then(resJson => dispatchError(resJson, dispatch))
//           .then(resJson => resJson)
//           .catch(error => {
//             console.error(error);
//           });
//       } else {
//         return { RCode: -1, RMsg: ErrorMessage_Network_Offline };
//       }
//     })
//     .catch(() => ({ RCode: -1, RMsg: ErrorMessage_Network_Offline }));
// };

export const httpRequest = (
  method: string,
  url: string,
  params: any,
  authToken: string,
) => {
  return _fetch(
    isNetworkConnected()
      .then(isConnected => {
        if (isConnected) {
          networkState = true;
          let headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Connection: 'close',
            type: 'getUserData',
            'x-access-token': authToken ? authToken : '',
          };
          if (method === 'GET') {
            url = generateGetUrl(url, params);
          }
          console.log(serverURL + url, method, '--->', headers, params);
          return (
            fetch(serverURL + url, {
              method: method.toUpperCase(),
              body: method !== 'GET' && params ? JSON.stringify(params) : null,
              headers,
            })
              .then(res => {
                if (res && res.status) {
                  return handleResponseStatus(res);
                }
              })
              // .then(resJson => dispatchError(resJson, dispatch))
              .then(resJson => {
                console.log(url, 'res --->', resJson);
                if (
                  resJson.result === 'Failed' &&
                  (resJson.error === 'jwt expired' ||
                    resJson.error === 'invalid token' ||
                    resJson.error === 'No token exists.' ||
                    resJson.error === 'invalid signature' ||
                    resJson.error === 'Token invalid.' ||
                    parseInt(resJson.code / 1000 + '') === 2)
                ) {
                  Toast.info('Login verification expired!', 1, () => {
                    clearUserInfo();
                    console.log('Login again after verification expired');
                    NavigationService.navigate('Login', {
                      action: 'Authentication expired',
                    });
                  });
                  return {RCode: -1, RMsg: 'Authentication expired !'};
                }
                return resJson;
              })
              .catch(error => {
                if (!serverError) {
                  serverError = true;
                  Modal.alert(
                    'Server error !',
                    'An error occurred on the server. Please try again later or contact us.',
                    [
                      {
                        text: 'OK',
                        onPress: () => {
                          setTimeout(() => {
                            serverError = false;
                          }, 3000);
                        },
                      },
                    ],
                  );
                }
                // console.error(error);
                return {RCode: -1, RMsg: 'Server error !'};
              })
          );
        } else {
          if (networkState) {
            Toast.offline(ErrorMessage_Network_Offline, 1);
          }
          networkState = false;
          return {RCode: -1, RMsg: ErrorMessage_Network_Offline};
        }
      })
      .catch(() => {
        Toast.offline(ErrorMessage_Network_Offline, 2);
        return {RCode: -1, RMsg: ErrorMessage_Network_Offline};
      }),
    20000,
  );
};

export const requestApiV2 = (
  api: {
    method: string;
    url: string;
  },
  params: any,
  authToken: string,
) => {
  return httpRequest(api.method, api.url, params, authToken);
};

/**
 * 使用fetch实现图片上传
 * @param {string} url  接口地址
 * @param {JSON} params body的请求参数
 * @param {string} token
 * @return 返回Promise
 */
export function uploadImage(
  api: {
    method: string;
    url: string;
  },
  filePathList: any,
  token: string = '',
) {
  return isNetworkConnected()
    .then(isConnected => {
      if (isConnected) {
        const toastKey = Toast.loading('uploading...', 0);
        return new Promise(function(resolve, reject) {
          let formData = new FormData();
          filePathList.forEach((source: string) => {
            let file: any = {
              uri: source,
              name: 'image' + source.substr(source.indexOf('.')),
              filename: 'image' + source.substr(source.indexOf('.')),
              type: 'application/octet-stream',
            };
            formData.append('file', file);
          });
          console.log('uploadImage api', serverURL + api.url, '--->');
          console.log('formData', formData);
          fetch(serverURL + api.url, {
            method: api.method,
            headers: {
              'Content-Type': 'multipart/form-data',
              'x-access-token': token,
            },
            body: formData,
          })
            .then((response: any) => {
              console.log('upload response', response);

              let json;
              try {
                json = response.json();
                return json;
              } catch (error) {
                return {
                  error: 'Server exception! Please try again later.',
                };
              }
            })
            .then(responseData => {
              Portal.remove(toastKey);
              // console.log("uploadImage", responseData);
              // Toast.success("uploading success", 2);
              resolve(responseData);
            })
            .catch(err => {
              Portal.remove(toastKey);
              console.log('err', err);
              Modal.alert('uploading failed !', err, [
                {text: 'OK', onPress: () => {}},
              ]);
              reject(err);
            });
        });
      } else {
        if (networkState) {
          Toast.offline(ErrorMessage_Network_Offline, 1);
        }
        networkState = false;
        return {RCode: -1, RMsg: ErrorMessage_Network_Offline};
      }
    })
    .catch(() => {
      Toast.offline(ErrorMessage_Network_Offline, 2);
      return {RCode: -1, RMsg: ErrorMessage_Network_Offline};
    });
}

/**
 * 使用fetch实现视频上传
 * @param {string} url  接口地址
 * @param {JSON} params body的请求参数
 * @param {string} token
 * @return 返回Promise
 */
export function uploadVideo(
  api: {
    method: string;
    url: string;
  },
  filePathList: any,
  token: string = '',
) {
  return isNetworkConnected()
    .then(isConnected => {
      if (isConnected) {
        const toastKey = Toast.loading('uploading...', 0);
        return new Promise(function(resolve, reject) {
          let formData = new FormData();
          filePathList.forEach((source: string) => {
            let file: any = {
              uri: source,
              type: 'application/octet-stream',
              name: 'video.mp4',
            };
            formData.append('file', file);
          });
          console.log('api', serverURL + api.url);
          console.log('formData', formData);
          fetch(serverURL + api.url, {
            method: api.method,
            headers: {
              'Content-Type': 'multipart/form-data',
              'x-access-token': token,
            },
            body: formData,
          })
            .then(response => {
              console.log('upload response', response);

              let json;
              try {
                json = response.json();
                return json;
              } catch (error) {
                return {
                  error: 'Server exception! Please try again later.',
                };
              }
            })
            .then(responseData => {
              Portal.remove(toastKey);
              console.log('uploadImage', responseData);
              // Toast.success("uploading success", 2);
              resolve(responseData);
            })
            .catch(err => {
              Portal.remove(toastKey);
              console.log('err', err);
              Modal.alert('uploading failed !', err, [
                {text: 'OK', onPress: () => {}},
              ]);
              reject(err);
            });
        });
      } else {
        if (networkState) {
          Toast.offline(ErrorMessage_Network_Offline, 1);
        }
        networkState = false;
        return {RCode: -1, RMsg: ErrorMessage_Network_Offline};
      }
    })
    .catch(() => {
      Toast.offline(ErrorMessage_Network_Offline, 2);
      return {RCode: -1, RMsg: ErrorMessage_Network_Offline};
    });
}

function _fetch(fetch_promise: any, timeout: number) {
  var abort_fn: any = null;

  //这是一个可以被reject的promise
  var abort_promise = new Promise(function(resolve, reject) {
    abort_fn = function() {
      resolve({result: 'failed', error: 'Request timeout'});
    };
  });

  //这里使用Promise.race，以最快 resolve 或 reject 的结果来传入后续绑定的回调
  var abortable_promise = Promise.race([fetch_promise, abort_promise]);

  setTimeout(function() {
    abort_fn();
  }, timeout);

  return abortable_promise;
}

export const generateGetUrl = (url: string, params: any) => {
  if (params) {
    let paramsArray: Array<string> = [];
    //拼接参数
    Object.keys(params).forEach(key => {
      if (Array.isArray(params[key])) {
        params[key].forEach((item: string) => {
          paramsArray.push(`${key}[]=${params[key]}`);
        });
      } else {
        paramsArray.push(`${key}=${params[key]}`);
      }
    });
    if (url.search(/\?/) === -1) {
      url += '?' + paramsArray.join('&');
    } else {
      url += '&' + paramsArray.join('&');
    }
    console.log('url', url);
  }
  return url;
};
