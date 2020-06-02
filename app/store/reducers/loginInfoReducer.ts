'use strict';
import moment from 'moment';
import {loginTypeConstants} from '../types';

interface InitialState {
  currentUserInfo: any;
  loginFailedCount: number;
  errorTimeStamp: string;
}
const initialState: InitialState = {
  currentUserInfo: {},
  loginFailedCount: 0,
  errorTimeStamp: '',
};

export const loginInfoReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case loginTypeConstants.LOGIN_SUCCESS:
      return {
        ...state,
        currentUserInfo: action.currentUserInfo,
        loginFailedCount: 0,
      };
    case loginTypeConstants.ADD_LOGIN_FAILED_COUNT:
      return {
        ...state,
        loginFailedCount: state.loginFailedCount + 1,
        errorTimeStamp: moment().toString(),
      };
    case loginTypeConstants.LOGOUT:
      return initialState;
    case loginTypeConstants.UPDATE_CURRENT_USER_INFO:
      return {
        ...state,
        currentUserInfo: {...state.currentUserInfo, ...action.currentUserInfo},
      };
    case loginTypeConstants.CHANGE_USER_INFO_SUCCESS:
      return {
        ...state,
        currentUserInfo: {
          ...state.currentUserInfo,
          nickName: action.nickName
            ? action.nickName
            : state.currentUserInfo.nickName,
          userPic: action.userPic
            ? action.userPic
            : state.currentUserInfo.userPic,
          gender:
            action.gender || action.gender === 0
              ? action.gender
              : state.currentUserInfo.gender,
          phone:
            action.phone || action.phone === ''
              ? action.phone
              : state.currentUserInfo.phone,
        },
      };

    default:
      return state;
  }
};
