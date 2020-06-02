import { dynamicTypeConstants, loginTypeConstants } from "../types";

interface InitialState {
  dynamicList: Array<any>;
}
const initialState: InitialState = {
  dynamicList: []
};

export const dynamicReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case dynamicTypeConstants.FETCH_DYNAMIC_FULFILLED:
      return {
        ...state,
        dynamicList: action.dynamic
      };
    case loginTypeConstants.LOGOUT:
      return initialState;
    default:
      return state;
  }
};
