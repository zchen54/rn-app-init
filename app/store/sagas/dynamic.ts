import { all, put, select, call, takeEvery } from "redux-saga/effects";
import { Toast, Modal, Portal } from "@ant-design/react-native";
import { dynamicTypeConstants } from "../types";
import { requestApiV2, API_v2 } from "../../common/utils";
import { fetchDynamicFulfilled, requestFriend } from "../actions";

export function* DynamicInit() {
  yield all([
    takeEvery(dynamicTypeConstants.FETCH_DYNAMIC, handleFetchDynamic)
  ]);
}

function* handleFetchDynamic(action: {
  type: string;
  authToken: string;
  failedCallback?: Function;
}) {
  const { authToken, failedCallback } = action;
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getDynamic, null, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  if (rlt.result === "Success") {
    yield put(fetchDynamicFulfilled(rlt.data));
  } else if (rlt.error) {
    Toast.fail(rlt.error, 2);
    if (failedCallback) {
      failedCallback();
    }
  } else {
    if (failedCallback) {
      failedCallback();
    }
  }
}
