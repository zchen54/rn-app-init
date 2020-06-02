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
import {isStaffInCompany} from '../../containers/template/judgement';
import {
  loginSuccess,
  addLoginFailedCount,
  changeUserInfoSuccess,
  updateCurrentUserInfo,
  clearTemplateReducer,
  clearReportReducer,
  getTemplatesFulfilled,
  getReportsFulfilled,
  fetchMessageFulfilled,
  getFriendListSuccess,
  fetchCompanyTemplatesFulfilled,
  fetchSystemTemplatesFulfilled,
  fetchCompanyReportsFulfilled,
  fetchAllData,
  updateStaffMap,
  updateDepartmentMap,
} from '../actions';
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
// import reactotron from "../../../ReactotronConfig";
import {formatServiceTemplateToLocal} from './template';
import {formatServiceReportToLocalMini} from './report';
export function* LoginInit() {
  yield all([
    takeEvery(loginTypeConstants.SIGN_UP, handleSignUp),
    takeEvery(loginTypeConstants.GET_VCODE, handleGetVCode),
    takeEvery(loginTypeConstants.RESET_PASSWORD, handleResetPassword),
    takeEvery(loginTypeConstants.LOGIN, handleLogin),
    takeEvery(loginTypeConstants.LOGOUT, handleLogout),
    takeEvery(loginTypeConstants.CHANGE_USER_INFO, handleChangeUserInfo),
    takeEvery(loginTypeConstants.CHANGE_PASSWORD, handleChangePassword),
    takeEvery(loginTypeConstants.FETCH_USER_ROLE, handleFetchUserRole),
    takeEvery(loginTypeConstants.SEND_FEEDBACK, handleFeedBack),
    takeEvery(loginTypeConstants.FETCH_ALL_DATA, handleFetchData),
  ]);
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
        fetchAllData(
          currentUserInfo.authToken,
          true,
          () => {
            callback && callback(currentUserInfo);
          },
          currentUserInfo.isFrozen,
        ),
      );
    }
  } else if (rlt.error) {
    if (rlt.code === 1080) {
      yield put(addLoginFailedCount());
      yield put(addLoginFailedCount());
      yield put(addLoginFailedCount());
    }
    yield put(addLoginFailedCount());
    Modal.alert('Login failed !', rlt.error, [{text: 'OK', onPress: () => {}}]);
  }
}

