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
