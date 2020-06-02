import {reportTypeConstants} from '../types';
import {
  FormDataType,
  FieldType,
  SectionType,
  ReportType,
  TemplateType,
  UserType,
  UserInfoType,
  GroupType,
  ModelType,
  TableFieldType,
  TableFieldDataType,
} from '../../common/constants/ModeTypes';

// get list
export const getReportsFulfilled = (
  reports: Array<ModelType & ReportType>,
) => ({
  type: reportTypeConstants.GET_REPORTS_FULFILLED,
  reports,
});

// edit report
export const initReport = (
  authToken: string,
  templateData: ModelType & TemplateType,
  callback?: Function,
) => ({
  type: reportTypeConstants.INIT_REPORT,
  authToken,
  templateData,
  callback,
});
export const initReportImmediate = (
  templateData: ModelType & TemplateType,
) => ({
  type: reportTypeConstants.INIT_REPORT_IMMEDIATE,
  templateData,
});

export const saveEditingReport = (reportData: ModelType & ReportType) => ({
  type: reportTypeConstants.SAVE_EDITING_REPORT,
  reportData,
});

export const clearEditingReport = () => ({
  type: reportTypeConstants.CLEAR_EDITING_REPORT,
});
export const previewReport = (reportData: ModelType & ReportType) => ({
  type: reportTypeConstants.PREVIEW_REPORT,
  reportData,
});
export const previewReportBySelect = (reportpKey: string) => ({
  type: reportTypeConstants.PREVIEW_REPORT_BY_SELECT,
  reportpKey,
});

// services
export const fetchUserReports = (
  authToken: string,
  options?: {
    page?: number;
    pageSize?: number;
    templateId?: string;
  },
  successCallback?: Function,
  failedCallback?: Function,
) => ({
  type: reportTypeConstants.FETCH_USER_REPORTS,
  authToken,
  options,
  successCallback,
  failedCallback,
});
export const fetchCompanyReports = (
  authToken: string,
  options?: {
    page?: number;
    pageSize?: number;
    templateId?: string;
  },
  successCallback?: Function,
  failedCallback?: Function,
) => ({
  type: reportTypeConstants.FETCH_COMPANY_REPORTS,
  authToken,
  options,
  successCallback,
  failedCallback,
});
export const fetchReportInfo = (
  authToken: string,
  reportId: string,
  callback?: Function,
) => ({
  type: reportTypeConstants.FETCH_REPORT_INFO,
  authToken,
  reportId,
  callback,
});
export const fetchCompanyReportsFulfilled = (
  reports: Array<ModelType & ReportType>,
) => ({
  type: reportTypeConstants.FETCH_COMPANY_REPORTS_FULFILLED,
  reports,
});
export const uploadUserReport = (
  authToken: string,
  reportData: ModelType & ReportType,
  templateServiceId: string,
  customizeKey: string,
  callback?: Function,
) => ({
  type: reportTypeConstants.UPLOAD_USER_REPORT,
  authToken,
  reportData,
  templateServiceId,
  customizeKey,
  callback,
});
export const uploadUserReportSuccess = (
  reportData: ModelType & ReportType,
) => ({
  type: reportTypeConstants.UPLOAD_USER_REPORT_SUCCESS,
  reportData,
});
export const uploadCompanyReport = (
  authToken: string,
  reportData: ModelType & ReportType,
  createOrUpdate: boolean,
  callback?: Function,
) => ({
  type: reportTypeConstants.UPLOAD_COMPANY_REPORT,
  authToken,
  reportData,
  createOrUpdate,
  callback,
});
export const submitReportByShare = (
  authToken: string,
  reportData: ModelType & ReportType,
  callback?: Function,
) => ({
  type: reportTypeConstants.SUBMIT_REPORT_BY_SHARE,
  authToken,
  reportData,
  callback,
});
export const uploadCompanyReportSuccess = (
  reportData: ModelType & ReportType,
) => ({
  type: reportTypeConstants.UPLOAD_COMPANY_REPORT_SUCCESS,
  reportData,
});
export const autoUploadCompanyReportDraft = (
  authToken: string,
  reports: Array<ModelType & ReportType>,
  callback?: Function,
) => ({
  type: reportTypeConstants.AUTO_UPLOAD_COMPANY_REPORT_DRAFT,
  authToken,
  reports,
  callback,
});
export const deleteUserReport = (authToken: string, reportpKey: string) => ({
  type: reportTypeConstants.DELETE_USER_REPORT,
  authToken,
  reportpKey,
});
export const deleteUserReportSuccess = (reportpKey: string) => ({
  type: reportTypeConstants.DELETE_USER_REPORT_SUCCESS,
  reportpKey,
});
export const deleteCompanyReport = (
  authToken: string,
  reportpKey: string,
  callback?: Function,
  isWithdrawal?: boolean,
) => ({
  type: reportTypeConstants.DELETE_COMPANY_REPORT,
  authToken,
  reportpKey,
  callback,
  isWithdrawal,
});
export const deleteCompanyReportSuccess = (reportpKey: string) => ({
  type: reportTypeConstants.DELETE_COMPANY_REPORT_SUCCESS,
  reportpKey,
});

export const copyReportAddToMine = (
  authToken: string,
  option: {
    reportpKey: string;
  },
  callback?: Function,
) => ({
  type: reportTypeConstants.COPY_REPORT_ADD_TO_MINE,
  authToken,
  option,
  callback,
});

export const clearReportReducer = () => ({
  type: reportTypeConstants.CLEAR_REPORT_REDUCER,
});

export const duplicateData = (
  authToken: string,
  reportId: string,
  callback?: Function,
) => ({
  type: reportTypeConstants.DUPLICATE_DATA,
  authToken,
  reportId,
  callback,
});

export const handleDataApproval = (
  authToken: string,
  reportId: string,
  result: 'next' | 'deny',
  callback?: Function,
) => ({
  type: reportTypeConstants.HANDLE_DATA_APPROVAL,
  authToken,
  reportId,
  result,
  callback,
});
