import {
  all,
  put,
  putResolve,
  select,
  call,
  takeEvery,
} from 'redux-saga/effects';
import {Platform} from 'react-native';
import {PlatFormIOS} from '../../env';
import {Toast, Modal, Portal} from '@ant-design/react-native';
import {loginSuccess, updateCurrentUserInfo, fetchAllData} from '../actions';
import {ActionTypes} from '../types';
import {
  setUserInfo,
  clearUserInfo,
  getUserInfo,
  setLoginHistory,
  getLoginHistory,
  requestApiV2,
  API_v2,
} from '../../common/utils';
import {toastTips} from '../../common/constants';

export function* LoginInit() {
  yield all([
    takeEvery(ActionTypes.LOGIN, handleLogin),
    takeEvery(ActionTypes.LOGOUT, handleLogout),
    takeEvery(ActionTypes.FETCH_ALL_DATA, handleFetchAllData),
  ]);
}

function* handleLogin(action: {
  type: string;
  username: string;
  password: string;
  captcha?: string;
  callback?: Function;
}) {
  const {username, password, captcha, callback} = action;
  let data = {
    email: username,
    password: password,
    captcha: captcha || undefined,
    device: Platform.OS === PlatFormIOS ? 'ios' : 'android',
  };
  const toastKey = Toast.loading('Login...', 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.signIn, data, '')
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    let currentUserInfo = {
      ...rlt.data,
      role: rlt.role,
      authToken: rlt.token,
    };
    // 缓存用户信息
    setUserInfo(currentUserInfo);
    getLoginHistory()
      .then(res => {
        if (res) {
          let tempArr = res,
            tempVal = rlt.data.email;
          if (tempArr.some((item: any) => tempVal === item.email)) {
            tempArr.splice(
              tempArr.findIndex((item: any) => tempVal === item.email),
              1,
            );
            tempArr.unshift({
              email: rlt.data.email,
              userPic: rlt.data.userPic,
            });
          } else {
            tempArr.unshift({
              email: rlt.data.email,
              userPic: rlt.data.userPic,
            });
          }
          setLoginHistory(tempArr);
        }
      })
      .catch(e => {
        console.log(e);
        setLoginHistory([{email: rlt.data.email, userPic: rlt.data.userPic}]);
      });
    yield put(loginSuccess(currentUserInfo));
    if (currentUserInfo.roleType === 4) {
      callback && callback(currentUserInfo);
    } else {
      yield put(
        fetchAllData(currentUserInfo.authToken, true, () => {
          callback && callback(currentUserInfo);
        }),
      );
    }
  } else if (rlt.error) {
    Modal.alert('Login failed !', rlt.error, [{text: 'OK', onPress: () => {}}]);
  }
}

function* handleFetchAllData(action: {
  type: string;
  authToken: string;
  isShowToast: boolean;
  callback?: Function;
}): any {
  // 获取数据
  const {authToken, isShowToast, callback} = action;
  const loadingKey = isShowToast ? Toast.loading('Loading...', 0) : null;
  // fetch user data
  loadingKey ? Portal.remove(loadingKey) : null;
  if (callback) {
    callback();
  }
}

function* handleLogout(action: {
  type: string;
  authToken: string;
  callback?: Function;
}) {
  const {authToken, callback} = action;
  let rlt = yield call(() => {
    return requestApiV2(API_v2.logout, null, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  if (rlt.result === 'Success') {
    clearUserInfo();
    Toast.success(toastTips.SuccessLogOut, 2);
    if (callback) {
      callback();
    }
    // clear personal reducer
  } else if (rlt.error) {
    Modal.alert('Logout failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}
