'use strict';
import moment from 'moment';
import {ActionTypes} from '../types';

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
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        currentUserInfo: action.currentUserInfo,
        loginFailedCount: 0,
      };
    case ActionTypes.LOGOUT:
      return initialState;
    case ActionTypes.UPDATE_CURRENT_USER_INFO:
      return {
        ...state,
        currentUserInfo: {...state.currentUserInfo, ...action.currentUserInfo},
      };

    default:
      return state;
  }
};