function* handleFetchData(action: {
  type: string;
  authToken: string;
  isShowToast: boolean;
  callback?: Function;
  isFrozen?: boolean;
}): any {
  // 获取数据
  const {authToken, isShowToast, callback, isFrozen} = action;
  const loadingKey = isShowToast ? Toast.loading('Loading...', 0) : null;
  // 用户是否被冻结 冻结后无法使用公司相关接口
  const isUserFrozen =
    isFrozen !== undefined
      ? isFrozen
      : yield select(state => state.loginInfo.currentUserInfo.isFrozen);

  const [userTemplate, userReport, message, userRole, friendList] = yield all([
    call(requestApiV2, API_v2.getUserTemplate, null, authToken),
    call(requestApiV2, API_v2.getUserReport, null, authToken),
    call(requestApiV2, API_v2.getMessage, null, authToken),
    call(requestApiV2, API_v2.getUserInfo, null, authToken),
    call(requestApiV2, API_v2.getFriend, null, authToken),
  ]);
  if (userTemplate.result === 'Success') {
    let templatesFromService = Array.isArray(userTemplate.data)
      ? userTemplate.data.map((templateItem: any) =>
          formatServiceTemplateToLocal(templateItem),
        )
      : [];
    yield put(getTemplatesFulfilled(templatesFromService));
  }
  if (userReport.result === 'Success') {
    let reportsFromService = Array.isArray(userReport.data)
      ? userReport.data.map((ReportItem: any) =>
          formatServiceReportToLocalMini(ReportItem),
        )
      : [];
    yield put(getReportsFulfilled(reportsFromService));
  }
  if (message.result === 'Success') {
    yield put(fetchMessageFulfilled(message.data));
  }
  if (userRole.result === 'Success') {
    yield put(updateCurrentUserInfo(userRole.data));
  }
  if (friendList.result === 'Success') {
    yield put(getFriendListSuccess(friendList.data));
  }
  const userInfo = userRole.data,
    companyId = userRole && userRole.data ? userRole.data.company : null;
  if (isStaffInCompany(userInfo) && !isUserFrozen && companyId) {
    const [
      companyTemplate,
      systemTemplate,
      staffsRlt,
      departmentsRlt,
    ] = yield all([
      call(requestApiV2, API_v2.getCompanyTemplate, null, authToken),
      call(requestApiV2, API_v2.getSystemTemplate, null, authToken),
      call(requestApiV2, API_v2.getStaff, {companyId: companyId}, authToken),
      call(
        requestApiV2,
        API_v2.getDepartment,
        {companyId: companyId},
        authToken,
      ),
    ]);
    if (companyTemplate.result === 'Success') {
      let templatesFromService = Array.isArray(companyTemplate.data)
        ? companyTemplate.data.map((templateItem: any) =>
            formatServiceTemplateToLocal(templateItem),
          )
        : [];
      yield put(fetchCompanyTemplatesFulfilled(templatesFromService));
    }
    // console.log("----", companyReport.data);
    // if (companyReport.result === 'Success') {
    //   let reportsFromService = Array.isArray(companyReport.data)
    //     ? companyReport.data.map((ReportItem: any) => {
    //         // console.log("*****", ReportItem);
    //         return formatServiceReportToLocalMini(ReportItem);
    //       })
    //     : [];
    //   yield put(fetchCompanyReportsFulfilled(reportsFromService));
    // }
    if (systemTemplate.result === 'Success') {
      let systemTemplatesFromService = systemTemplate.data.map(
        (templateItem: any) => ({
          ...formatServiceTemplateToLocal(templateItem),
          isTop: templateItem.isTop || false,
          label: templateItem.label || '',
        }),
      );
      yield put(fetchSystemTemplatesFulfilled(systemTemplatesFromService));
    }
    if (staffsRlt.result === 'Success') {
      let staffMap: any = {};
      if (Array.isArray(staffsRlt.data)) {
        staffsRlt.data.forEach((item: any) => {
          staffMap[item._id] = item;
        });
      }
      yield put(updateStaffMap(staffMap));
    }
    if (departmentsRlt.result === 'Success') {
      let departmentMap: any = {};
      if (Array.isArray(departmentsRlt.data)) {
        departmentsRlt.data.forEach((item: any) => {
          departmentMap[item._id] = item;
        });
      }
      yield put(updateDepartmentMap(departmentMap));
    }
  }

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
    yield putResolve(clearTemplateReducer());
    yield putResolve(clearReportReducer());
  } else if (rlt.error) {
    Modal.alert('Logout failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

function* handleChangeUserInfo(action: {
  type: string;
  authToken: string;
  nickName: string;
  userPic: string;
  gender: number;
  phone: string;
  callback?: Function;
}) {
  let {callback, authToken, nickName, userPic, gender, phone} = action;
  let data = {
    nickName: nickName || undefined,
    userPic: userPic || undefined,
    gender: gender || gender === 0 ? gender : undefined,
    phone: phone || undefined,
  };
  const toastKey = Toast.loading('Update...', 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.modifyUserInfo, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    Toast.success(toastTips.SuccessModified, 2);
    if (callback) {
      callback();
    }
    yield put(changeUserInfoSuccess(nickName, userPic, gender, phone));
    getUserInfo()
      .then(res => {
        if (res) {
          setUserInfo({
            ...res,
            nickName: nickName ? nickName : res.nickName,
            userPic: userPic ? userPic : res.userPic,
            gender: gender || gender === 0 ? gender : res.gender,
          });
        }
      })
      .catch(e => {
        console.log(e.message);
      });
  } else if (rlt.error) {
    Modal.alert('Modified failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

function* handleGetVCode(action: {
  type: string;
  email: string;
  codeType: number;
  callback?: Function;
}) {
  const {email, codeType, callback} = action;
  const data = {
    email: email,
  };
  const toastKey = Toast.loading('Loading...', 0);
  let rlt = yield call(() => {
    return requestApiV2(
      codeType ? API_v2.sendResetCode : API_v2.sendSignUpCode,
      data,
      '',
    )
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert('Get VCode failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

function* handleResetPassword(action: {
  type: string;
  email: string;
  vcode: string;
  password: string;
  callback?: Function;
}) {
  const {email, vcode, password, callback} = action;
  const data = {
    email,
    password,
    vCode: vcode,
    confirm: password,
  };
  const toastKey = Toast.loading('Loading...', 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.resetPassword, data, '')
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    Toast.success('Password modified successfully', 2);
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert('Fail to modify !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

function* handleChangePassword(action: {
  type: string;
  authToken: string;
  oldPassword: string;
  password: string;
  callback?: Function;
}) {
  const {authToken, oldPassword, password, callback} = action;
  const data = {
    oldPassword,
    password,
    confirm: password,
  };
  const toastKey = Toast.loading('Loading...', 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.modifyPassword, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    Toast.success(toastTips.SuccessModified, 2);
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert('modified failed', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

function* handleFetchUserRole(action: {
  type: string;
  authToken: string;
  callback?: Function;
}) {
  const {authToken, callback} = action;
  const preUserInfo = yield select(state => state.loginInfo.currentUserInfo);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getUserInfo, null, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  if (rlt.result === 'Success') {
    if (preUserInfo.companyName !== rlt.data.companyName) {
      // 公司有变动时更新App数据
      yield put(fetchAllData(authToken, false));
    } else {
      yield put(updateCurrentUserInfo(rlt.data));
    }
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert('Fetch user role failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

function* handleFeedBack(action: {
  type: string;
  authToken: string;
  options: {
    description: string;
    images: Array<string>;
    email: string;
  };
  callback?: Function;
}) {
  const {authToken, options, callback} = action;
  const toastKey = Toast.loading('Submit...', 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.createFeedback, options, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    Toast.success(toastTips.SuccessSubmit, 2);
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert('Submit feedback failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}
