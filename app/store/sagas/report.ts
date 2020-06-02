import {Platform} from 'react-native';
import {PlatFormAndroid} from '../../env';
import {all, put, select, call, takeEvery} from 'redux-saga/effects';
import {Toast, Modal, Portal} from '@ant-design/react-native';
import UUID from 'uuid/v1';
import Geolocation from '@react-native-community/geolocation';
import {
  getReportsFulfilled,
  clearEditingTemplate,
  clearEditingReport,
  fetchCompanyReportsFulfilled,
  fetchUserReports,
  fetchCompanyReports,
  previewReport,
  deleteUserReportDraft,
  deleteCompanyReportDraft,
  deleteUserReportSuccess,
  deleteCompanyReportSuccess,
  setErrorForAutoUploadDraft,
  deleteMultipleCompanyReportDraft,
  initReportImmediate,
  fetchReportInfo,
} from '../actions';
import {reportTypeConstants} from '../types';
import {
  requestApiV2,
  API_v2,
  getIn,
  uploadImage,
  uploadVideo,
  isNetworkConnected,
} from '../../common/utils';
import moment from 'moment';
import {
  ReportType,
  ModelType,
  SectionType,
  TemplateType,
} from '../../common/constants/ModeTypes';
import {
  toastTips,
  fieldTypes,
  UPLOAD_STATUS_TRUE,
  UPLOAD_STATUS_FALSE,
} from '../../common/constants';
import {formatServiceTemplateToLocal} from './template';

export function* ReportInit() {
  yield all([
    takeEvery(reportTypeConstants.INIT_REPORT, fetchBeforeInitReport),
    takeEvery(
      reportTypeConstants.FETCH_USER_REPORTS,
      fetchUserReportsFromService,
    ),
    takeEvery(
      reportTypeConstants.FETCH_COMPANY_REPORTS,
      fetchCompanyReportsFromService,
    ),
    takeEvery(
      reportTypeConstants.FETCH_REPORT_INFO,
      fetchReportInfoFromService,
    ),
    takeEvery(reportTypeConstants.UPLOAD_USER_REPORT, uploadUserReport),
    takeEvery(reportTypeConstants.UPLOAD_COMPANY_REPORT, uploadCompanyReport),
    takeEvery(reportTypeConstants.SUBMIT_REPORT_BY_SHARE, submitReportByShare),
    takeEvery(reportTypeConstants.DELETE_USER_REPORT, deleteUserReport),
    takeEvery(reportTypeConstants.DELETE_COMPANY_REPORT, deleteCompanyReport),
    takeEvery(reportTypeConstants.COPY_REPORT_ADD_TO_MINE, copyReportAddToMine),
    takeEvery(
      reportTypeConstants.AUTO_UPLOAD_COMPANY_REPORT_DRAFT,
      handleAutoUploadCompanyReportDraft,
    ),
    takeEvery(reportTypeConstants.DUPLICATE_DATA, duplicateData),
    takeEvery(reportTypeConstants.HANDLE_DATA_APPROVAL, handleDataApproval),
  ]);
}

const getLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (location: any) => {
        console.log(location);
        const locationStr = getIn(location, ['coords', 'longitude'])
          ? location.coords.longitude + ',' + location.coords.latitude
          : '';
        resolve(locationStr);
      },
      (error: any) => {
        reject(error);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  });
};

function* fetchBeforeInitReport(action: {
  type: string;
  authToken: string;
  templateData: ModelType & TemplateType;
  callback?: Function;
}) {
  const {authToken, templateData, callback} = action;

  let network: boolean = yield call(isNetworkConnected);
  if (network) {
    const data = {templateId: templateData.pKey};
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
      yield put(
        initReportImmediate({
          ...templateDetail,
          task: templateData.task || undefined,
          taskId: templateData.task ? templateData.task._id : undefined,
        }),
      );
      if (callback) {
        callback();
      }
    } else {
      Modal.alert('Fetch template failed !', rlt.error || '', [
        {text: 'OK', onPress: () => {}},
      ]);
    }
  } else {
    yield put(initReportImmediate(templateData));
    if (callback) {
      callback();
    }
  }
}

