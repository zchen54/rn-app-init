import { all, put, select, call, takeEvery } from "redux-saga/effects";
import { Toast, Modal, Portal } from "@ant-design/react-native";
import {
  getFriendListSuccess,
  deleteFriendSuccess,
  fetchFriendList,
  selectFriend,
  getFriendList
} from "../actions/friendAction";
import { friendTypeConstants } from "../types";
import { requestApiV2, API_v2 } from "../../common/utils";
import { getFriendsAll, syncFriends } from "../../../services/Friends";
import { toastTips } from "../../common/constants";
export function* FriendsInit() {
  yield all([
    takeEvery(friendTypeConstants.GET_FRIENDS, handleGetFriendList),
    takeEvery(friendTypeConstants.FETCH_FRIENDLIST, handleFetchFriendList),
    takeEvery(friendTypeConstants.ADD_FRIEND_BY_EMAIL, handleRequestFriend),
    takeEvery(friendTypeConstants.DELETE_FRIEND, handleDeleteFriend),
    takeEvery(friendTypeConstants.SEARCH_USER_BY_EMAIL, handleSearchUser)
  ]);
}

function* handleGetFriendList() {
  // let friendMsg = yield call(() => {
  //   return getFriendsAll()
  //     .then(res => {
  //       return res;
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // });
}

function* handleFetchFriendList(action: {
  type: string;
  authToken: string;
  callback?: Function;
}) {
  const { authToken, callback } = action;
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getFriend, null, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  let friendsFromService: any = [];
  if (rlt.result === "Success") {
    // Toast.success("Success", 1);
    friendsFromService = rlt.data;
    if (callback) {
      callback();
    }
    // yield put(fetchFriendListSuccess(rlt.data));
    yield put(getFriendListSuccess(friendsFromService));
  } else if (rlt.error) {
    Modal.alert("Fetch friends list failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleRequestFriend(action: {
  type: string;
  authToken: string;
  email: string;
  callback?: Function;
}) {
  const { authToken, email, callback } = action;
  const data = {
    email
  };
  const toastKey = Toast.loading("Loading...", 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.addFriend, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    Toast.success(toastTips.SuccessAddFriend, 2);
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert("request send failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleDeleteFriend(action: {
  type: string;
  authToken: string;
  friendId: string;
  callback?: Function;
}) {
  const { authToken, friendId, callback } = action;
  const toastKey = Toast.loading("Loading...", 0);
  const data = {
    friendId
  };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.deleteFriend, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    Toast.success("Successfully deleted", 1);
    if (callback) {
      callback();
    }
    yield put(fetchFriendList(authToken));
  } else if (rlt.error) {
    Modal.alert("delete friend failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleSearchUser(action: {
  type: string;
  authToken: string;
  email: string;
  callback?: Function;
}) {
  const { authToken, email, callback } = action;
  const toastKey = Toast.loading("Loading...", 0);
  const data = { email };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getUserInfo, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    if (rlt.data) {
      yield put(selectFriend(rlt.data));
      // Toast.success("request send success", 1);
      if (callback) {
        callback();
      }
    }
  } else if (rlt.error) {
    Modal.alert("search user failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  } else {
    Toast.fail(toastTips.FailedSearchFriend, 2);
  }
}
