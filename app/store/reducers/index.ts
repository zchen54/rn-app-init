import { combineReducers } from "redux";
import { loginInfoReducer } from "./loginInfoReducer";
import { templateReducer } from "./templateReducer";
import { reportReducer } from "./reportReducer";
import { friendsListReducer } from "./friendReducer";
import { messageReducer } from "./messageReducer";
import { groupReducer } from "./groupReducer";
import { companyReducer } from "./companyReducer";
import { dynamicReducer } from "./dynamicReducer";
import { draftReducer } from "./draftReducer";

export const rootReducer = combineReducers({
  loginInfo: loginInfoReducer,
  draft: draftReducer,
  template: templateReducer,
  report: reportReducer,
  friendsList: friendsListReducer,
  message: messageReducer,
  group: groupReducer,
  company: companyReducer,
  dynamic: dynamicReducer
});
