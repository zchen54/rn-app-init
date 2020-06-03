'use strict';
import {ActionTypes} from '../types';

export interface ActionSheetActionType {
  text: string;
  color?: string;
  onPress: () => void;
}

export interface InitialState {
  actionSheetVisible: boolean;
  actionSheetTitle: string;
  actionSheetActions: Array<ActionSheetActionType>;
}
const initialState: InitialState = {
  actionSheetVisible: false,
  actionSheetTitle: '',
  actionSheetActions: [],
};

export const commonReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case ActionTypes.OPEN_ACTION_SHEET: {
      const {actions, title} = action;
      return {
        ...state,
        actionSheetVisible: true,
        actionSheetTitle: title || '',
        actionSheetActions: actions,
      };
    }

    case ActionTypes.CLOSE_ACTION_SHEET:
      return {
        ...state,
        actionSheetVisible: false,
        actionSheetTitle: '',
        actionSheetActions: [],
      };

    case ActionTypes.CLEAR_COMMON_REDUCER:
      return initialState;

    default:
      return state;
  }
};
