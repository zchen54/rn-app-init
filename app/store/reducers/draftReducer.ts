import {draftTypeConstants} from '../actions';
import {
  FieldType,
  TemplateType,
  ModelType,
  ReportType,
} from '../../common/constants/ModeTypes';
import moment from 'moment';

interface UserDrafts {
  userTemplateDraftsMap: Array<string>;
  userReportDraftsMap: Array<string>;
  companyReportDraftsMap: Array<string>;
}
const initialUserDrafts: UserDrafts = {
  userTemplateDraftsMap: [],
  userReportDraftsMap: [],
  companyReportDraftsMap: [],
};

interface InitialState {
  userIdIndexedDrafts: any;
  userTemplateDrafts: Array<ModelType & TemplateType>;
  userReportDrafts: Array<ModelType & ReportType>;
  companyReportDrafts: Array<ModelType & ReportType>;
}
const initialState: InitialState = {
  userIdIndexedDrafts: {},
  userTemplateDrafts: [],
  userReportDrafts: [],
  companyReportDrafts: [],
};

export const draftReducer = (state = initialState, action: any) => {
  switch (action.type) {
    // user template draft
    case draftTypeConstants.CREATE_USER_TEMPLATE_DRAFT: {
      const {userId, templateData} = action;
      let userIdIndexedDrafts = {...state.userIdIndexedDrafts};
      let userTemplateDrafts = [...state.userTemplateDrafts];

      if (!userIdIndexedDrafts[userId]) {
        userIdIndexedDrafts[userId] = initialUserDrafts;
      }
      let userTemplateDraftsMap = [
        ...userIdIndexedDrafts[userId].userTemplateDraftsMap,
      ];
      if (
        Array.isArray(userTemplateDraftsMap) &&
        userTemplateDraftsMap.indexOf(templateData.pKey) < 0
      ) {
        userTemplateDraftsMap.push(templateData.pKey);
        userIdIndexedDrafts[userId] = {
          ...userIdIndexedDrafts[userId],
          userTemplateDraftsMap,
        };
        userTemplateDrafts.push({
          ...templateData,
          createdAt: moment().toString(),
          updatedAt: moment().toString(),
        });
      }

      return {
        ...state,
        userIdIndexedDrafts,
        userTemplateDrafts,
      };
    }

    case draftTypeConstants.UPDATE_USER_TEMPLATE_DRAFT: {
      const {userId, templateData} = action;
      let userTemplateDrafts = [...state.userTemplateDrafts];
      userTemplateDrafts = userTemplateDrafts.map(item => {
        if (item.pKey === templateData.pKey) {
          return {...templateData, updatedAt: moment().toString()};
        } else {
          return item;
        }
      });

      return {
        ...state,
        userTemplateDrafts,
      };
    }

    case draftTypeConstants.DELETE_USER_TEMPLATE_DRAFT: {
      const {userId, templatepKey} = action;
      let userIdIndexedDrafts = {...state.userIdIndexedDrafts};
      let userTemplateDrafts = [...state.userTemplateDrafts];

      if (
        userIdIndexedDrafts[userId] &&
        Array.isArray(userIdIndexedDrafts[userId].userTemplateDraftsMap)
      ) {
        let userTemplateDraftsMap = [
          ...userIdIndexedDrafts[userId].userTemplateDraftsMap,
        ];
        userTemplateDraftsMap.forEach((item, index) => {
          if (item === templatepKey) {
            userTemplateDraftsMap.splice(index, 1);
          }
        });
        userIdIndexedDrafts[userId] = {
          ...userIdIndexedDrafts[userId],
          userTemplateDraftsMap,
        };
      }

      userTemplateDrafts.forEach((item, index) => {
        if (item.pKey === templatepKey) {
          userTemplateDrafts.splice(index, 1);
        }
      });

      return {
        ...state,
        userIdIndexedDrafts,
        userTemplateDrafts,
      };
    }

    // // user report draft
    // case draftTypeConstants.CREATE_USER_REPORT_DRAFT: {
    //   const {userId, reportData} = action;
    //   let userIdIndexedDrafts = {...state.userIdIndexedDrafts};
    //   let userReportDrafts = [...state.userReportDrafts];

    //   if (!userIdIndexedDrafts[userId]) {
    //     userIdIndexedDrafts[userId] = initialUserDrafts;
    //   }
    //   let userReportDraftsMap = [
    //     ...userIdIndexedDrafts[userId].userReportDraftsMap,
    //   ];
    //   if (
    //     Array.isArray(userReportDraftsMap) &&
    //     userReportDraftsMap.indexOf(reportData.pKey) < 0
    //   ) {
    //     userReportDraftsMap.push(reportData.pKey);
    //     userIdIndexedDrafts[userId] = {
    //       ...userIdIndexedDrafts[userId],
    //       userReportDraftsMap,
    //     };
    //     userReportDrafts.push(reportData);
    //   }

    //   return {
    //     ...state,
    //     userIdIndexedDrafts,
    //     userReportDrafts,
    //   };
    // }

    // case draftTypeConstants.UPDATE_USER_REPORT_DRAFT: {
    //   const {userId, reportData} = action;
    //   let userReportDrafts = [...state.userReportDrafts];
    //   userReportDrafts = userReportDrafts.map(item => {
    //     if (item.pKey === reportData.pKey) {
    //       return reportData;
    //     } else {
    //       return item;
    //     }
    //   });

    //   return {
    //     ...state,
    //     userReportDrafts,
    //   };
    // }

    // case draftTypeConstants.DELETE_USER_REPORT_DRAFT: {
    //   const {userId, reportpKey} = action;
    //   let userIdIndexedDrafts = {...state.userIdIndexedDrafts};
    //   let userReportDrafts = [...state.userReportDrafts];

    //   if (
    //     userIdIndexedDrafts[userId] &&
    //     Array.isArray(userIdIndexedDrafts[userId].userReportDraftsMap)
    //   ) {
    //     let userReportDraftsMap = [
    //       ...userIdIndexedDrafts[userId].userReportDraftsMap,
    //     ];
    //     userReportDraftsMap.forEach((item, index) => {
    //       if (item === reportpKey) {
    //         userReportDraftsMap.splice(index, 1);
    //       }
    //     });
    //     userIdIndexedDrafts[userId] = {
    //       ...userIdIndexedDrafts[userId],
    //       userReportDraftsMap,
    //     };
    //   }

    //   userReportDrafts.forEach((item, index) => {
    //     if (item.pKey === reportpKey) {
    //       userReportDrafts.splice(index, 1);
    //     }
    //   });

    //   return {
    //     ...state,
    //     userIdIndexedDrafts,
    //     userReportDrafts,
    //   };
    // }

    // company report draft
    case draftTypeConstants.CREATE_COMPANY_REPORT_DRAFT: {
      const {userId, reportData} = action;
      let userIdIndexedDrafts = {...state.userIdIndexedDrafts};
      let companyReportDrafts = [...state.companyReportDrafts];

      if (!userIdIndexedDrafts[userId]) {
        userIdIndexedDrafts[userId] = initialUserDrafts;
      }
      let companyReportDraftsMap = [
        ...userIdIndexedDrafts[userId].companyReportDraftsMap,
      ];
      if (
        Array.isArray(companyReportDraftsMap) &&
        companyReportDraftsMap.indexOf(reportData.pKey) < 0
      ) {
        companyReportDraftsMap.push(reportData.pKey);
        userIdIndexedDrafts[userId] = {
          ...userIdIndexedDrafts[userId],
          companyReportDraftsMap,
        };
        companyReportDrafts.push({
          ...reportData,
          createdAt: moment().toString(),
          updatedAt: moment().toString(),
        });
      }

      return {
        ...state,
        userIdIndexedDrafts,
        companyReportDrafts,
      };
    }

    case draftTypeConstants.UPDATE_COMPANY_REPORT_DRAFT: {
      const {userId, reportData} = action;
      let companyReportDrafts = [...state.companyReportDrafts];
      companyReportDrafts = companyReportDrafts.map(item => {
        if (item.pKey === reportData.pKey) {
          return {...reportData, updatedAt: moment().toString()};
        } else {
          return item;
        }
      });

      return {
        ...state,
        companyReportDrafts,
      };
    }

    case draftTypeConstants.DELETE_COMPANY_REPORT_DRAFT: {
      const {userId, reportpKey} = action;
      let userIdIndexedDrafts = {...state.userIdIndexedDrafts};
      let companyReportDrafts = [...state.companyReportDrafts];

      if (
        userIdIndexedDrafts[userId] &&
        Array.isArray(userIdIndexedDrafts[userId].companyReportDraftsMap)
      ) {
        let companyReportDraftsMap = [
          ...userIdIndexedDrafts[userId].companyReportDraftsMap,
        ];
        companyReportDraftsMap.forEach((item, index) => {
          if (item === reportpKey) {
            companyReportDraftsMap.splice(index, 1);
          }
        });
        userIdIndexedDrafts[userId] = {
          ...userIdIndexedDrafts[userId],
          companyReportDraftsMap,
        };
      }

      companyReportDrafts.forEach((item, index) => {
        if (item.pKey === reportpKey) {
          companyReportDrafts.splice(index, 1);
        }
      });

      return {
        ...state,
        userIdIndexedDrafts,
        companyReportDrafts,
      };
    }

    case draftTypeConstants.DELETE_MULTIPLE_COMPANY_REPORT_DRAFT: {
      const {userId, reportpKeys} = action;
      let userIdIndexedDrafts = {...state.userIdIndexedDrafts};
      let companyReportDrafts = [...state.companyReportDrafts];

      if (
        userIdIndexedDrafts[userId] &&
        Array.isArray(userIdIndexedDrafts[userId].companyReportDraftsMap)
      ) {
        let companyReportDraftsMap = [
          ...userIdIndexedDrafts[userId].companyReportDraftsMap,
        ];
        companyReportDraftsMap = companyReportDraftsMap.filter(
          item => reportpKeys.indexOf(item) < 0,
        );
        userIdIndexedDrafts[userId] = {
          ...userIdIndexedDrafts[userId],
          companyReportDraftsMap,
        };
      }

      companyReportDrafts = companyReportDrafts.filter(
        item => reportpKeys.indexOf(item.pKey) < 0,
      );

      return {
        ...state,
        userIdIndexedDrafts,
        companyReportDrafts,
      };
    }

    // set error
    case draftTypeConstants.SET_ERROR_FOR_AUTO_UPLOAD_DRAFT: {
      const {errorReports} = action;
      let companyReportDrafts = [...state.companyReportDrafts];
      companyReportDrafts = companyReportDrafts.map(item => {
        let errorIndex = -1;
        errorReports.forEach((errorItem: any, index: number) => {
          if (item.pKey === errorItem.pKey) {
            errorIndex = index;
          }
        });
        if (errorIndex > -1) {
          return {...item, error: errorReports[errorIndex].error};
        } else {
          return item;
        }
      });
      return {
        ...state,
        companyReportDrafts,
      };
    }

    // clear
    case draftTypeConstants.CLEAR_DRAFT:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};
