import { messageTypeConstants, loginTypeConstants } from "../types";

interface InitialState {
  newMessageCount: number;
  message: Array<any>;
}
const initialState: InitialState = {
  newMessageCount: 0,
  message: []
};

export const messageReducer = (state = initialState, action: any) => {
  switch (action.type) {
    // get list
    case messageTypeConstants.FETCH_MESSAGE_FULFILLED:
      return {
        ...state,
        message: [...action.message]
      };
    case messageTypeConstants.UPDATE_NEW_MESSAGE_COUNT:
      return {
        ...state,
        newMessageCount: action.count
      };
    case loginTypeConstants.LOGOUT:
      return initialState;
    default:
      return state;
  }
};
