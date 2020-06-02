import {all, put, select, call, takeEvery} from 'redux-saga/effects';
import {Toast, Modal, Portal} from '@ant-design/react-native';
import {
  getTemplatesFulfilled,
  clearEditingTemplate,
  deleteUserTemplateDraft,
  fetchUserTemplates,
  fetchCompanyTemplates,
  fetchCompanyTemplatesFulfilled,
  fetchSystemTemplatesFulfilled,
  uploadUserTemplateSuccess,
  uploadCompanyTemplateSuccess,
  deleteUserTemplateSuccess,
  deleteCompanyTemplateSuccess,
  previewTemplate,
} from '../actions';
import {templateTypeConstants} from '../types';
import {
  requestApiV2,
  API_v2,
  getUserInfo,
  getIn,
  isNetworkConnected,
} from '../../common/utils';
import * as mock from '../reducers/mock';
import moment from 'moment';
import {TemplateType, ModelType} from '../../common/constants/ModeTypes';
import {
  toastTips,
  fieldTypes,
  UPLOAD_STATUS_TRUE,
  UPLOAD_STATUS_FALSE,
} from '../../common/constants';
// import reactotron from "../../../ReactotronConfig";

export function* TemplateInit() {
  yield all([
    takeEvery(
      templateTypeConstants.FETCH_USER_TEMPLATES,
      fetchUserTemplatesFromService,
    ),
    takeEvery(
      templateTypeConstants.FETCH_COMPANY_TEMPLATES,
      fetchCompanyTemplatesFromService,
    ),
    takeEvery(
      templateTypeConstants.FETCH_SYSTEM_TEMPLATES,
      fetchSystemTemplatesFromService,
    ),
    takeEvery(templateTypeConstants.UPLOAD_USER_TEMPLATE, uploadUserTemplate),
    takeEvery(
      templateTypeConstants.UPLOAD_COMPANY_TEMPLATE,
      uploadCompanyTemplate,
    ),
    takeEvery(templateTypeConstants.DELETE_USER_TEMPLATE, deleteUserTemplate),
    takeEvery(
      templateTypeConstants.DELETE_COMPANY_TEMPLATE,
      deleteCompanyTemplate,
    ),
    takeEvery(templateTypeConstants.SHARE_TEMPLATE, shareTemplateAndReport),
    takeEvery(
      templateTypeConstants.COPY_TEMPLATE_ADD_TO_MINE,
      copyTemplateAddToMine,
    ),
    takeEvery(
      templateTypeConstants.ADD_SYSTEM_TEMPLATE_TO_COMPANY,
      addSystemTemplateToCompany,
    ),
    takeEvery(
      templateTypeConstants.FETCH_TEMPLATE_INFO,
      fetchTemplateInfoFromService,
    ),
  ]);
}

// 从服务端同步 user Template
function* fetchUserTemplatesFromService(action: {
  type: string;
  authToken: string;
  failedCallback?: Function;
}) {
  const {authToken, failedCallback} = action;
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getUserTemplate, null, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  let templatesFromService: any = [];
  if (rlt.result === 'Success') {
    templatesFromService = rlt.data.map((templateItem: any) =>
      formatServiceTemplateToLocal(templateItem),
    );
    yield put(getTemplatesFulfilled(templatesFromService));
  } else if (rlt.error) {
    Toast.fail(rlt.error, 2);
    if (failedCallback) {
      failedCallback();
    }
  } else {
    if (failedCallback) {
      failedCallback();
    }
  }
}

// 从服务端同步 company Template
function* fetchCompanyTemplatesFromService(action: {
  type: string;
  authToken: string;
  failedCallback?: Function;
}) {
  const {authToken, failedCallback} = action;
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getCompanyTemplate, null, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  let companyTemplates: Array<TemplateType & ModelType> = [];
  if (rlt.result === 'Success') {
    companyTemplates = rlt.data.map((templateItem: any) =>
      formatServiceTemplateToLocal(templateItem),
    );
    yield put(fetchCompanyTemplatesFulfilled(companyTemplates));
  } else if (rlt.error) {
    Toast.fail(rlt.error, 2);
    if (failedCallback) {
      failedCallback();
    }
  } else {
    if (failedCallback) {
      failedCallback();
    }
  }
}

