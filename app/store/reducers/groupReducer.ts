"use strict";

import { groupTypeConstants, loginTypeConstants } from "../types";
interface InitialState {
  groupList: Array<any>;
  createdGroupList: Array<any>;
  groupSelect: any;
}
const initialState: InitialState = {
  groupList: [],
  createdGroupList: [],
  groupSelect: {}
};
export const groupReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case groupTypeConstants.FETCH_GROUPS_SUCCESS: {
      const { groups, createdGroups } = action;
      return {
        ...state,
        groupList: [...groups],
        createdGroupList: [...createdGroups]
      };
    }
    case groupTypeConstants.GET_GROUP_MEMBERS_SUCCESS:
      return {
        ...state,
        groupSelect: {
          ...state.groupSelect,
          members: action.group
        }
      };
    case groupTypeConstants.SELECT_GROUP:
      return {
        ...state,
        groupSelect: { ...state.groupSelect, ...action.groupSelect }
      };
    case groupTypeConstants.CLEAR_GROUP_SELECT:
      return {
        ...state,
        groupSelect: {}
      };
    case loginTypeConstants.LOGOUT:
      return initialState;
    default:
      return state;
  }
};
