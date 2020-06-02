import {companyTypeConstants, loginTypeConstants} from '../types';

interface InitialState {
  companyInfo: any;
  staffMap: any;
  departmentMap: any;
}
const initialState: InitialState = {
  companyInfo: {},
  staffMap: {},
  departmentMap: {},
};

export const companyReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case companyTypeConstants.FETCH_COMPANY_INFO_FULFILLED:
      return {
        ...state,
        companyInfo: action.companyInfo,
      };
    case companyTypeConstants.UPDATE_STAFF_MAP:
      return {
        ...state,
        staffMap: action.map,
      };
    case companyTypeConstants.UPDATE_DEPARTMENT_MAP:
      return {
        ...state,
        departmentMap: action.map,
      };
    case companyTypeConstants.FETCH_COMPANY_STAFF_FULFILLED:
      return {
        ...state,
        companyInfo: {
          ...state.companyInfo,
          staffs: [...action.staffs],
        },
      };
    case companyTypeConstants.UPDATE_STAFF_INFO_SUCCESS: {
      const {userPkey, staffName} = action;
      return {
        ...state,
        companyInfo: {
          ...state.companyInfo,
          staffs: state.companyInfo.staffs.map((item: any) => {
            if (item.user && item.user._id === userPkey) {
              return {
                ...item,
                staffName: staffName,
              };
            } else {
              return item;
            }
          }),
        },
      };
    }
    case loginTypeConstants.LOGOUT:
      return initialState;
    default:
      return state;
  }
};
