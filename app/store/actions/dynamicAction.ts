import { dynamicTypeConstants } from "../types";

export const fetchDynamic = (authToken: string, failedCallback?: Function) => ({
  type: dynamicTypeConstants.FETCH_DYNAMIC,
  authToken,
  failedCallback
});

export const fetchDynamicFulfilled = (dynamic: Array<any>) => ({
  type: dynamicTypeConstants.FETCH_DYNAMIC_FULFILLED,
  dynamic
});
