import { all, put, select, call, takeEvery } from "redux-saga/effects";
import { Toast, Modal, Portal } from "@ant-design/react-native";
import { companyTypeConstants } from "../types";
import {
  setUserInfo,
  clearUserInfo,
  getUserInfo,
  requestApiV2,
  API_v2
} from "../../common/utils";
import {
  fetchCompanyInfoFulfilled,
  fetchCompanyStaffFulfilled,
  updateStaffInfoSuccess
} from "../actions";
import { toastTips } from "../../common/constants";

export function* CompanyInit() {
  yield all([
    takeEvery(companyTypeConstants.CREATE_COMPANY, handleCreateCompany),
    takeEvery(companyTypeConstants.UPDATE_COMPANY, handleUpdateCompany),
    takeEvery(companyTypeConstants.FETCH_COMPANY_INFO, handleFetchCompanyInfo),
    takeEvery(
      companyTypeConstants.FETCH_COMPANY_STAFF,
      handleFetchCompanyStaff
    ),
    takeEvery(companyTypeConstants.UPDATE_STAFF_INFO, handleUpdateStaffInfo),
    takeEvery(companyTypeConstants.JOIN_COMPANY, handleJoinCompany),
    takeEvery(
      companyTypeConstants.INVITE_fRIENDS_TO_COMPANY,
      handleInviteFriendsToCompany
    ),
    takeEvery(companyTypeConstants.QUIT_COMPANY, handleExitCompany)
  ]);
}

function* handleCreateCompany(action: {
  type: string;
  authToken: string;
  options: {
    companyPkey: string;
    industryID: string;
    name: string;
    dealer: string;
    address: string;
    scale: string;
    fullAddress: string;
  };
  callback?: Function;
}) {
  const { authToken, options, callback } = action;
  const toastKey = Toast.loading("Submitting...", 0);
  const data = {
    name: options.name,
    dealer: options.dealer ? options.dealer : undefined,
    address: options.address,
    scale: options.scale,
    logo: "",
    industryId: options.industryID,
    region: options.address,
    fullAddress: options.fullAddress
  };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.createCompany, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert("Create company failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleUpdateCompany(action: {
  type: string;
  authToken: string;
  options: {
    companyPkey: string;
    industryID: string;
    name: string;
    address: string;
    scale: string;
  };
  callback?: Function;
}) {
  const { authToken, options, callback } = action;
  const toastKey = Toast.loading("Submitting...", 0);
  const data = {
    ...options,
    region: options.address
  };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.updateCompany, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert("Update company failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleFetchCompanyInfo(action: {
  type: string;
  authToken: string;
  companyPkey: string;
  callback?: Function;
}) {
  const { authToken, companyPkey, callback } = action;
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getCompany, null, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  if (rlt.result === "Success") {
    if (callback) {
      callback();
    }
    yield put(fetchCompanyInfoFulfilled(rlt.data));
  } else if (rlt.error) {
    Toast.fail("Fetch company info failed !", 2);
  }
}

function* handleFetchCompanyStaff(action: {
  type: string;
  authToken: string;
  callback?: Function;
}) {
  const { authToken, callback } = action;
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getStaff, null, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  if (rlt.result === "Success") {
    if (callback) {
      callback();
    }
    yield put(fetchCompanyStaffFulfilled(rlt.data));
  } else if (rlt.error) {
    Toast.fail("Fetch company info failed !", 2);
  }
}

function* handleUpdateStaffInfo(action: {
  type: string;
  authToken: string;
  options: {
    userPkey: string;
    departmentPkey: string;
    staffName: string;
  };
  callback?: Function;
}) {
  const { authToken, options, callback } = action;
  const toastKey = Toast.loading("Submitting...", 0);
  const data = {
    userId: options.userPkey,
    staffName: options.staffName
    // departmentId: options.departmentPkey
  };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.updateStaff, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    Toast.success(toastTips.SuccessModified, 2);
    if (callback) {
      callback();
    }
    yield put(updateStaffInfoSuccess(options.userPkey, options.staffName));
  } else if (rlt.error) {
    Modal.alert("Update staff failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleJoinCompany(action: {
  type: string;
  authToken: string;
  companyPkey: string;
  callback?: Function;
}) {
  const { authToken, companyPkey, callback } = action;
  const toastKey = Toast.loading("Submitting...", 0);
  const data = { companyId: companyPkey };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.joinCompany, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    Toast.success("The request was sent successfully", 2);
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert("Join organization failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleInviteFriendsToCompany(action: {
  type: string;
  authToken: string;
  options: {
    receiverEmails: Array<string>;
    companyPkey: string;
  };
  callback?: Function;
}) {
  const { authToken, options, callback } = action;
  const toastKey = Toast.loading("Submitting...", 0);
  const data = {
    emails: options.receiverEmails
  };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.joinCompany, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    Toast.success("The request was sent successfully", 2);
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert("Invite friends failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleExitCompany(action: {
  type: string;
  authToken: string;
  callback?: Function;
}) {
  const { authToken, callback } = action;
  const toastKey = Toast.loading("Submitting...", 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.exitCompany, null, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert("request failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}
