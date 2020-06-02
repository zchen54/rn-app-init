import { all, put, select, call, takeEvery } from "redux-saga/effects";
import { Toast, Modal, Portal } from "@ant-design/react-native";
import { groupTypeConstants } from "../types";
import { requestApiV2, API_v2 } from "../../common/utils";
import {
  getGroupList,
  fetchGroupList,
  fetchGroupsSuccess,
  getGroupMembersSuccess,
  transferGroup
} from "../actions/groupAction";
import { toastTips } from "../../common/constants";
export function* GroupsInit() {
  yield all([
    takeEvery(groupTypeConstants.FETCH_GROUPS, handleFetchGroupList),
    takeEvery(groupTypeConstants.CREATE_GROUP, handleCreateGroup),
    takeEvery(groupTypeConstants.GET_GROUP_MEMBERS, handleGetGroupMembers),
    takeEvery(groupTypeConstants.UPDATE_GROUP, handleUpdateGroup),
    takeEvery(groupTypeConstants.JOIN_GROUP, handleJoinGroup),
    takeEvery(groupTypeConstants.EXIT_GROUP, handleExitGroup),
    // takeEvery(groupTypeConstants.TRANSFER_GROUP, handleTransferGroup),
    takeEvery(groupTypeConstants.DELETE_USER, handleDeleteUser)
    // takeEvery(groupTypeConstants.GET_GROUPS, handleGetGroupList)
  ]);
}

function* handleFetchGroupList(action: {
  type: string;
  authToken: string;
  isCreator: boolean;
  callback?: Function;
}) {
  const { authToken, callback, isCreator } = action;

  let rlt = yield call(() => {
    return requestApiV2(API_v2.getGroup, null, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  let rlt2 = yield call(() => {
    return requestApiV2(API_v2.getGroup, { isOwner: true }, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  console.log("mine group", rlt, "joined group", rlt2);

  if (rlt.result === "Success" && rlt2.result === "Success") {
    // Toast.success("Fetch group success", 1);
    yield put(fetchGroupsSuccess(rlt.data, rlt2.data));
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert("Fetch group list failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleCreateGroup(action: {
  type: string;
  authToken: string;
  name: string;
  remark: string;
  invitee: Array<string>;
  callback?: Function;
}) {
  const { authToken, name, remark, invitee, callback } = action;
  const data = {
    name,
    remark,
    invitees: invitee
  };
  const toastKey = Toast.loading("Loading...", 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.createGroup, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    Toast.success(toastTips.SuccessCreateGroup, 2);
    yield put(fetchGroupList(authToken, true));
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert("create group failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleGetGroupMembers(action: {
  type: string;
  authToken: string;
  groupId: string;
  callback?: Function;
}) {
  const { authToken, groupId, callback } = action;
  const toastKey = Toast.loading("Loading...", 0);
  const data = {
    groupId
  };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getGroupMember, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    // Toast.success("get group members success", 1);
    yield put(getGroupMembersSuccess(rlt.data));
    if (callback) {
      callback();
    }
    // yield put(fetchFriendList(authToken));
  } else if (rlt.error) {
    Modal.alert("get group members failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleUpdateGroup(action: {
  type: string;
  authToken: string;
  groupId: string;
  name: string;
  remark: string;
  callback?: Function;
}) {
  const { authToken, name, remark, groupId, callback } = action;
  const data = {
    name,
    remark,
    groupId
  };
  const toastKey = Toast.loading("Loading...", 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.updateGroup, data, authToken)
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
    yield put(fetchGroupList(authToken, true));
    yield put;
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert("Modified failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleJoinGroup(action: {
  type: string;
  authToken: string;
  usersId: Array<string>;
  groupId: string;
  callback?: Function;
}) {
  const { authToken, usersId, groupId, callback } = action;
  const data = {
    groupId,
    userIds: usersId
  };
  const toastKey = Toast.loading("Loading...", 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.inviteGroupMember, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    yield put(fetchGroupList(authToken, true));
    yield put;
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert("invite failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

function* handleExitGroup(action: {
  type: string;
  authToken: string;
  groupId: string;
  callback?: Function;
}) {
  const { authToken, groupId, callback } = action;
  const data = {
    groupId
  };
  const toastKey = Toast.loading("Loading...", 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.groupMemberExit, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    Toast.success("Exit group successfully", 1);
    yield put(fetchGroupList(authToken, true));
    yield put;
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert("Exit group failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}

// function* handleTransferGroup(action: {
//   type: string;
//   authToken: string;
//   userId: string;
//   groupId: string;
//   callback?: Function;
// }) {
//   const { authToken, groupId, userId, callback } = action;
//   const data = {
//     userId,
//     groupId
//   };
//   const toastKey = Toast.loading("Loading...", 0);
//   let rlt = yield call(() => {
//     return httpRequest("POST", API.TRANSFER_GROUP, data, authToken)
//       .then(res => {
//         return res;
//       })
//       .catch(error => {
//         console.error(error);
//       });
//   });
//   Portal.remove(toastKey);
//   if (rlt.result === "Success") {
//     // Toast.success("exit group success", 1);
//     yield put(fetchGroupList(authToken, true));
//     yield put;
//     if (callback) {
//       callback();
//     }
//   } else if (rlt.error) {
//     Modal.alert("transfer group failed !", rlt.error, [
//       { text: "OK", onPress: () => {} }
//     ]);
//   }
// }

function* handleDeleteUser(action: {
  type: string;
  authToken: string;
  usersId: Array<string>;
  groupId: string;
  callback?: Function;
}) {
  const { authToken, groupId, usersId, callback } = action;
  const data = {
    groupId,
    userIds: usersId
  };
  const toastKey = Toast.loading("Loading...", 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.groupMemberExit, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === "Success") {
    Toast.success("Successfully removed", 1);
    yield put(fetchGroupList(authToken, true));
    yield put;
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert("Remove user failed !", rlt.error, [
      { text: "OK", onPress: () => {} }
    ]);
  }
}
