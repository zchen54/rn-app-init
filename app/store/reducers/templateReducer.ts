'use strict';
import {templateTypeConstants, loginTypeConstants} from '../types';
import UUID from 'uuid/v1';
import moment from 'moment';
import {
  FieldType,
  TemplateType,
  ModelType,
} from '../../common/constants/ModeTypes';

const emptyTemplate = {};
const emptyField = {};
const commonObj: ModelType = {
  User_pKey_Creator: '',
  User_pKey_Modifier: '',
  createdAt: '',
  updatedAt: '',
};

interface InitialState {
  companyTemplates: Array<ModelType & TemplateType>;
  systemTemplates: Array<ModelType & TemplateType>;
  templates: Array<ModelType & TemplateType>;
  editingTemplate: (ModelType & TemplateType) | {};
  editingField: FieldType | {};
  isRetrieving: boolean;
  backupCompanyTemplates: Array<ModelType & TemplateType>;
  backupSystemTemplates: Array<ModelType & TemplateType>;
  backupTemplates: Array<ModelType & TemplateType>;
}
const initialState: InitialState = {
  companyTemplates: [],
  systemTemplates: [],
  templates: [],
  editingTemplate: {},
  editingField: {},
  isRetrieving: false,
  backupCompanyTemplates: [],
  backupSystemTemplates: [],
  backupTemplates: [],
};

