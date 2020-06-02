import { all, put, select, call, takeEvery } from "redux-saga/effects";
import { Toast, Modal, Portal } from "@ant-design/react-native";
import { fetchMessageFulfilled, updateNewMessageCount } from "../actions";
import { messageTypeConstants } from "../types";
import {
  setUserInfo,
  clearUserInfo,
  getUserInfo,
  requestApiV2,
  API_v2
} from "../../common/utils";

export function* MessageInit() {
  yield all([
    takeEvery(messageTypeConstants.FETCH_MESSAGE, handleFetchMessage),
    takeEvery(
      messageTypeConstants.FETCH_NEW_MESSAGE_COUNT,
      handleFetchNewMessageCount
    ),
    takeEvery(
      messageTypeConstants.UPDATE_MESSAGE_ISREAD,
      handleUpdateMessageIsRead
    ),

    takeEvery(messageTypeConstants.HANDLE_FRIEND_REQUEST, handleFriendRequest),
    takeEvery(messageTypeConstants.HANDLE_GROUP_REQUEST, handleGroupRequest),
    takeEvery(
      messageTypeConstants.HANDLE_COMPANY_JOIN_REQUEST,
      handleCompanyJoinRequest
    ),
    takeEvery(
      messageTypeConstants.HANDLE_COMPANY_EXIT_REQUEST,
      handleCompanyExitRequest
    )
  ]);
}

function* handleFetchMessage(action: {
  type: string;
  authToken: string;
  callback?: Function;
}) {
  const { authToken, callback } = action;
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getMessage, null, authToken)
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
    yield put(fetchMessageFulfilled(rlt.data));
  } else if (rlt.error) {
    Modal.alert("Fetch message failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleFetchNewMessageCount(action: {
  type: string;
  authToken: string;
}) {
  const { authToken } = action;
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getMessageUnreadCount, null, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  if (rlt.result === "Success") {
    yield put(updateNewMessageCount(rlt.data));
  } else if (rlt.error) {
    Modal.alert("Fetch new message count failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleUpdateMessageIsRead(action: {
  type: string;
  authToken: string;
}) {
  const { authToken } = action;
  const data = { isRead: true };
  yield call(() => {
    return requestApiV2(API_v2.updateMessage, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
}

function* handleFriendRequest(action: {
  type: string;
  authToken: string;
  options: {
    messageId: string;
    accept: boolean;
  };
  callback: Function;
}) {
  const { authToken, options, callback } = action;
  const data = {
    messageId: options.messageId,
    audit: options.accept
  };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.handleAddFriend, data, authToken)
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
  } else if (rlt.error) {
    Modal.alert("Respond to friend failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleGroupRequest(action: {
  type: string;
  authToken: string;
  options: {
    messageId: string;
    accept: boolean;
  };
  callback: Function;
}) {
  const { authToken, options, callback } = action;
  const data = {
    messageId: options.messageId,
    audit: options.accept
  };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.handleGroupInvite, data, authToken)
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
  } else if (rlt.error) {
    Modal.alert("Respond to friend failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleCompanyJoinRequest(action: {
  type: string;
  authToken: string;
  options: {
    messagePkey: string;
    // departmentPkey: string;
    // role: number;
    audit: boolean;
  };
  callback: Function;
}) {
  const { authToken, options, callback } = action;
  const data = {
    messageId: options.messagePkey,
    audit: options.audit
  };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.handleJoinCompany, data, authToken)
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
  } else if (rlt.error) {
    Modal.alert("Respond to company failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleCompanyExitRequest(action: {
  type: string;
  authToken: string;
  options: {
    messagePkey: string;
    audit: boolean;
  };
  callback: Function;
}) {
  const { authToken, options, callback } = action;
  const data = {
    messageId: options.messagePkey,
    audit: options.audit
  };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.handleExitCompany, data, authToken)
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
  } else if (rlt.error) {
    Modal.alert("Respond to company failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}
