import {
  all,
  put,
  putResolve,
  select,
  call,
  takeEvery,
} from 'redux-saga/effects';
import {Toast, Modal, Portal} from '@ant-design/react-native';
import {loginTypeConstants} from '../types';
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
  yield all([takeEvery(loginTypeConstants.SIGN_UP, handleSignUp)]);
}

function* handleSignUp(action: {
  type: string;
  formData: {
    email: string;
    password: string;
    vcode: string;
  };
  callback: Function;
}) {
  const {formData, callback} = action;
  const {email, password, vcode} = formData;
  const data = {
    email: email,
    password: password,
    vCode: vcode,
    confirm: password,
  };
  const toastKey = Toast.loading('Sign up...', 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.signUp, data, '')
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    Toast.success(toastTips.SuccessRegis, 2);
    callback();
  } else if (rlt.error) {
    Modal.alert('Sign up failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}
