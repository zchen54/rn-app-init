import {combineReducers} from 'redux';
import {loginInfoReducer} from './loginInfoReducer';

export const rootReducer = combineReducers({
  loginInfo: loginInfoReducer,
});