export const templateReducer = (state = initialState, action: any) => {
  switch (action.type) {
    // get list
    case templateTypeConstants.FETCH_COMPANY_TEMPLATES_FULFILLED:
      return {
        ...state,
        companyTemplates: action.templates,
        isRetrieving: false,
      };
    case templateTypeConstants.FETCH_SYSTEM_TEMPLATES_FULFILLED:
      return {
        ...state,
        systemTemplates: action.templates,
        isRetrieving: false,
      };
    case templateTypeConstants.GET_TEMPLATES_FULFILLED:
      return {
        ...state,
        templates: action.templates,
        isRetrieving: false,
      };

    // edit template
    case templateTypeConstants.PREVIEW_TEMPLATE:
      return {
        ...state,
        editingTemplate: {
          ...action.templateData,
          Sections: action.templateData.Sections.map((sItem: any) => ({
            ...sItem,
            Fields: sItem.Fields.map((fItem: any) => ({
              ...fItem,
              TableFieldList: [...fItem.TableFieldList],
            })),
          })),
        },
      };
    case templateTypeConstants.PREVIEW_TEMPLATE_BY_SELECT:
      return {
        ...state,
        editingTemplate: {
          ...state.templates.filter(
            (item: any) => item.pKey === action.templatepKey,
          )[0],
        },
      };
    case templateTypeConstants.SAVE_EDITING_TEMPLATE:
      return {
        ...state,
        editingTemplate: {
          ...action.templateData,
          Sections: action.templateData.Sections.map((sItem: any) => ({
            ...sItem,
            Fields: sItem.Fields.map((fItem: any) => ({
              ...fItem,
              TableFieldList: [...fItem.TableFieldList],
            })),
          })),
        },
      };
    case templateTypeConstants.SAVE_EDITING_FIELD:
      return {
        ...state,
        editingField: {
          ...action.FieldData,
          TableFieldList: action.FieldData.TableFieldList.map(
            (tbFItem: any) => ({
              ...tbFItem,
            }),
          ),
        },
      };
    case templateTypeConstants.DUPLICATE_TEMPLATE: {
      let duplicateTemplate;
      duplicateTemplate = state.companyTemplates.filter(
        (item: any) => item.pKey === action.templatepKey,
      )[0];
      return {
        ...state,
        editingTemplate: {
          ...duplicateTemplate,
          ...commonObj,
          pKey: UUID(),
          Name: duplicateTemplate.Name + '_Copy',
          ActiveStatus: 1,
          UploadStatus: 0,
          createdAt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          Sections: duplicateTemplate.Sections.map((sItem: any) => ({
            ...sItem,
            _id: undefined,
            Fields: sItem.Fields.map((fItem: any) => ({
              ...fItem,
              _id: undefined,
              TableFieldList: fItem.TableFieldList.map((tbFItem: any) => ({
                ...tbFItem,
                _id: undefined,
              })),
            })),
          })),
        },
      };
    }

    case templateTypeConstants.UPLOAD_USER_TEMPLATE_SUCCESS: {
      const {templateData} = action;
      return {
        ...state,
        templates: state.templates.map(item => {
          if (item.pKey === templateData.pKey) {
            return templateData;
          } else {
            return item;
          }
        }),
      };
    }

    case templateTypeConstants.UPLOAD_COMPANY_TEMPLATE_SUCCESS: {
      const {templateData} = action;
      return {
        ...state,
        companyTemplates: state.companyTemplates.map(item => {
          if (item.pKey === templateData.pKey) {
            return templateData;
          } else {
            return item;
          }
        }),
      };
    }

    case templateTypeConstants.DELETE_USER_TEMPLATE_SUCCESS: {
      const {templatepKey} = action;
      let templates = [...state.templates];
      templates.forEach((item, index) => {
        if (item.pKey === templatepKey) {
          templates.splice(index, 1);
        }
      });
      return {
        ...state,
        templates,
      };
    }

    case templateTypeConstants.DELETE_COMPANY_TEMPLATE_SUCCESS: {
      const {templatepKey} = action;
      let companyTemplates = [...state.companyTemplates];
      companyTemplates.forEach((item, index) => {
        if (item.pKey === templatepKey) {
          companyTemplates.splice(index, 1);
        }
      });
      return {
        ...state,
        companyTemplates,
      };
    }

    case templateTypeConstants.CLEAR_EDITING_TEMPLATE:
      return {
        ...state,
        editingTemplate: Object.assign({}, emptyTemplate),
      };

    case templateTypeConstants.CLEAR_EDITING_FIELD:
      return {
        ...state,
        editingField: Object.assign({}, emptyField),
      };

    case templateTypeConstants.BACKUP_TEMPLATES: {
      const {companyTemplates, systemTemplates, templates} = state;
      let backupCompanyTemplates = [...state.backupCompanyTemplates];
      let backupSystemTemplates = [...state.backupSystemTemplates];
      let backupTemplates = [...state.backupTemplates];

      companyTemplates.forEach((template: ModelType & TemplateType) => {
        if (!backupCompanyTemplates.some(item => item.pKey === template.pKey)) {
          backupCompanyTemplates.push(template);
        }
      });

      systemTemplates.forEach((template: ModelType & TemplateType) => {
        if (!backupSystemTemplates.some(item => item.pKey === template.pKey)) {
          backupSystemTemplates.push(template);
        }
      });

      templates.forEach((template: ModelType & TemplateType) => {
        if (!backupTemplates.some(item => item.pKey === template.pKey)) {
          backupTemplates.push(template);
        }
      });

      return {
        ...state,
        backupCompanyTemplates,
        backupSystemTemplates,
        backupTemplates,
      };
    }

    case templateTypeConstants.CLEAR_TEMPLATE_REDUCER:
      return {
        ...state,
        companyTemplates: [],
        templates: [],
        editingTemplate: {},
        editingField: {},
        isRetrieving: false,
      };

    case loginTypeConstants.LOGOUT:
      return initialState;

    default:
      return state;
  }
};

function updateSection(state: any, sectionOrder: number, updateObj: any) {
  return {
    ...state,
    editingTemplate: {
      ...state.editingTemplate,
      Sections: state.editingTemplate.Sections.map((item: any) =>
        item.Order === sectionOrder
          ? {
              ...item,
              ...updateObj,
            }
          : item,
      ),
    },
  };
}

function updateField(
  state: any,
  sectionOrder: number,
  fieldOrder: number,
  updateObj: any,
) {
  return {
    ...state,
    editingTemplate: {
      ...state.editingTemplate,
      Sections: state.editingTemplate.Sections.map((item: any) =>
        item.Order === sectionOrder
          ? {
              ...item,
              Fields: item.Fields.map((fieldItem: any) =>
                fieldItem.Order === fieldOrder
                  ? {
                      ...fieldItem,
                      ...updateObj,
                    }
                  : fieldItem,
              ),
            }
          : item,
      ),
    },
  };
}
