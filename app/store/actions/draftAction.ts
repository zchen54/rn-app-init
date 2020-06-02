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
  TableFieldDataType
} from "../../common/constants/ModeTypes";

export const draftTypeConstants = {
  CREATE_USER_TEMPLATE_DRAFT: "CREATE_USER_TEMPLATE_DRAFT",
  UPDATE_USER_TEMPLATE_DRAFT: "UPDATE_USER_TEMPLATE_DRAFT",
  DELETE_USER_TEMPLATE_DRAFT: "DELETE_USER_TEMPLATE_DRAFT",
  CREATE_USER_REPORT_DRAFT: "CREATE_USER_REPORT_DRAFT",
  UPDATE_USER_REPORT_DRAFT: "UPDATE_USER_REPORT_DRAFT",
  DELETE_USER_REPORT_DRAFT: "DELETE_USER_REPORT_DRAFT",
  CREATE_COMPANY_REPORT_DRAFT: "CREATE_COMPANY_REPORT_DRAFT",
  UPDATE_COMPANY_REPORT_DRAFT: "UPDATE_COMPANY_REPORT_DRAFT",
  DELETE_COMPANY_REPORT_DRAFT: "DELETE_COMPANY_REPORT_DRAFT",
  DELETE_MULTIPLE_COMPANY_REPORT_DRAFT: "DELETE_MULTIPLE_COMPANY_REPORT_DRAFT",
  SET_ERROR_FOR_AUTO_UPLOAD_DRAFT: "SET_ERROR_FOR_AUTO_UPLOAD_DRAFT",
  CLEAR_DRAFT: "CLEAR_DRAFT"
};

// user template draft
export const createUserTemplateDraft = (
  userId: string,
  templateData: ModelType & TemplateType
) => ({
  type: draftTypeConstants.CREATE_USER_TEMPLATE_DRAFT,
  userId,
  templateData
});

export const updateUserTemplateDraft = (
  userId: string,
  templateData: ModelType & TemplateType
) => ({
  type: draftTypeConstants.UPDATE_USER_TEMPLATE_DRAFT,
  userId,
  templateData
});

export const deleteUserTemplateDraft = (
  userId: string,
  templatepKey: string
) => ({
  type: draftTypeConstants.DELETE_USER_TEMPLATE_DRAFT,
  userId,
  templatepKey
});

// user report draft
export const createUserReportDraft = (
  userId: string,
  reportData: ModelType & ReportType
) => ({
  type: draftTypeConstants.CREATE_USER_REPORT_DRAFT,
  userId,
  reportData
});

export const updateUserReportDraft = (
  userId: string,
  reportData: ModelType & ReportType
) => ({
  type: draftTypeConstants.UPDATE_USER_REPORT_DRAFT,
  userId,
  reportData
});

export const deleteUserReportDraft = (userId: string, reportpKey: string) => ({
  type: draftTypeConstants.DELETE_USER_REPORT_DRAFT,
  userId,
  reportpKey
});

// company report draft
export const createCompanyReportDraft = (
  userId: string,
  reportData: ModelType & ReportType
) => ({
  type: draftTypeConstants.CREATE_COMPANY_REPORT_DRAFT,
  userId,
  reportData
});

export const updateCompanyReportDraft = (
  userId: string,
  reportData: ModelType & ReportType
) => ({
  type: draftTypeConstants.UPDATE_COMPANY_REPORT_DRAFT,
  userId,
  reportData
});

export const deleteCompanyReportDraft = (
  userId: string,
  reportpKey: string
) => ({
  type: draftTypeConstants.DELETE_COMPANY_REPORT_DRAFT,
  userId,
  reportpKey
});

export const deleteMultipleCompanyReportDraft = (
  userId: string,
  reportpKeys: Array<string>
) => ({
  type: draftTypeConstants.DELETE_MULTIPLE_COMPANY_REPORT_DRAFT,
  userId,
  reportpKeys
});

// set error for auto upload draft
export const setErrorForAutoUploadDraft = (errorReports: Array<any>) => ({
  type: draftTypeConstants.SET_ERROR_FOR_AUTO_UPLOAD_DRAFT,
  errorReports
});

// clear
export const clearDraft = () => ({
  type: draftTypeConstants.CLEAR_DRAFT
});
