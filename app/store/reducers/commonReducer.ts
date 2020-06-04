'use strict';
import {ActionTypes} from '../types';

export interface ActionSheetActionType {
  text: string;
  color?: string;
  onPress: () => void;
}

export interface InitialState {
  // iPhone 全面屏适配
  statusBarStyle: 'default' | 'light-content' | 'dark-content' | undefined;
  safeAreaTopColor: string;
  safeAreaBottomColor: string;
  // 更多操作
  actionSheetVisible: boolean;
  actionSheetTitle: string;
  actionSheetActions: Array<ActionSheetActionType>;
  // 图片预览
  imagePreviewVisible: boolean;
  imagePreviewIndex: number;
  imagePreviewUrls: Array<{url: string}>;
}
const initialState: InitialState = {
  statusBarStyle: 'dark-content',
  safeAreaTopColor: '#fff',
  safeAreaBottomColor: '#fff',
  actionSheetVisible: false,
  actionSheetTitle: '',
  actionSheetActions: [],
  imagePreviewVisible: false,
  imagePreviewIndex: 0,
  imagePreviewUrls: [],
};

export const commonReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case ActionTypes.SET_SAFE_AREA_TOP_COLOR: {
      const {color} = action;
      return {
        ...state,
        safeAreaTopColor: color,
      };
    }

    case ActionTypes.SET_SAFE_AREA_BOTTOM_COLOR: {
      const {color} = action;
      return {
        ...state,
        safeAreaBottomColor: color,
      };
    }

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

    case ActionTypes.OPEN_ACTION_SHEET: {
      const {index, urls} = action;
      return {
        ...state,
        imagePreviewVisible: true,
        imagePreviewIndex: index,
        imagePreviewUrls: urls,
      };
    }

    case ActionTypes.CLOSE_IMAGE_PREVIEW:
      return {
        ...state,
        imagePreviewVisible: false,
        imagePreviewIndex: 0,
        imagePreviewUrls: [],
      };

    case ActionTypes.CLEAR_COMMON_REDUCER:
      return initialState;

    default:
      return state;
  }
};
