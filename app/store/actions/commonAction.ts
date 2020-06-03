import {ActionTypes} from '../types';
import {ActionSheetActionType} from '../reducers/commonReducer';

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
