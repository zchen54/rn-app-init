import {combineReducers} from 'redux';
import {loginInfoReducer} from './loginInfoReducer';
import {commonReducer} from './commonReducer';

export const rootReducer = combineReducers({
  loginInfo: loginInfoReducer,
  common: commonReducer,
});
