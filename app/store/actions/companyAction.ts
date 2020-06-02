import {companyTypeConstants} from '../types';

// services
export const fetchCompanyInfo = (
  authToken: string,
  companyPkey: string,
  callback?: Function,
) => ({
  type: companyTypeConstants.FETCH_COMPANY_INFO,
  authToken,
  companyPkey,
  callback,
});

export const fetchCompanyInfoFulfilled = (companyInfo: any) => ({
  type: companyTypeConstants.FETCH_COMPANY_INFO_FULFILLED,
  companyInfo,
});
export const fetchCompanyStaff = (authToken: string, callback?: Function) => ({
  type: companyTypeConstants.FETCH_COMPANY_STAFF,
  authToken,
  callback,
});

export const fetchCompanyStaffFulfilled = (staffs: any) => ({
  type: companyTypeConstants.FETCH_COMPANY_STAFF_FULFILLED,
  staffs,
});

export const createCompany = (
  authToken: string,
  options: {
    companyPkey: string;
    industryID: string;
    name: string;
    dealer: string;
    address: string;
    scale: string;
    fullAddress: string;
  },
  callback?: Function,
) => ({
  type: companyTypeConstants.CREATE_COMPANY,
  authToken,
  options,
  callback,
});

export const UpdateCompany = (
  authToken: string,
  options: {
    companyPkey: string;
    industryID: string;
    name: string;
    address: string;
    scale: string;
  },
  callback?: Function,
) => ({
  type: companyTypeConstants.UPDATE_COMPANY,
  authToken,
  options,
  callback,
});

export const updateStaffInfo = (
  authToken: string,
  options: {
    userPkey: string;
    departmentPkey: string;
    staffName: string;
  },
  callback?: Function,
) => ({
  type: companyTypeConstants.UPDATE_STAFF_INFO,
  authToken,
  options,
  callback,
});

export const updateStaffInfoSuccess = (
  userPkey: string,
  staffName: string,
) => ({
  type: companyTypeConstants.UPDATE_STAFF_INFO_SUCCESS,
  userPkey,
  staffName,
});

export const joinCompany = (
  authToken: string,
  companyPkey: string,
  callback?: Function,
) => ({
  type: companyTypeConstants.JOIN_COMPANY,
  authToken,
  companyPkey,
  callback,
});

export const inviteFriendsToCompany = (
  authToken: string,
  options: {
    receiverEmails: Array<string>;
    companyPkey: string;
  },
  callback?: Function,
) => ({
  type: companyTypeConstants.INVITE_fRIENDS_TO_COMPANY,
  authToken,
  options,
  callback,
});

export const quitCompany = (authToken: string, callback?: Function) => ({
  type: companyTypeConstants.QUIT_COMPANY,
  authToken,
  callback,
});

export const updateStaffMap = (map: any) => ({
  type: companyTypeConstants.UPDATE_STAFF_MAP,
  map,
});
export const updateDepartmentMap = (map: any) => ({
  type: companyTypeConstants.UPDATE_DEPARTMENT_MAP,
  map,
});
