"use strict";

import { friendTypeConstants, loginTypeConstants } from "../types";

interface InitialState {
  friends: Array<any>;
  friendSelect: any;
}
const initialState: InitialState = {
  // friends: [{
  //   nickName: "asda"
  // },
  // {
  //   nickName: "zheng"
  // },
  // {
  //   nickName: "郑我"
  // },
  // {
  //   nickName: "高效"
  // },
  // {
  //   nickName: "骂声"
  // },{
  //   nickName: "addas"
  // },{
  //   nickName: "zxcfsdfv"
  // },{
  //   nickName: "骂zdsfsf声"
  // },{
  //   nickName: "wqerwet"
  // },{
  //   nickName: "trytry"
  // },{
  //   nickName: "q2eawd"
  // },]
  friends: [],
  friendSelect: {}
};
export const friendsListReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case friendTypeConstants.GET_FRIENDLIST_SUCCESS:
      return {
        ...state,
        friends: action.friends
      };
    case friendTypeConstants.SELECT_FRIEND:
      return {
        ...state,
        friendSelect: action.friendSelect
      };
    case friendTypeConstants.DELETE_FRIEND_SUCCESS:
      return {
        ...state,
        friends: state.friends.filter(item => item._id !== action.friendId)
      };
    case loginTypeConstants.LOGOUT:
      return initialState;
    default:
      return state;
  }
};
