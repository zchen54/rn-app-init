import {ActionTypes} from '../types';
import {ActionSheetActionType} from '../reducers/commonReducer';

export const setStatusBarStyle = (
  style: 'default' | 'light-content' | 'dark-content' | undefined,
) => ({
  type: ActionTypes.SET_STATUS_BAR_STYLE,
  style,
});

export const setSafeAreaTopColor = (color: string) => ({
  type: ActionTypes.SET_SAFE_AREA_TOP_COLOR,
  color,
});

export const setSafeAreaBottomColor = (color: string) => ({
  type: ActionTypes.SET_SAFE_AREA_BOTTOM_COLOR,
  color,
});

export const openActionSheet = (
  actions: Array<ActionSheetActionType>,
  title?: string,
) => ({
  type: ActionTypes.OPEN_ACTION_SHEET,
  actions,
  title,
});

export const closeActionSheet = () => ({
  type: ActionTypes.CLOSE_ACTION_SHEET,
});

export const openImagePreview = (
  index: number,
  urls: Array<{url: string}>,
) => ({
  type: ActionTypes.OPEN_IMAGE_PREVIEW,
  index,
  urls,
});

export const closeImagePreview = () => ({
  type: ActionTypes.CLOSE_IMAGE_PREVIEW,
});