function* fetchSystemTemplatesFromService(action: {
  type: string;
  authToken: string;
  failedCallback?: Function;
}) {
  const {authToken, failedCallback} = action;
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getSystemTemplate, null, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  let systemTemplatesFromService: Array<TemplateType & ModelType> = [];
  if (rlt.result === 'Success') {
    systemTemplatesFromService = rlt.data.map((templateItem: any) => ({
      ...formatServiceTemplateToLocal(templateItem),
      isTop: templateItem.isTop || false,
      label: templateItem.label || '',
    }));
    yield put(fetchSystemTemplatesFulfilled(systemTemplatesFromService));
  } else if (rlt.error) {
    Toast.fail(rlt.error, 2);
    if (failedCallback) {
      failedCallback();
    }
  } else {
    if (failedCallback) {
      failedCallback();
    }
  }
}

// 上传 user Template
function* uploadUserTemplate(action: {
  type: string;
  authToken: string;
  templateData: ModelType & TemplateType;
  callback?: Function;
}) {
  const {authToken, templateData} = action;
  let data = formatLocalTemplateToServiceTemplate(templateData);
  const toastKey = Toast.loading('Submitting...', 0);
  let api = templateData.UploadStatus
    ? API_v2.updateUserTemplate
    : API_v2.createUserTemplate;

  let rlt = yield call(() => {
    return requestApiV2(api, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    if (templateData.UploadStatus) {
      Toast.success(toastTips.SuccessUpload, 1);
    } else {
      const userId = yield select(state => state.loginInfo.currentUserInfo._id);
      yield put(deleteUserTemplateDraft(userId, templateData.pKey));
      Toast.success(toastTips.SuccessCreate, 1);
    }
    yield put(fetchUserTemplates(authToken));
    if (action.callback) {
      action.callback();
    }
  } else if (rlt.error) {
    Modal.alert('Upload failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

// 上传 company Template
function* uploadCompanyTemplate(action: {
  type: string;
  authToken: string;
  templateData: ModelType & TemplateType;
  createOrUpdate: boolean;
  callback?: Function;
}) {
  const {authToken, templateData, createOrUpdate} = action;
  const toastKey = Toast.loading('Submitting...', 0);
  const duplicateTemplateData = createOrUpdate
    ? duplicateNewTemplateForCompany(templateData)
    : templateData;
  let data = formatLocalTemplateToServiceTemplate(duplicateTemplateData);
  const api = createOrUpdate
    ? API_v2.createCompanyTemplate
    : API_v2.updateCompanyTemplate;
  let rlt = yield call(() => {
    return requestApiV2(api, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    if (templateData.UploadStatus) {
      Toast.success(toastTips.SuccessUpload, 1);
    } else {
      const userId = yield select(state => state.loginInfo.currentUserInfo._id);
      yield put(deleteUserTemplateDraft(userId, templateData.pKey));
      Toast.success(toastTips.SuccessCreate, 1);
    }
    if (action.callback) {
      action.callback();
    }
    yield put(fetchCompanyTemplates(authToken));
  } else if (rlt.error) {
    Modal.alert('Upload failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

// 删除已上传 user Template
function* deleteUserTemplate(action: {
  type: string;
  authToken: string;
  templatepKey: string;
}) {
  let data = {templateId: action.templatepKey};
  const toastKey = Toast.loading('Submitting...', 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.deleteUserTemplate, data, action.authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    Toast.success('Successful deleted', 1);
    yield put(deleteUserTemplateSuccess(action.templatepKey));
  } else if (rlt.error) {
    Modal.alert('Delete failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}
// 删除已上传 company Template
function* deleteCompanyTemplate(action: {
  type: string;
  authToken: string;
  templatepKey: string;
}) {
  let data = {templateId: action.templatepKey};
  const toastKey = Toast.loading('Submitting...', 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.deleteCompanyTemplate, data, action.authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    Toast.success('Successful deleted', 1);
    yield put(deleteCompanyTemplateSuccess(action.templatepKey));
  } else if (rlt.error) {
    Modal.alert('Delete failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

function* shareTemplateAndReport(action: {
  type: string;
  authToken: string;
  option: {
    recipientIds: Array<string>;
    groupId: Array<string>;
    templateId: string;
    reportId: string;
  };
  callback?: Function;
}) {
  let {authToken, option, callback} = action;
  const {recipientIds, groupId, templateId, reportId} = option;
  let data = {
    userIds:
      Array.isArray(recipientIds) && recipientIds.length ? recipientIds : null,
    groupIds: Array.isArray(groupId) && groupId.length ? groupId : null,
    templateId: templateId ? templateId : null,
    reportId: reportId ? reportId : null,
  };
  const toastKey = Toast.loading('Loading...', 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.createDynamic, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    Toast.success(toastTips.SuccessShare, 1);
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert('Share failed!', rlt.error, [{text: 'OK', onPress: () => {}}]);
  }
}

// For Download Company Template & Add Template from Dynamic
function* copyTemplateAddToMine(action: {
  type: string;
  authToken: string;
  option: {
    templatePkey: string;
    templateName?: string;
  };
  callback?: Function;
}) {
  let {authToken, option, callback} = action;
  const toastKey = Toast.loading('Loading...', 0);
  const data = {
    templateId: option.templatePkey,
    name: option.templateName || '',
  };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.createUserTemplate, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    // dynamic 和 template 两处调用，故将toast写入回调。
    yield put(fetchUserTemplates(authToken));
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert('Download template failed!', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

// For Add System Template
function* addSystemTemplateToCompany(action: {
  type: string;
  authToken: string;
  option: {
    templatePkey: string;
    templateName?: string;
  };
  callback?: Function;
}) {
  let {authToken, option, callback} = action;
  const toastKey = Toast.loading('Loading...', 0);
  const data = {
    templateId: option.templatePkey,
    name: option.templateName || '',
  };
  let rlt = yield call(() => {
    return requestApiV2(API_v2.createCompanyTemplate, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    yield put(fetchCompanyTemplates(authToken));
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert('Add System template failed!', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

// fetch template 详情
function* fetchTemplateInfoFromService(action: {
  type: string;
  authToken: string;
  templateId: string;
  callback?: Function;
  actionType?: string;
}) {
  let {authToken, templateId, callback, actionType} = action;
  const data = {templateId};
  const toastKey = Toast.loading('Loading...', 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getTemplateInfo, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success' && rlt.data) {
    const templateDetail = formatServiceTemplateToLocal(rlt.data);
    let hasLinkedReport = false;
    templateDetail.Sections.forEach((section: any) => {
      section.Fields.forEach((field: any) => {
        if (
          field.Type === fieldTypes.LinkedReport ||
          field.Type === fieldTypes.LinkedField ||
          field.Type === fieldTypes.File
        ) {
          hasLinkedReport = true;
        }
      });
    });
    if (actionType === 'ShareTemplate') {
      yield put(previewTemplate(templateDetail));
      if (callback) {
        callback(templateDetail);
      }
    } else if (actionType === 'CopyTemplate') {
      if (hasLinkedReport) {
        Modal.alert(
          "You can't copy this template !",
          'Templates with link master or file element can only be created or edited on the web side.',
          [{text: 'OK', onPress: () => {}}],
        );
      } else {
        if (callback) {
          callback(templateDetail);
        }
      }
    } else if (hasLinkedReport) {
      Modal.alert(
        'Please go to the web side to edit the template !',
        'Templates with link master or file element can only be created or edited on the web side.',
        [{text: 'OK', onPress: () => {}}],
      );
    } else {
      yield put(previewTemplate(templateDetail));
      if (callback) {
        callback(templateDetail);
      }
    }
  } else if (rlt.error) {
    Modal.alert('Unable to edit the template!', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  } else if (rlt.data === null) {
    Modal.alert(
      'Unable to edit the template!',
      'The template has been deleted',
      [{text: 'OK', onPress: () => {}}],
    );
  }
}

// 本地Template转换成服务端字段的Template
const formatLocalTemplateToServiceTemplate = (
  localTemplate: ModelType & TemplateType,
) => ({
  templateId: localTemplate.UploadStatus ? localTemplate.pKey : '',
  name: localTemplate.Name,
  showCode: localTemplate.showCode,
  activeStatus: localTemplate.ActiveStatus,
  uploadStatus: UPLOAD_STATUS_TRUE,
  remark: localTemplate.Remark,
  customizeKey: localTemplate.customizeKey || '',
  codeType: localTemplate.codeType || '',
  color: localTemplate.color || '',
  _id: localTemplate._id || undefined,
  shelveStatus: localTemplate.shelveStatus || undefined,
  linkable: localTemplate.linkable || undefined,
  isDefault: localTemplate.isDefault || undefined,
  hiddenFields: localTemplate.hiddenFields || undefined,
  sendEmails: localTemplate.sendEmails,
  department: localTemplate.department,
  actionableDepartments: localTemplate.actionableDepartments,
  privacyStaffs: localTemplate.privacyStaffs,
  actionableAll: localTemplate.actionableAll,
  approval: localTemplate.approval,
  sections: localTemplate.Sections.map((sItem: any) => ({
    _id: sItem._id || undefined,
    name: sItem.Name || '',
    order: sItem.Order,
    remark: sItem.Remark,
    fields: sItem.Fields.map((fItem: any) => ({
      _id: fItem._id || undefined,
      name: fItem.Name,
      type: fItem.Type,
      order: fItem.Order,
      remark: fItem.Remark,
      property: {
        required: fItem.property.required || false,
        hidden: fItem.property.privacy || false,
        options: fItem.property.options || [],
        defaultValue: fItem.property.defaultValue || '',
        maximum: fItem.property.maximum || 0,
        minimum: fItem.property.minimum || 0,
        maxLength: fItem.property.maxLength || 0,
        minLength: fItem.property.minLength || 0,
        placeHolder: fItem.property.placeHolder || '',
        videoTime: fItem.property.videoTime || 0,
        autoCompleteFromStaffName:
          fItem.property.autoCompleteFromStaffName || false,
        autoCompleteFromStaffId:
          fItem.property.autoCompleteFromStaffId || false,
        autoCompleteCreationTime:
          fItem.property.autoCompleteCreationTime || false,
        customOption: fItem.property.customOption || false,
        decimalPlaces: fItem.property.decimalPlaces || 0,
        templateId: fItem.property.templateId || undefined,
        linkedReportId: fItem.property.linkedReportId || undefined,
        fieldId: fItem.property.fieldId || undefined,
        internalData: fItem.property.internalData || false,
        pictureNumber: fItem.property.pictureNumber || 1,
        videoNumber: fItem.property.videoNumber || 1,
        currencyUnit: fItem.property.currencyUnit || '',
        sendEmail: fItem.property.sendEmail || false,
      },
      tableFieldList: fItem.TableFieldList.map((tbFItem: any) => ({
        _id: tbFItem._id || undefined,
        name: tbFItem.Name,
        type: tbFItem.Type,
        order: tbFItem.Order,
        remark: tbFItem.Remark,
        property: {
          required: tbFItem.property.required || false,
          hidden: tbFItem.property.privacy || false,
          options: tbFItem.property.options || [],
          defaultValue: tbFItem.property.defaultValue || '',
          maximum: tbFItem.property.maximum || 0,
          minimum: tbFItem.property.minimum || 0,
          maxLength: tbFItem.property.maxLength || 0,
          minLength: tbFItem.property.minLength || 0,
          placeHolder: tbFItem.property.placeHolder || '',
          autoCompleteFromStaffName:
            tbFItem.property.autoCompleteFromStaffName || false,
          autoCompleteFromStaffId:
            tbFItem.property.autoCompleteFromStaffId || false,
          autoCompleteCreationTime:
            tbFItem.property.autoCompleteCreationTime || false,
          customOption: tbFItem.property.customOption || false,
          decimalPlaces: tbFItem.property.decimalPlaces || 0,
          internalData: tbFItem.property.internalData || false,
          currencyUnit: tbFItem.property.currencyUnit || '',
          sendEmail: tbFItem.property.sendEmail || false,
        },
      })),
    })),
  })),
});

// 拷贝副本以 Upload Template to Company
const duplicateNewTemplateForCompany = (
  template: ModelType & TemplateType,
) => ({
  ...template,
  pKey: '',
  ActiveStatus: 1,
  UploadStatus: 1,
  Sections: template.Sections.map((sItem: any) => ({
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
});

// 服务端Template转换成本地字段的Template
export const formatServiceTemplateToLocal = (TemplateObj: any) => {
  // 字段映射
  let localTemplate: TemplateType & ModelType = {
    pKey: TemplateObj._id || '',
    Name: TemplateObj.name || '',
    Remark: TemplateObj.remark || '',
    ActiveStatus: TemplateObj.activeStatus || 0,
    UploadStatus: TemplateObj.uploadStatus || 0,
    showCode: TemplateObj.showCode || false,
    User_pKey_Creator: getIn(TemplateObj, ['userIdCreator', '_id'], ''),
    User_pKey_Modifier: TemplateObj.userIdModifier || '',
    customizeKey: TemplateObj.customizeKey || '',
    codeType: TemplateObj.codeType || '',
    color: TemplateObj.color || '',
    _id: TemplateObj._id || undefined,
    shelveStatus: TemplateObj.shelveStatus || undefined,
    linkable: TemplateObj.linkable || undefined,
    isDefault: TemplateObj.isDefault || undefined,
    isSharing: TemplateObj.isSharing || false,
    hiddenSection: TemplateObj.hiddenSection || false,
    hiddenFields: TemplateObj.hiddenFields || [],
    CreatorName: getIn(TemplateObj, ['userIdCreator', 'nickName'], ''),
    companyId: getIn(TemplateObj, ['userIdCreator', 'company', '_id'], ''),
    companyName: getIn(TemplateObj, ['userIdCreator', 'company', 'name'], ''),
    CreatorPic: getIn(TemplateObj, ['userIdCreator', 'userPic'], ''),
    createdAt:
      moment(TemplateObj.createdAt).format('YYYY-MM-DD HH:mm:ss') || '',
    updatedAt:
      moment(TemplateObj.updatedAt).format('YYYY-MM-DD HH:mm:ss') || '',
    sendEmails: TemplateObj.sendEmails,
    department: TemplateObj.department,
    departmentName: TemplateObj.departmentName,
    actionableDepartments: TemplateObj.actionableDepartments,
    privacyStaffs: TemplateObj.privacyStaffs,
    actionableAll: TemplateObj.actionableAll,
    approval: TemplateObj.approval,
    Sections: TemplateObj.sections.map((s: any) => ({
      _id: s._id || '',
      Name: s.name || '',
      Order: s.order || 0,
      Remark: s.remark || '',
      FieldData: [],
      Fields: s.fields.map((f: any) => ({
        _id: f._id || '',
        Name: f.name || '',
        Type: f.type || '',
        Order: f.order || 0,
        Remark: f.remark || '',
        isLinked: f.isLinked || false,
        property: {
          required: f.property.required || false,
          privacy: f.property.hidden || false,
          options: Array.isArray(f.property.options) ? f.property.options : [],
          defaultValue: f.property.defaultValue || '',
          maximum: f.property.maximum || 0,
          minimum: f.property.minimum || 0,
          maxLength: f.property.maxLength || 0,
          minLength: f.property.minLength || 0,
          placeHolder: f.property.placeHolder || '',
          videoTime: f.property.videoTime || 0,
          autoCompleteFromStaffName:
            f.property.autoCompleteFromStaffName || false,
          autoCompleteFromStaffId: f.property.autoCompleteFromStaffId || false,
          autoCompleteCreationTime:
            f.property.autoCompleteCreationTime || false,
          customOption: f.property.customOption || false,
          decimalPlaces: f.property.decimalPlaces || 0,
          templateId: f.property.templateId || undefined,
          linkedReportId: f.property.linkedReportId || undefined,
          fieldId: f.property.fieldId || undefined,
          internalData: f.property.internalData || false,
          pictureNumber: f.property.pictureNumber || 1,
          videoNumber: f.property.videoNumber || 1,
          currencyUnit: f.property.currencyUnit || '',
          sendEmail: f.property.sendEmail || false,
        },
        TableFieldList: f.tableFieldList.map((tbF: any) => ({
          _id: tbF._id || '',
          Name: tbF.name || '',
          Type: tbF.type || '',
          Order: tbF.order || 0,
          Remark: tbF.remark || '',
          property: {
            required: tbF.property.required || false,
            privacy: tbF.property.hidden || false,
            options: Array.isArray(tbF.property.options)
              ? tbF.property.options
              : [],
            defaultValue: tbF.property.defaultValue || '',
            maximum: tbF.property.maximum || 0,
            minimum: tbF.property.minimum || 0,
            maxLength: tbF.property.maxLength || 0,
            minLength: tbF.property.minLength || 0,
            placeHolder: tbF.property.placeHolder || '',
            autoCompleteFromStaffName:
              tbF.property.autoCompleteFromStaffName || false,
            autoCompleteFromStaffId:
              tbF.property.autoCompleteFromStaffId || false,
            autoCompleteCreationTime:
              tbF.property.autoCompleteCreationTime || false,
            customOption: tbF.property.customOption || false,
            decimalPlaces: tbF.property.decimalPlaces || 0,
            internalData: tbF.property.internalData || false,
            currencyUnit: tbF.property.currencyUnit || '',
            sendEmail: tbF.property.sendEmail || false,
          },
        })),
        FieldPosition: f.positionProperty || null,
        FieldTableProperty: f.tableProperty || null,
      })),
    })),
  };

  return localTemplate;
};
