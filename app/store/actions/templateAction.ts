import {templateTypeConstants} from '../types';
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
export const getTemplatesFulfilled = (
  templates: Array<ModelType & TemplateType>,
) => ({
  type: templateTypeConstants.GET_TEMPLATES_FULFILLED,
  templates,
});

// edit template
export const saveEditingTemplate = (
  templateData: ModelType & TemplateType,
) => ({
  type: templateTypeConstants.SAVE_EDITING_TEMPLATE,
  templateData,
});
export const saveEditingField = (FieldData: FieldType) => ({
  type: templateTypeConstants.SAVE_EDITING_FIELD,
  FieldData,
});
export const clearEditingField = () => ({
  type: templateTypeConstants.CLEAR_EDITING_FIELD,
});

export const duplicateTemplate = (templatepKey: string) => ({
  type: templateTypeConstants.DUPLICATE_TEMPLATE,
  templatepKey,
});
export const clearEditingTemplate = () => ({
  type: templateTypeConstants.CLEAR_EDITING_TEMPLATE,
});
export const previewTemplate = (templateData: ModelType & TemplateType) => ({
  type: templateTypeConstants.PREVIEW_TEMPLATE,
  templateData,
});
export const previewTemplateBySelect = (templatepKey: string) => ({
  type: templateTypeConstants.PREVIEW_TEMPLATE_BY_SELECT,
  templatepKey,
});

// services
export const fetchUserTemplates = (
  authToken: string,
  failedCallback?: Function,
) => ({
  type: templateTypeConstants.FETCH_USER_TEMPLATES,
  authToken,
  failedCallback,
});

export const fetchCompanyTemplates = (
  authToken: string,
  failedCallback?: Function,
) => ({
  type: templateTypeConstants.FETCH_COMPANY_TEMPLATES,
  authToken,
  failedCallback,
});

export const fetchCompanyTemplatesFulfilled = (
  templates: Array<ModelType & TemplateType>,
) => ({
  type: templateTypeConstants.FETCH_COMPANY_TEMPLATES_FULFILLED,
  templates,
});

export const fetchSystemTemplates = (
  authToken: string,
  failedCallback?: Function,
) => ({
  type: templateTypeConstants.FETCH_SYSTEM_TEMPLATES,
  authToken,
  failedCallback,
});

export const fetchSystemTemplatesFulfilled = (
  templates: Array<ModelType & TemplateType>,
) => ({
  type: templateTypeConstants.FETCH_SYSTEM_TEMPLATES_FULFILLED,
  templates,
});

export const fetchTemplateInfo = (
  authToken: string,
  templateId: string,
  callback?: Function,
  actionType?: string,
) => ({
  type: templateTypeConstants.FETCH_TEMPLATE_INFO,
  authToken,
  templateId,
  callback,
  actionType,
});
export const uploadUserTemplate = (
  authToken: string,
  templateData: ModelType & TemplateType,
  callback?: Function,
) => ({
  type: templateTypeConstants.UPLOAD_USER_TEMPLATE,
  authToken,
  templateData,
  callback,
});
export const uploadUserTemplateSuccess = (
  templateData: ModelType & TemplateType,
) => ({
  type: templateTypeConstants.UPLOAD_USER_TEMPLATE_SUCCESS,
  templateData,
});
export const uploadCompanyTemplate = (
  authToken: string,
  templateData: ModelType & TemplateType,
  createOrUpdate: boolean,
  callback?: Function,
) => ({
  type: templateTypeConstants.UPLOAD_COMPANY_TEMPLATE,
  authToken,
  templateData,
  createOrUpdate,
  callback,
});
export const uploadCompanyTemplateSuccess = (
  templateData: ModelType & TemplateType,
) => ({
  type: templateTypeConstants.UPLOAD_COMPANY_TEMPLATE_SUCCESS,
  templateData,
});

export const deleteUserTemplate = (
  authToken: string,
  templatepKey: string,
) => ({
  type: templateTypeConstants.DELETE_USER_TEMPLATE,
  authToken,
  templatepKey,
});
export const deleteUserTemplateSuccess = (templatepKey: string) => ({
  type: templateTypeConstants.DELETE_USER_TEMPLATE_SUCCESS,
  templatepKey,
});
export const deleteCompanyTemplate = (
  authToken: string,
  templatepKey: string,
) => ({
  type: templateTypeConstants.DELETE_COMPANY_TEMPLATE,
  authToken,
  templatepKey,
});
export const deleteCompanyTemplateSuccess = (templatepKey: string) => ({
  type: templateTypeConstants.DELETE_COMPANY_TEMPLATE_SUCCESS,
  templatepKey,
});

// share template
export const shareTemplateAndReport = (
  authToken: string,
  option: {
    recipientIds: Array<string>;
    groupId: Array<string>;
    templateId: string;
    reportId: string;
  },
  callback?: Function,
) => ({
  type: templateTypeConstants.SHARE_TEMPLATE,
  authToken,
  option,
  callback,
});

export const copyTemplateAddToMine = (
  authToken: string,
  option: {
    templatePkey: string;
    templateName?: string;
  },
  callback?: Function,
) => ({
  type: templateTypeConstants.COPY_TEMPLATE_ADD_TO_MINE,
  authToken,
  option,
  callback,
});

export const addSystemTemplateToCompany = (
  authToken: string,
  option: {
    templatePkey: string;
    templateName?: string;
  },
  callback?: Function,
) => ({
  type: templateTypeConstants.ADD_SYSTEM_TEMPLATE_TO_COMPANY,
  authToken,
  option,
  callback,
});

export const clearTemplateReducer = () => ({
  type: templateTypeConstants.CLEAR_TEMPLATE_REDUCER,
});

export const backupTemplates = () => ({
  type: templateTypeConstants.BACKUP_TEMPLATES,
});