// 从服务端同步 user Report
function* fetchUserReportsFromService(action: {
  type: string;
  authToken: string;
  options?: {
    page: number;
    pageSize: number;
    templateId: string;
  };
  successCallback?: Function;
  failedCallback?: Function;
}) {
  const {authToken, options, successCallback, failedCallback} = action;
  let params: any = null;
  if (options) {
    params = {
      page: options.page || 1,
      pageSize: options.pageSize || 10,
      createdAtOrder: -1,
    };
    if (options.templateId) {
      params.templateId = options.templateId;
    }
  }
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getUserReport, params, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  let reportsFromService: any = [];
  if (rlt.result === 'Success') {
    reportsFromService = rlt.data.map((ReportItem: any) =>
      formatServiceReportToLocalMini(ReportItem),
    );
    if (successCallback) {
      successCallback(rlt.page);
    }
    yield put(getReportsFulfilled(reportsFromService));
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

// 从服务端同步 company Report
function* fetchCompanyReportsFromService(action: {
  type: string;
  authToken: string;
  options?: {
    page: number;
    pageSize: number;
    templateId: string;
  };
  successCallback?: Function;
  failedCallback?: Function;
}) {
  const {authToken, options, successCallback, failedCallback} = action;
  let params: any = null;
  if (options) {
    params = {
      page: options.page || 1,
      pageSize: options.pageSize || 10,
      createdAtOrder: -1,
    };
    if (options.templateId) {
      params.templateId = options.templateId;
    }
  }
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getCompanyReport, params, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  let reportsFromService: any = [];
  if (rlt.result === 'Success') {
    reportsFromService = rlt.data.map((ReportItem: any) =>
      formatServiceReportToLocalMini(ReportItem),
    );
    if (successCallback) {
      successCallback(rlt.page);
    }
    yield put(fetchCompanyReportsFulfilled(reportsFromService));
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

// 获取 report 详情
function* fetchReportInfoFromService(action: {
  type: string;
  authToken: string;
  reportId: string;
  callback?: Function;
}) {
  const {authToken, reportId, callback} = action;
  const data = {reportId};
  const toastKey = Toast.loading('Loading...', 0);
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getReportInfo, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    const reportDetail = formatServiceReportToLocal(rlt.data);
    yield put(previewReport(reportDetail));
    if (callback) {
      callback(reportDetail);
    }
  } else if (rlt.error) {
    Toast.fail(rlt.error, 2);
  }
}

// 审批
function* handleDataApproval(action: {
  type: string;
  authToken: string;
  reportId: string;
  result: 'next' | 'deny';
  callback?: Function;
}) {
  const {authToken, reportId, result, callback} = action;
  const data = {reportId, result};
  let rlt = yield call(() => {
    return requestApiV2(API_v2.dataApproval, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  if (rlt.result === 'Success') {
    yield put(fetchReportInfo(authToken, reportId, () => {}));
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Toast.fail(rlt.error, 2);
  }
}

function* duplicateData(action: {
  type: string;
  authToken: string;
  reportId: string;
  callback?: Function;
}) {
  const {authToken, reportId, callback} = action;
  const data = {reportId};
  let rlt = yield call(() => {
    return requestApiV2(API_v2.getReportInfo, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  if (rlt.result === 'Success') {
    let reportDetail = formatServiceReportToLocal(rlt.data);
    reportDetail = {
      ...reportDetail,
      pKey: UUID(),
      Name: reportDetail.Name.substr(0, 4) + new Date().getTime(),
      code: '',
      UploadStatus: 0,
      createdAt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      Sections: reportDetail.Sections.map((sItem: any) => ({
        ...sItem,
        _id: '',
        FieldData: sItem.FieldData.map((fDItem: any) => ({
          ...fDItem,
          _id: '',
          TableFieldDataList: fDItem.TableFieldDataList.map(
            (tbFDItem: any) => ({
              ...tbFDItem,
              _id: '',
            }),
          ),
        })),
      })),
    };
    yield put(previewReport(reportDetail));
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Toast.fail(rlt.error, 2);
  }
}

// 上传 User Report
function* uploadUserReport(action: {
  type: string;
  authToken: string;
  reportData: ModelType & ReportType;
  templateServiceId: string;
  customizeKey: string;
  callback?: Function;
}) {
  const {authToken, reportData, templateServiceId, customizeKey} = action;
  const toastKey = Toast.loading('Submitting...', 0);
  const api = reportData.UploadStatus
    ? API_v2.updateUserReport
    : API_v2.createUserReport;
  const locationStr = reportData.location
    ? reportData.location
    : yield call(getLocation);
  let data = formatLocalReportToService({
    ...reportData,
    location: locationStr,
  });
  // 检查是否有本地图片需要先上传
  const checkResultData = yield call(
    handleUploadDraftImages,
    {reports: [data]},
    authToken,
  );
  data = checkResultData.reports[0];
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
    if (reportData.UploadStatus) {
      Toast.success(toastTips.SuccessUpload, 1);
    } else {
      Toast.success(toastTips.SuccessCreate, 1);
      const userId = yield select(state => state.loginInfo.currentUserInfo._id);
      yield put(deleteUserReportDraft(userId, reportData.pKey));
    }
    yield put(fetchUserReports(authToken));
    if (action.callback) {
      action.callback();
    }
  } else if (rlt.error) {
    Modal.alert('Upload failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

// 上传 Company Report
function* uploadCompanyReport(action: {
  type: string;
  authToken: string;
  reportData: ModelType & ReportType;
  createOrUpdate: boolean;
  callback?: Function;
}) {
  const {authToken, reportData, createOrUpdate} = action;
  const toastKey = Toast.loading('Submitting...', 0);
  const api = createOrUpdate
    ? API_v2.createCompanyReport
    : API_v2.updateCompanyReport;
  const locationStr = reportData.location
    ? reportData.location
    : yield call(getLocation);
  let data = formatLocalReportToService({
    ...reportData,
    location: locationStr,
  });
  // 检查是否有本地图片需要先上传
  const checkResultData = yield call(
    handleUploadDraftImages,
    {reports: [data]},
    authToken,
  );
  data = checkResultData.reports[0];
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
    if (reportData.UploadStatus) {
      Toast.success(toastTips.SuccessUpload, 1);
    } else {
      Toast.success(toastTips.SuccessCreate, 1);
      const userId = yield select(state => state.loginInfo.currentUserInfo._id);
      yield put(deleteCompanyReportDraft(userId, reportData.pKey));
    }
    const params = {
      reportId:
        createOrUpdate && rlt.data && rlt.data._id
          ? rlt.data._id
          : !createOrUpdate && data.reportId
          ? data.reportId
          : null,
    };
    if (params.reportId) {
      let rlt2 = yield call(() => {
        return requestApiV2(API_v2.sendReportEmail, params, authToken)
          .then(res => {
            return res;
          })
          .catch(error => {
            console.error(error);
          });
      });
    }
    yield put(
      fetchCompanyReports(authToken, {
        page: 1,
        pageSize: 10,
      }),
    );
    if (action.callback) {
      action.callback();
    }
  } else if (rlt.error || rlt.result === 'Failed') {
    Modal.alert('Upload failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

// 提交通过二维码分享填写的Data
function* submitReportByShare(action: {
  type: string;
  authToken: string;
  reportData: ModelType & ReportType;
  callback?: Function;
}) {
  const {authToken, reportData} = action;
  const toastKey = Toast.loading('Submitting...', 0);
  let data = formatLocalReportToService(reportData);
  // 检查是否有本地图片需要先上传
  const checkResultData = yield call(
    handleUploadDraftImages,
    {reports: [data]},
    authToken,
  );
  data = checkResultData.reports[0];
  let rlt = yield call(() => {
    return requestApiV2(API_v2.createReportByShare, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    Toast.success(toastTips.SuccessCreate, 1);
    if (action.callback) {
      action.callback();
    }
  } else if (rlt.error || rlt.result === 'Failed') {
    Modal.alert('Upload failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

function* handleAutoUploadCompanyReportDraft(action: {
  type: string;
  authToken: string;
  reports: Array<ModelType & ReportType>;
  callback?: Function;
}) {
  const {authToken, reports, callback} = action;
  let data = {
    reports: reports.map((reportItem: ModelType & ReportType) =>
      formatLocalReportToService(reportItem),
    ),
  };
  // 检查是否有本地图片需要先上传
  data = yield call(handleUploadDraftImages, data, authToken);
  // 上传Data
  let rlt = yield call(() => {
    return requestApiV2(API_v2.createCompanyReport, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  if (rlt.data && Array.isArray(rlt.data.success)) {
    const uploadSuccessReportDraftpKeys = rlt.data.success.map(
      (reportItem: any) => reportItem.pKey,
    );
    const userId = yield select(state => state.loginInfo.currentUserInfo._id);
    yield put(
      deleteMultipleCompanyReportDraft(userId, uploadSuccessReportDraftpKeys),
    );
  }
  if (rlt.data && Array.isArray(rlt.data.fail) && rlt.data.fail.length) {
    let uploadErrorArray: Array<string> = [],
      errorReports: Array<any> = [];
    rlt.data.fail.forEach((item: any) => {
      const {pKey, error} = item;
      uploadErrorArray.push(error);
      errorReports.push({pKey, error});
    });
    Modal.alert('Auto upload draft failed !', uploadErrorArray.join('. '), [
      {text: 'OK', onPress: () => {}},
    ]);
    yield put(setErrorForAutoUploadDraft(errorReports));
  }
  if (rlt.result === 'Success') {
    if (action.callback) {
      action.callback();
    }
  } else if (rlt.error) {
    Modal.alert('Upload failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  } else if (rlt.result === 'Failed') {
    Modal.alert('Upload failed !', rlt.data, [{text: 'OK', onPress: () => {}}]);
  }
}

function* handleUploadDraftImages(data: any, authToken: string) {
  let picPathPrefix = 'file://',
    videoPathPrefix = 'file://',
    signPathPrefix = 'file://';
  if (Platform.OS === PlatFormAndroid) {
    videoPathPrefix = 'content://';
  }
  // 检查是否有未上传签名图片
  let draftSignatureMap: Array<any> = [],
    draftSignatureUrls: Array<string> = [];
  let draftPictureMap: Array<any> = [],
    draftPictureUrls: Array<string> = [];
  let draftVideoMap: Array<any> = [],
    draftVideoUrls: Array<string> = [];
  data.reports.forEach((reportItem: any) => {
    reportItem.sections.forEach((sectionItem: any) => {
      sectionItem.fieldData.forEach((fieldItem: any) => {
        // Signature
        if (
          fieldItem.type === 'Signature' &&
          fieldItem.fieldValue.indexOf(signPathPrefix) > -1
        ) {
          draftSignatureMap.push({
            reportPKey: reportItem.pKey,
            fieldKey: fieldItem.fieldKey,
            type: fieldItem.type,
            fieldValue: fieldItem.fieldValue,
          });
          draftSignatureUrls.push(fieldItem.fieldValue);
        }
        // Picture
        if (
          fieldItem.type === 'Picture' &&
          fieldItem.fieldValue.indexOf(picPathPrefix) > -1
        ) {
          let draftPicArray = fieldItem.fieldValue.split(',');
          draftPictureMap.push({
            reportPKey: reportItem.pKey,
            fieldKey: fieldItem.fieldKey,
            type: fieldItem.type,
            fieldValue: fieldItem.fieldValue,
            length: draftPicArray.length,
          });
          draftPictureUrls.push(...draftPicArray);
        }
        // Video
        if (
          fieldItem.type === 'Video' &&
          fieldItem.fieldValue.indexOf(videoPathPrefix) > -1
        ) {
          draftVideoMap.push({
            reportPKey: reportItem.pKey,
            fieldKey: fieldItem.fieldKey,
            type: fieldItem.type,
            fieldValue: fieldItem.fieldValue,
          });
          draftVideoUrls.push(fieldItem.fieldValue);
        }
      });
    });
  });
  // 上传附件
  if (
    draftSignatureUrls.length ||
    draftPictureUrls.length ||
    draftVideoUrls.length
  ) {
    let hasUploadImagesError = false;
    // Signature
    if (draftSignatureUrls.length) {
      let uploadSignatureRlt = yield call(
        uploadImage,
        API_v2.uploadFile,
        draftSignatureUrls,
        authToken,
      );
      if (
        uploadSignatureRlt.result === 'Success' &&
        Array.isArray(uploadSignatureRlt.data) &&
        uploadSignatureRlt.data.length === draftSignatureUrls.length
      ) {
        draftSignatureMap = draftSignatureMap.map(
          (item: any, index: number) => ({
            ...item,
            fieldValue: uploadSignatureRlt.data[index],
          }),
        );
      } else {
        hasUploadImagesError = true;
      }
    }
    // Picture
    if (draftPictureUrls.length) {
      let uploadPicRlt = yield call(
        uploadImage,
        API_v2.uploadFile,
        draftPictureUrls,
        authToken,
      );
      if (
        uploadPicRlt.result === 'Success' &&
        Array.isArray(uploadPicRlt.data) &&
        uploadPicRlt.data.length === draftPictureUrls.length
      ) {
        let resultUrls = [...uploadPicRlt.data];
        draftPictureMap = draftPictureMap.map((item: any, index: number) => ({
          ...item,
          fieldValue: resultUrls.splice(0, item.length).join(','),
        }));
      } else {
        hasUploadImagesError = true;
      }
    }
    // Video
    if (draftVideoUrls.length) {
      let uploadVideoRlt = yield call(
        uploadVideo,
        API_v2.uploadFile,
        draftVideoUrls,
        authToken,
      );
      if (
        uploadVideoRlt.result === 'Success' &&
        Array.isArray(uploadVideoRlt.data) &&
        uploadVideoRlt.data.length === draftVideoUrls.length
      ) {
        draftVideoMap = draftVideoMap.map((item: any, index: number) => ({
          ...item,
          fieldValue: uploadVideoRlt.data[index],
        }));
      } else {
        hasUploadImagesError = true;
      }
    }

    if (hasUploadImagesError) {
      Modal.alert('Upload images failed !', '' || '', [
        {text: 'OK', onPress: () => {}},
      ]);
    }
    // 将已上传的URL替换data中的本地路径
    const replaceFileUrlForFieldItem = (
      fieldDataMap: Array<any>,
      fieldItem: any,
      reportPKey: string,
    ) => {
      let tempField: any = null;
      fieldDataMap.forEach((item: any) => {
        if (
          reportPKey === item.reportPKey &&
          fieldItem.fieldKey === item.fieldKey
        ) {
          tempField = item;
        }
      });
      return {
        ...fieldItem,
        fieldValue: tempField.fieldValue,
      };
    };
    data.reports = data.reports.map((reportItem: any) => ({
      ...reportItem,
      sections: reportItem.sections.map((sectionItem: any) => ({
        ...sectionItem,
        fieldData: sectionItem.fieldData.map((fieldItem: any) => {
          if (
            fieldItem.type === 'Signature' &&
            fieldItem.fieldValue.indexOf(signPathPrefix) > -1
          ) {
            return replaceFileUrlForFieldItem(
              draftSignatureMap,
              fieldItem,
              reportItem.pKey,
            );
          } else if (
            fieldItem.type === 'Picture' &&
            fieldItem.fieldValue.indexOf(picPathPrefix) > -1
          ) {
            return replaceFileUrlForFieldItem(
              draftPictureMap,
              fieldItem,
              reportItem.pKey,
            );
          } else if (
            fieldItem.type === 'Video' &&
            fieldItem.fieldValue.indexOf(videoPathPrefix) > -1
          ) {
            return replaceFileUrlForFieldItem(
              draftVideoMap,
              fieldItem,
              reportItem.pKey,
            );
          } else {
            return fieldItem;
          }
        }),
      })),
    }));
  }
  return data;
}

// 删除已上传
function* deleteUserReport(action: {
  type: string;
  authToken: string;
  reportpKey: string;
}) {
  const toastKey = Toast.loading('Submitting...', 0);
  const data = {reportId: action.reportpKey};
  let rlt = yield call(() => {
    return requestApiV2(API_v2.deleteUserReport, data, action.authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    Toast.success('Successfully deleted', 1);
    yield put(deleteUserReportSuccess(action.reportpKey));
  } else if (rlt.error) {
    Modal.alert('Delete failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

// 删除公司报表
function* deleteCompanyReport(action: {
  type: string;
  authToken: string;
  reportpKey: string;
  callback?: Function;
  isWithdrawal?: boolean;
}) {
  const {authToken, reportpKey, callback, isWithdrawal} = action;
  const toastKey = Toast.loading('Submitting...', 0);
  const data = {reportId: reportpKey};
  let rlt = yield call(() => {
    return requestApiV2(API_v2.deleteCompanyReport, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    !isWithdrawal && Toast.success('Successfully deleted', 1);
    if (callback) {
      callback();
    }
    yield put(deleteCompanyReportSuccess(reportpKey));
  } else if (rlt.error) {
    Modal.alert('Delete failed !', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

// For Add Report from Dynamic
function* copyReportAddToMine(action: {
  type: string;
  authToken: string;
  option: {
    reportpKey: string;
  };
  callback?: Function;
}) {
  let {authToken, option, callback} = action;
  const toastKey = Toast.loading('Loading...', 0);
  const data = {reportId: option.reportpKey};
  let rlt = yield call(() => {
    return requestApiV2(API_v2.createUserReport, data, authToken)
      .then(res => {
        return res;
      })
      .catch(error => {
        console.error(error);
      });
  });
  Portal.remove(toastKey);
  if (rlt.result === 'Success') {
    yield put(fetchUserReports(authToken));
    if (callback) {
      callback();
    }
  } else if (rlt.error) {
    Modal.alert('Download report failed!', rlt.error, [
      {text: 'OK', onPress: () => {}},
    ]);
  }
}

const formatLocalReportToService = (localReport: ModelType & ReportType) => ({
  pKey: localReport.pKey,
  templateId: localReport.TemplatepKey || '',
  template: localReport.TemplatepKey || '',
  reportId: localReport.UploadStatus ? localReport.pKey : '',
  code: localReport.code || '',
  name: localReport.Name || '',
  remark: localReport.Remark || '',
  showCode: localReport.showCode || false,
  customizeKey: localReport.customizeKey || '',
  location: localReport.location || undefined,
  codeType: localReport.codeType || '',
  color: localReport.color || '',
  uploadStatus: UPLOAD_STATUS_TRUE,
  storageSize: localReport.storageSize || 0,
  hiddenFields: localReport.hiddenFields || [],
  taskId: localReport.taskId || undefined,
  sections: localReport.Sections.map((s: any) => ({
    _id: s._id || undefined,
    sectionKey: s.sectionKey,
    name: s.Name || '',
    order: s.Order || 0,
    remark: s.Remark || '',
    fieldData: s.FieldData.map((f: any) => ({
      _id: f._id || undefined,
      fieldKey: f.fieldKey,
      order: f.Order || 0,
      type: f.Type || '',
      fieldName: f.FieldName || '',
      fieldValue:
        f.Type === fieldTypes.LinkedField
          ? ''
          : f.FieldValue
          ? f.FieldValue
          : '',
      remark: f.Remark || '',
      property: {
        required: f.property.required || false,
        hidden: f.property.privacy || false,
        options: f.property.options || [],
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
        autoCompleteCreationTime: f.property.autoCompleteCreationTime || false,
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
        fileName: f.property.fileName || '',
      },
      tableFieldDataList: f.TableFieldDataList.map((tbF: any) => ({
        _id: tbF._id || undefined,
        hidden: tbF.property.privacy || false,
        tableFieldKey: tbF.tableFieldKey,
        order: tbF.Order || 0,
        type: tbF.Type || '',
        fieldName: tbF.FieldName || '',
        fieldValueList: tbF.FieldValueList || [],
        remark: tbF.Remark || '',
        property: {
          required: tbF.property.required || false,
          options: tbF.property.options || [],
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
      positionProperty: f.FieldPosition,
      tableProperty: f.FieldTableProperty,
    })),
  })),
});

// 服务端Report转换成本地字段的Report
export const formatServiceReportToLocalMini = (ReportObj: any) => {
  // 字段映射
  let localReport: ReportType & ModelType = {
    creatorStaffId: getIn(ReportObj, ['payload', 'creatorStaffId'], ''),
    departmentId: getIn(ReportObj, ['payload', 'departmentId'], ''),
    departmentName: ReportObj.departmentName || '',
    pKey: ReportObj._id || '',
    code: ReportObj.code || '',
    Name: ReportObj.name || '',
    TemplatepKey: getIn(ReportObj, ['template', '_id'], ''),
    templateName: getIn(ReportObj, ['template', 'name'], ''),
    isDefault: getIn(ReportObj, ['template', 'isDefault'], false),
    template: getIn(ReportObj, ['template'], {}),
    showCode: ReportObj.showCode || false,
    hiddenSection: ReportObj.hiddenSection || false,
    customizeKey: ReportObj.customizeKey || '',
    location: ReportObj.location || '',
    codeType: ReportObj.codeType || '',
    color: ReportObj.color || '',
    UploadStatus: ReportObj.uploadStatus || '',
    storageSize: ReportObj.storageSize || 0,
    Remark: ReportObj.remark || '',
    User_pKey_Creator: ReportObj.userIdCreator
      ? ReportObj.userIdCreator._id
        ? ReportObj.userIdCreator._id
        : ReportObj.userIdCreator
        ? ReportObj.userIdCreator
        : ''
      : '',
    User_pKey_Modifier: ReportObj.userIdModifier || '',
    anonymityType: ReportObj.anonymityType || '',
    hiddenFields: ReportObj.hiddenFields || [],
    task: ReportObj.task,
    approval: ReportObj.approval,
    CreatorName: getIn(ReportObj, ['userIdCreator', 'nickName'], ''),
    companyName: getIn(ReportObj, ['userIdCreator', 'company', 'name'], ''),
    companyId: getIn(ReportObj, ['userIdCreator', 'company', '_id'], ''),
    CreatorPic: getIn(ReportObj, ['userIdCreator', 'userPic'], ''),
    createdAt: moment(ReportObj.createdAt).format('YYYY-MM-DD HH:mm:ss') || '',
    updatedAt: moment(ReportObj.updatedAt).format('YYYY-MM-DD HH:mm:ss') || '',
    Sections: [],
  };

  return localReport;
};

// 服务端Report转换成本地字段的Report
export const formatServiceReportToLocal = (ReportObj: any) => {
  // 字段映射
  let localReport: ReportType & ModelType = {
    creatorStaffId: getIn(ReportObj, ['payload', 'creatorStaffId'], ''),
    departmentId: getIn(ReportObj, ['payload', 'departmentId'], ''),
    departmentName: ReportObj.departmentName || '',
    pKey: ReportObj._id || '',
    code: ReportObj.code || '',
    Name: ReportObj.name || '',
    TemplatepKey: getIn(ReportObj, ['template', '_id'], ''),
    templateName: getIn(ReportObj, ['template', 'name'], ''),
    isDefault: getIn(ReportObj, ['template', 'isDefault'], false),
    template: getIn(ReportObj, ['template'], {}),
    showCode: ReportObj.showCode || false,
    hiddenSection: ReportObj.hiddenSection || false,
    customizeKey: ReportObj.customizeKey || '',
    location: ReportObj.location || '',
    codeType: ReportObj.codeType || '',
    color: ReportObj.color || '',
    UploadStatus: ReportObj.uploadStatus || '',
    storageSize: ReportObj.storageSize || 0,
    Remark: ReportObj.remark || '',
    User_pKey_Creator: ReportObj.userIdCreator
      ? ReportObj.userIdCreator._id
        ? ReportObj.userIdCreator._id
        : ReportObj.userIdCreator
        ? ReportObj.userIdCreator
        : ''
      : '',
    User_pKey_Modifier: ReportObj.userIdModifier || '',
    anonymityType: ReportObj.anonymityType || '',
    hiddenFields: ReportObj.hiddenFields || [],
    task: ReportObj.task,
    approval: ReportObj.approval,
    CreatorName: getIn(ReportObj, ['userIdCreator', 'nickName'], ''),
    companyName: getIn(ReportObj, ['userIdCreator', 'company', 'name'], ''),
    companyId: getIn(ReportObj, ['userIdCreator', 'company', '_id'], ''),
    CreatorPic: getIn(ReportObj, ['userIdCreator', 'userPic'], ''),
    createdAt: moment(ReportObj.createdAt).format('YYYY-MM-DD HH:mm:ss') || '',
    updatedAt: moment(ReportObj.updatedAt).format('YYYY-MM-DD HH:mm:ss') || '',
    Sections: ReportObj.sections.map((s: any) => ({
      _id: s._id || '',
      sectionKey: s.sectionKey,
      Name: s.name || '',
      Order: s.order || 0,
      Remark: s.remark || '',
      Fields: [],
      FieldData: s.fieldData.map((f: any) => {
        return {
          _id: f._id || '',
          fieldKey: f.fieldKey,
          Order: f.order || 0,
          Type: f.type || '',
          FieldName: f.fieldName || '',
          FieldValue: f.fieldValue || '',
          Remark: f.remark || '',
          linkReportValue: f.linkReportValue || '',
          linkReportFieldObject: f.linkReportFieldObject || {},
          property: {
            required: f.property.required || false,
            privacy: f.property.hidden || false,
            options: Array.isArray(f.property.options)
              ? f.property.options
              : [],
            defaultValue: f.property.defaultValue || '',
            maximum: f.property.maximum || 0,
            minimum: f.property.minimum || 0,
            maxLength: f.property.maxLength || 0,
            minLength: f.property.minLength || 0,
            placeHolder: f.property.placeHolder || '',
            videoTime: f.property.videoTime || 0,
            autoCompleteFromStaffName:
              f.property.autoCompleteFromStaffName || false,
            autoCompleteFromStaffId:
              f.property.autoCompleteFromStaffId || false,
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
            fileName: f.property.fileName || '',
          },
          TableFieldDataList: f.tableFieldDataList.map((tbF: any) => ({
            _id: tbF._id || '',
            tableFieldKey: tbF.tableFieldKey,
            Order: tbF.order || 0,
            Type: tbF.type || '',
            FieldName: tbF.fieldName || '',
            FieldValueList:
              Array.isArray(tbF.fieldValueList) && tbF.fieldValueList.length > 0
                ? tbF.fieldValueList.map((item: string) => item || '')
                : [],
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
        };
      }),
    })),
  };

  return localReport;
};
