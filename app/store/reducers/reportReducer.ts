'use strict';
import {reportTypeConstants, loginTypeConstants} from '../types';
import {fieldTypes, tableFieldTypes} from '../../common/constants';
import * as mock from './mock';
import UUID from 'uuid/v1';
import {
  FormDataType,
  ReportType,
  ModelType,
  TableFieldDataType,
  newReport,
  commonObj,
  newFieldData,
  newTableFieldData,
} from '../../common/constants/ModeTypes';
import moment from 'moment';
import {getIn} from '../..//common/utils';
const emptyReport = {};
const emptyObj = {};

interface InitialState {
  companyReports: Array<ModelType & ReportType>;
  reports: Array<ModelType & ReportType>;
  editingReport: (ModelType & ReportType) | {};
  isRetrieving: boolean;
  isDirty: boolean;
}
const initialState: InitialState = {
  companyReports: [],
  reports: [],
  editingReport: {},
  isRetrieving: false,
  isDirty: false,
};

export const reportReducer = (state = initialState, action: any) => {
  switch (action.type) {
    // get list
    case reportTypeConstants.FETCH_COMPANY_REPORTS_FULFILLED: {
      // 更新
      let newArr = state.companyReports.map((item: ModelType & ReportType) => {
        let filter = action.reports.filter(
          (report: ModelType & ReportType) => item.pKey === report.pKey,
        );
        if (filter.length) {
          return filter[0];
        } else {
          return item;
        }
      });
      // 添加
      action.reports.forEach((report: ModelType & ReportType) => {
        let filter = newArr.filter(
          (item: ModelType & ReportType) => item.pKey === report.pKey,
        );
        if (!filter.length) {
          newArr.push(report);
        }
      });
      // 排序
      newArr = newArr.sort((a: any, b: any) => {
        if (getIn(a, ['updatedAt']) && getIn(b, ['updatedAt'])) {
          return (
            moment(getIn(b, ['updatedAt'])).valueOf() -
            moment(getIn(a, ['updatedAt'])).valueOf()
          );
        } else {
          return 0;
        }
      });
      return {
        ...state,
        companyReports: newArr,
        isRetrieving: false,
      };
    }
    case reportTypeConstants.GET_REPORTS_FULFILLED: {
      // 更新
      let newArr = state.reports.map((item: ModelType & ReportType) => {
        let filter = action.reports.filter(
          (report: ModelType & ReportType) => item.pKey === report.pKey,
        );
        if (filter.length) {
          return filter[0];
        } else {
          return item;
        }
      });
      // 添加
      action.reports.forEach((report: ModelType & ReportType) => {
        let filter = newArr.filter(
          (item: ModelType & ReportType) => item.pKey === report.pKey,
        );
        if (!filter.length) {
          newArr.push(report);
        }
      });
      // 排序
      newArr = newArr.sort((a: any, b: any) => {
        if (getIn(a, ['updatedAt']) && getIn(b, ['updatedAt'])) {
          return (
            moment(getIn(b, ['updatedAt'])).valueOf() -
            moment(getIn(a, ['updatedAt'])).valueOf()
          );
        } else {
          return 0;
        }
      });
      return {
        ...state,
        reports: newArr,
        isRetrieving: false,
      };
    }

    // edit report
    case reportTypeConstants.INIT_REPORT_IMMEDIATE: {
      const {
        pKey,
        Name,
        showCode,
        customizeKey,
        codeType,
        color,
        Sections,
        CreatorName,
        companyName,
        CreatorPic,
        createdAt,
        isDefault,
        hiddenFields,
        isSharing,
        hiddenSection,
        task,
        taskId,
        companyId,
      } = action.templateData;
      return {
        ...state,
        editingReport: {
          ...newReport,
          ...commonObj,
          pKey: UUID(),
          Name: Name.substr(0, 4) + new Date().getTime(),
          TemplatepKey: pKey,
          showCode: showCode,
          customizeKey: customizeKey,
          codeType: codeType,
          color: color,
          CreatorName: CreatorName,
          companyName: companyName,
          CreatorPic: CreatorPic,
          templateName: Name,
          isDefault,
          isTemplateSharing: isSharing,
          hiddenSection,
          hiddenFields,
          templateCreatedAt: createdAt,
          task,
          taskId,
          companyId,
          Sections: Sections.map((sItem: any) => {
            let sectionItem = {...sItem};
            delete sectionItem.Fields;
            return {
              ...sectionItem,
              _id: '',
              sectionKey: sectionItem._id,
              FieldData: sItem.Fields.map((fItem: any) => {
                return {
                  ...newFieldData,
                  _id: '',
                  fieldKey: fItem._id,
                  Order: fItem.Order,
                  Type: fItem.Type,
                  FieldName: fItem.Name,
                  Remark: fItem.Remark,
                  FieldValue: '',
                  // FieldValue:
                  //   fItem.Type === fieldTypes.Radio ||
                  //   fItem.Type === fieldTypes.CheckBox
                  //     ? fItem.property.options[0]
                  //     : "",
                  TableFieldDataList: fItem.TableFieldList.map(
                    (tbFItem: any) => {
                      let newFieldValueList = [];

                      if (fItem.FieldTableProperty) {
                        let row = fItem.FieldTableProperty.row;
                        for (let i = 0; i < row - 1; i++) {
                          newFieldValueList.push('');
                          // newFieldValueList.push(
                          //   tbFItem.Type === tableFieldTypes.Radio ||
                          //     tbFItem.Type === tableFieldTypes.CheckBox
                          //     ? tbFItem.property.options[0]
                          //     : ""
                          // );
                        }
                      } else {
                        newFieldValueList.push('');
                        // newFieldValueList.push(
                        //   tbFItem.Type === tableFieldTypes.Radio ||
                        //     tbFItem.Type === tableFieldTypes.CheckBox
                        //     ? tbFItem.property.options[0]
                        //     : ""
                        // );
                      }

                      return {
                        ...newTableFieldData,
                        _id: '',
                        tableFieldKey: tbFItem._id,
                        Order: tbFItem.Order,
                        Type: tbFItem.Type,
                        FieldName: tbFItem.Name,
                        Remark: tbFItem.Remark,
                        FieldValueList: newFieldValueList,
                        property: {
                          ...tbFItem.property,
                          autoCompleteFromStaffName:
                            tbFItem.property.autoCompleteFromStaffName || false,
                          autoCompleteFromStaffId:
                            tbFItem.property.autoCompleteFromStaffId || false,
                          autoCompleteCreationTime:
                            tbFItem.property.autoCompleteCreationTime || false,
                          privacy: tbFItem.property.privacy || false,
                          customOption: tbFItem.property.customOption || false,
                          decimalPlaces: tbFItem.property.decimalPlaces || 0,
                        },
                      };
                    },
                  ),
                  property: {
                    ...fItem.property,
                    autoCompleteFromStaffName:
                      fItem.property.autoCompleteFromStaffName || false,
                    autoCompleteFromStaffId:
                      fItem.property.autoCompleteFromStaffId || false,
                    autoCompleteCreationTime:
                      fItem.property.autoCompleteCreationTime || false,
                    customOption: fItem.property.customOption || false,
                    privacy: fItem.property.privacy || false,
                    decimalPlaces: fItem.property.decimalPlaces || 0,
                    templateId: fItem.property.templateId || '',
                    linkedReportId: fItem.property.linkedReportId || '',
                    fieldId: fItem.property.fieldId || '',
                  },
                  FieldPosition: fItem.FieldPosition,
                  FieldTableProperty: fItem.FieldTableProperty,
                };
              }),
            };
          }),
        },
      };
    }
    case reportTypeConstants.SAVE_EDITING_REPORT:
      return {
        ...state,
        editingReport: {...action.reportData},
      };
    case reportTypeConstants.PREVIEW_REPORT:
      return {
        ...state,
        editingReport: {...action.reportData},
      };
    case reportTypeConstants.PREVIEW_REPORT_BY_SELECT:
      return {
        ...state,
        editingReport: {
          ...state.reports.filter(
            (item: any) => item.pKey === action.reportpKey,
          )[0],
        },
      };
    case reportTypeConstants.CLEAR_EDITING_REPORT:
      return {
        ...state,
        editingReport: Object.assign({}, emptyReport),
      };
    case reportTypeConstants.CLEAR_REPORT_REDUCER:
      return {
        ...state,
        companyReports: [],
        reports: [],
        editingReport: {},
        isRetrieving: false,
        isDirty: false,
      };

    case reportTypeConstants.UPLOAD_USER_REPORT_SUCCESS: {
      const {reportData} = action;
      return {
        ...state,
        reports: state.reports.map(item => {
          if (item.pKey === reportData.pKey) {
            return reportData;
          } else {
            return item;
          }
        }),
      };
    }

    case reportTypeConstants.UPLOAD_COMPANY_REPORT_SUCCESS: {
      const {reportData} = action;
      return {
        ...state,
        companyReports: state.companyReports.map(item => {
          if (item.pKey === reportData.pKey) {
            return reportData;
          } else {
            return item;
          }
        }),
      };
    }

    case reportTypeConstants.DELETE_USER_REPORT_SUCCESS: {
      const {reportpKey} = action;
      let reports = [...state.reports];
      reports.forEach((item, index) => {
        if (item.pKey === reportpKey) {
          reports.splice(index, 1);
        }
      });
      return {
        ...state,
        reports,
      };
    }

    case reportTypeConstants.DELETE_COMPANY_REPORT_SUCCESS: {
      const {reportpKey} = action;
      let companyReports = [...state.companyReports];
      companyReports.forEach((item, index) => {
        if (item.pKey === reportpKey) {
          companyReports.splice(index, 1);
        }
      });
      return {
        ...state,
        companyReports,
      };
    }

    case loginTypeConstants.LOGOUT:
      return initialState;
    default:
      return state;
  }
};
