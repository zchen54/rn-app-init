import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  BackHandler,
  Keyboard,
  Image,
  Clipboard,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {Modal, Toast, Portal, NoticeBar, Icon} from '@ant-design/react-native';
import moment from 'moment';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {TitleBarNew, DActionSheet} from '../../common/components';
import {
  fieldTypes,
  tableFieldTypes,
  toastTips,
  customFormat,
  regTypeConstants,
} from '../../common/constants';
import {
  createUserReportDraft,
  updateUserReportDraft,
  createCompanyReportDraft,
  updateCompanyReportDraft,
  uploadUserReport,
  uploadCompanyReport,
  clearEditingReport,
  clearEditingTemplate,
  previewTemplate,
  fetchTemplateInfo,
  submitReportByShare,
  saveEditingReport,
} from '../../store/actions';
import {
  API_v2,
  requestApiV2,
  setSizeWithPx, // 设置字体 px 转 dp
  deviceWidth,
  toDecimal,
  getIn,
  regTools,
} from '../../common/utils';
import {serverURL} from '../../env';
import {DColors, DFontSize, FONT_FAMILY} from '../../common/styles';
import {styles} from '../template/style';
import {
  InputField,
  TimeField,
  DateField,
  DatetimeField,
  PictureField,
  CheckBoxField,
  VideoField,
  TableField,
  LocationField,
  PlaceInputField,
  SignatureField,
  TextAreaField,
  FullNameField,
  ScanField,
} from './components';
import {
  ReportType,
  TemplateType,
  ModelType,
  newReport,
} from '../../common/constants/ModeTypes';
import {isAdmin} from '../template/judgement';
import {formatValueTextForLinkReport} from './components/LinkedReportSelectScreen';
import {decimalJudgeFormatFun} from './components/common';

const DIcon = {
  more: require('../images/Index-Login/more-operation.png'),
  Save: require('../images/template/Save.png'),
  'Edit template': require('../images/template/Edit.png'),
  Share: require('../images/template/Share.png'),
  Delete: require('../images/template/Delete.png'),
  Preview: require('../images/template/Preview.png'),
  LinkIcon: require('../images/template/Link.png'),
};

const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  titleColor: DColors.title,
  modal_Title_Size: DFontSize.c1,
};

interface State {
  editingReportObj: ModelType & ReportType;
  linkReportMap: any;
  currentSectionOrder: number;
  isDateTimePickerVisible: boolean;
  initialSelectDateTime: string;
  modeOfDateTimePicker: 'date' | 'time' | 'datetime' | undefined;
  currentFieldOrder: number;
  controllerVisible: boolean;
  layoutY: layout[];
  isSubmitted: boolean;
  errorMsg: string;
  canSubmit: boolean;
}
interface Props {
  navigation: any;
  currentUserInfo: any;
  editingReport: ModelType & ReportType;
  dispatch: Function;
  templates: Array<ModelType & TemplateType>;
  organizationTemplates: Array<ModelType & TemplateType>;
  staffMap: any;
  departmentMap: any;
}

interface layout {
  pKey: string;
  y: number;
}
let isGoBackPopOpened = false;
let hasEdit = false;

const canIEditTemplate = (currentUserInfo: any) => {
  return isAdmin(currentUserInfo);
};

export class CollectDataScreen extends Component<Props, State> {
  _didFocusSubscription: any;
  _willBlurSubscription: any;
  myScrollView: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      controllerVisible: false,
      linkReportMap: {},
      editingReportObj: {...newReport},
      currentSectionOrder: 0,
      currentFieldOrder: 0,
      isDateTimePickerVisible: false,
      initialSelectDateTime: '',
      modeOfDateTimePicker: 'date',
      layoutY: [],
      isSubmitted: false,
      errorMsg: '',
      canSubmit: false,
    };
    // 页面路由聚焦时绑定监听安卓返回键
    this._didFocusSubscription = props.navigation.addListener(
      'didFocus',
      (payload: any) =>
        BackHandler.addEventListener(
          'hardwareBackPress',
          this.onBackButtonPressAndroid,
        ),
    );
  }

  componentDidMount() {
    this._willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      (payload: any) =>
        BackHandler.removeEventListener(
          'hardwareBackPress',
          this.onBackButtonPressAndroid,
        ),
    );
  }

  onBackButtonPressAndroid = () => {
    Keyboard.dismiss();
    this.closeControllerModal();
    if (!isGoBackPopOpened) {
      isGoBackPopOpened = true;
      if (hasEdit) {
        // 编辑过 退出前询问
        const templateSource = this.props.navigation.getParam('source');
        if (
          this.props.editingReport.UploadStatus ||
          templateSource === 'ByShareTemplate'
        ) {
          const {canSubmit} = this.state;
          let actions = [
            {
              text: 'Quit',
              onPress: () => {
                isGoBackPopOpened = false;
                this.handleClear();
                this.props.navigation.goBack();
              },
            },
            {
              text: 'Cancel',
              onPress: () => {
                isGoBackPopOpened = false;
                console.log('cancel');
              },
              style: 'cancel',
            },
          ];
          if (canSubmit) {
            actions.unshift({
              text: 'Submit',
              onPress: () => {
                isGoBackPopOpened = false;
                this.handleCreateConfirm('Submit', true);
              },
            });
          }
          Modal.alert(
            'Exit without submit ?',
            'Your changes will be permanently lost.',
            actions,
          );
        } else {
          Modal.alert(
            'Exit without saving ?',
            'Your changes will be permanently lost.',
            [
              {
                text: 'Save',
                onPress: () => {
                  isGoBackPopOpened = false;
                  this.handleCreateConfirm('Save', true);
                },
              },
              {
                text: 'Quit',
                onPress: () => {
                  isGoBackPopOpened = false;
                  this.handleClear();
                  this.props.navigation.goBack();
                },
              },
              {
                text: 'Cancel',
                onPress: () => {
                  isGoBackPopOpened = false;
                  console.log('cancel');
                },
                style: 'cancel',
              },
            ],
          );
        }
      } else {
        // 未曾编辑 直接退出
        isGoBackPopOpened = false;
        hasEdit = false;
        this.handleClear();
        this.props.navigation.goBack();
      }
    }
    return true;
  };

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
    isGoBackPopOpened = false;
    hasEdit = false;
  }

  componentWillMount() {
    isGoBackPopOpened = false;
    hasEdit = false;
    this.handleInitialState(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.handleInitialState(nextProps);
  }

  handleInitialState = (props: Props) => {
    // Create report init in reducer by INIT_REPORT
    // Edit report by PREVIEW_REPORT_BY_SELECT
    const {editingReport, currentUserInfo} = props;
    let staffName = currentUserInfo.staffName || '',
      staffId = currentUserInfo.staffNumber || '';

    if (editingReport && Array.isArray(editingReport.Sections)) {
      let editingReportObj = {
        ...editingReport,
        CreatorName: currentUserInfo.nickName,
        Sections: editingReport.Sections.map((sItem: any, sIndex: number) => {
          return {
            ...sItem,
            FieldData: sItem.FieldData.map((fItem: any) => {
              let FieldValue = fItem.FieldValue;
              if (fItem.property.autoCompleteFromStaffName) {
                FieldValue = staffName;
              } else if (fItem.property.autoCompleteFromStaffId) {
                FieldValue = staffId;
              }
              if (
                fItem.property.autoCompleteCreationTime &&
                !fItem.FieldValue
              ) {
                FieldValue = moment().toString();
              }
              return {
                ...fItem,
                FieldValue,
                TableFieldDataList: fItem.TableFieldDataList.map(
                  (tbFItem: any) => {
                    let FieldValueList = [...tbFItem.FieldValueList];
                    if (tbFItem.property.autoCompleteFromStaffName) {
                      FieldValueList = tbFItem.FieldValueList.map(
                        (item: string) => staffName,
                      );
                    } else if (tbFItem.property.autoCompleteFromStaffId) {
                      FieldValueList = tbFItem.FieldValueList.map(
                        (item: string) => staffId,
                      );
                    }
                    if (tbFItem.property.autoCompleteCreationTime) {
                      FieldValueList = tbFItem.FieldValueList.map(
                        (item: string) => (!item ? moment().toString() : item),
                      );
                    }
                    return {
                      ...tbFItem,
                      FieldValueList,
                    };
                  },
                ),
              };
            }),
          };
        }),
      };
      this.setState(
        {
          editingReportObj,
        },
        () => {
          this.handleCanSubmit();
        },
      );
    }
  };

  handleCanSubmit = () => {
    const {editingReportObj} = this.state;
    const {currentUserInfo} = this.props;
    let canSubmit: boolean = false;
    const taskState = getIn(editingReportObj, ['task', 'state']);
    const approvalState = getIn(editingReportObj, ['approval', 'state']);
    const {task, approval} = editingReportObj;
    const hasTask = task && Array.isArray(task.staffs) && task.staffs.length;
    const hasProcess =
      task && Array.isArray(task.process) && task.process.length;
    const hasApproval =
      approval && Array.isArray(approval.staffs) && approval.staffs.length;
    const currentProcessUserId = getIn(editingReportObj, [
      'task',
      'currentStaff',
      'user',
    ]);

    if (hasTask) {
      if (hasProcess) {
        // processing
        if (
          taskState === 1 &&
          currentProcessUserId &&
          currentProcessUserId === currentUserInfo._id
        ) {
          // task state: 0 cancel  1 processing  2 complete
          canSubmit = true;
        }
      } else {
        // new
        // TaskState: 0 stop  1 processing  2 new
        if (taskState === 1 || taskState === 2) {
          canSubmit = true;
        }
      }
    }
    if (hasApproval) {
      // ApprovalState: -1 cancel  0 pending  1 processing  2 passed
      if (approvalState === -1 || approvalState === 2) {
        canSubmit = false;
      }
    }
    if (!(hasTask || hasApproval)) {
      canSubmit = true;
    }
    this.setState({canSubmit});
  };

  handleClear = () => {
    setTimeout(() => {
      this.props.dispatch(clearEditingTemplate());
      if (this.props.navigation.getParam('from') !== 'previewPage') {
        this.props.dispatch(clearEditingReport());
      }
    }, 50);
  };

  // 获取timefield的位置
  _showDateTimePicker = (
    mode: 'date' | 'time' | 'datetime' | undefined,
    value: string,
    FieldOrder: number,
    SectionOrder: number,
  ) => {
    // console.log('_showDateTimePicker', mode, value, FieldOrder, SectionOrder);
    this.setState({
      isDateTimePickerVisible: true,
      modeOfDateTimePicker: mode,
      initialSelectDateTime: value,
      currentFieldOrder: FieldOrder,
      currentSectionOrder: SectionOrder,
    });
  };

  _hideDateTimePicker = () =>
    this.setState({
      isDateTimePickerVisible: false,
      modeOfDateTimePicker: 'date',
    });

  // 存入timefield的值
  _handleDatePicked = (date: any) => {
    const {
      currentFieldOrder,
      currentSectionOrder,
      modeOfDateTimePicker,
    } = this.state;
    let value = moment(date).format();
    this._hideDateTimePicker();
    this.onReportFieldChange(value, currentFieldOrder, currentSectionOrder);
  };

  // 存入照片路径
  _handleSelectImage = (uri: any, FieldOrder: number, SectionOrder: number) => {
    this.onReportFieldChange(uri, FieldOrder, SectionOrder);
  };

  // 存入签名路径
  _handleSignatureSave = (
    uri: any,
    FieldOrder: number,
    SectionOrder: number,
  ) => {
    this.onReportFieldChange(uri, FieldOrder, SectionOrder);
  };

  // 获取当前位置经纬度（有误差）
  getLocation = (FieldOrder: number, SectionOrder: number) => {
    Keyboard.dismiss();
    let toast = Toast.loading('Loading', 0, undefined, false);
    Geolocation.getCurrentPosition(
      (location: any) => {
        console.log(location);
        const value =
          location.coords.longitude + ',' + location.coords.latitude;
        this.onReportFieldChange(value, FieldOrder, SectionOrder);
        this.props.navigation.navigate('MapScreen', {
          FieldValue: value,
          onReportFieldChange: this.onReportFieldChange,
        });
        Portal.remove(toast);
      },
      (error: any) => {
        Portal.remove(toast);
        Modal.alert('fetch location error', error.message, [
          {
            text: 'Cancel',
            onPress: () => {
              console.log('cancel');
            },
          },
          {
            text: 'OK',
            onPress: () => {},
          },
        ]);
        console.log(error);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  // 修改data（report）标题
  onReportNameChange = (value: string) => {
    if (!hasEdit) {
      hasEdit = true;
    }
    this.setState(prevState => ({
      editingReportObj: {
        ...prevState.editingReportObj,
        Name: value,
      },
    }));
  };

  // field值修改函数
  onReportFieldChange = (
    value: string,
    FieldDataOrder: number,
    SectionOrder: number,
  ) => {
    if (!hasEdit) {
      hasEdit = true;
    }
    this.setState(prevState => ({
      editingReportObj: {
        ...prevState.editingReportObj,
        Sections: prevState.editingReportObj.Sections.map((sItem: any) =>
          sItem.Order === SectionOrder
            ? {
                ...sItem,
                FieldData: sItem.FieldData.map((fItem: any) =>
                  fItem.Order === FieldDataOrder
                    ? {
                        ...fItem,
                        FieldValue: value || '',
                      }
                    : fItem,
                ),
              }
            : sItem,
        ),
      },
    }));
  };

  // table中tablefield值 修改函数
  onReportTableFieldChange = (
    TableFieldDataList: any,
    FieldTableProperty: any,
    FieldDataOrder: number,
    SectionOrder: number,
  ) => {
    if (!hasEdit) {
      hasEdit = true;
    }
    this.setState(prevState => ({
      editingReportObj: {
        ...prevState.editingReportObj,
        Sections: prevState.editingReportObj.Sections.map((sItem: any) =>
          sItem.Order === SectionOrder
            ? {
                ...sItem,
                FieldData: sItem.FieldData.map((fItem: any) =>
                  fItem.Order === FieldDataOrder
                    ? {
                        ...fItem,
                        TableFieldDataList: TableFieldDataList,
                        FieldTableProperty: FieldTableProperty,
                      }
                    : fItem,
                ),
              }
            : sItem,
        ),
      },
    }));
  };

  handleSaveEditingReport = () => {
    const {editingReportObj} = this.state;
    this.props.dispatch(saveEditingReport({...editingReportObj}));
  };

  handleEditTemplate = () => {
    this.closeControllerModal();
    const {currentUserInfo} = this.props;
    const {editingReportObj} = this.state;
    this.props.dispatch(
      fetchTemplateInfo(
        currentUserInfo.authToken,
        editingReportObj.TemplatepKey,
        () => {
          this.props.navigation.navigate('CreateTemplate', {
            type: 'Edit',
          });
        },
      ),
    );
  };

  handleShareTemplate = () => {
    this.closeControllerModal();
    const {navigation, currentUserInfo} = this.props;
    const {editingReportObj} = this.state;
    this.props.dispatch(
      fetchTemplateInfo(
        currentUserInfo.authToken,
        editingReportObj.TemplatepKey,
        () => {
          navigation.navigate('CreateGroup', {
            title: 'Share',
            type: 'shareTemplate',
          });
        },
        'ShareTemplate',
      ),
    );
  };

  handleShareTemplateByLink = () => {
    this.closeControllerModal();
    const {currentUserInfo} = this.props,
      {authToken} = currentUserInfo;
    const {editingReportObj} = this.state;
    const baseUrl = serverURL.replace('/api/', '');

    const webUrl = `${baseUrl}/reportEdit/web_user/${
      editingReportObj.TemplatepKey
    }`;
    const handleSuccess = () => {
      Clipboard.setString(webUrl);
      this.setState(prevState => ({
        ...prevState,
        editingReportObj: {
          ...editingReportObj,
          isTemplateSharing: true,
        },
      }));
      Modal.alert(
        'The link has been copied to the clipboard',
        'You can fill in the data by accessing the links.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ],
      );
    };
    const handleFailed = () => {
      Modal.alert('Share template failed', 'Please try again later.', [
        {text: 'OK', onPress: () => {}},
      ]);
    };

    const toastKey = Toast.loading('Loading...', 0);
    requestApiV2(
      API_v2.shareTemplate,
      {
        templateId: editingReportObj.TemplatepKey,
        isSharing: true,
      },
      authToken,
    )
      .then(res => {
        Portal.remove(toastKey);
        if (res.result === 'Success') {
          handleSuccess();
        } else {
          handleFailed();
        }
      })
      .catch(error => {
        Portal.remove(toastKey);
        console.error(error);
      });
  };

  handleShareTemplateByQRCode = () => {
    this.closeControllerModal();
    const {currentUserInfo} = this.props,
      {authToken} = currentUserInfo;
    const {editingReportObj} = this.state;

    const handleSuccess = () => {
      this.setState(prevState => ({
        ...prevState,
        editingReportObj: {
          ...editingReportObj,
          isTemplateSharing: true,
        },
      }));
      this.props.navigation.navigate('ShareTemplateByQRCode', {
        templateId: editingReportObj.TemplatepKey,
        templateName: editingReportObj.templateName,
        templateColor: editingReportObj.color,
        companyName: editingReportObj.companyName,
        templateCreatedAt: editingReportObj.templateCreatedAt,
      });
    };
    const handleFailed = () => {
      Modal.alert('Share template failed', 'Please try again later.', [
        {text: 'OK', onPress: () => {}},
      ]);
    };

    const toastKey = Toast.loading('Loading...', 0);
    requestApiV2(
      API_v2.shareTemplate,
      {
        templateId: editingReportObj.TemplatepKey,
        isSharing: true,
      },
      authToken,
    )
      .then(res => {
        Portal.remove(toastKey);
        if (res.result === 'Success') {
          handleSuccess();
        } else {
          handleFailed();
        }
      })
      .catch(error => {
        Portal.remove(toastKey);
        console.error(error);
      });
  };

  handleStopSharingTemplate = () => {
    this.closeControllerModal();
    const {currentUserInfo} = this.props,
      {authToken} = currentUserInfo;
    const {editingReportObj} = this.state;

    const toastKey = Toast.loading('Loading...', 0);
    requestApiV2(
      API_v2.shareTemplate,
      {
        templateId: editingReportObj.TemplatepKey,
        isSharing: false,
      },
      authToken,
    )
      .then(res => {
        Portal.remove(toastKey);
        if (res.result === 'Success') {
          this.setState(prevState => ({
            ...prevState,
            editingReportObj: {
              ...editingReportObj,
              isTemplateSharing: false,
            },
          }));
          Modal.alert('Template sharing has been stopped', '', [
            {text: 'OK', onPress: () => {}},
          ]);
        }
      })
      .catch(error => {
        Portal.remove(toastKey);
        console.error(error);
      });
  };

  // 确认函数
  handleCreateConfirm = (confirmType: string, withoutConfirm?: boolean) => {
    Keyboard.dismiss();
    this.closeControllerModal();
    const {navigation, currentUserInfo} = this.props;
    const {editingReportObj} = this.state;
    // 点击过提交
    this.setState({
      isSubmitted: true,
    });

    let requiredChecked = true;
    let emailChecked = true;
    let invalidEmailFieldName: Array<string> = [];
    let emptyFieldpKey = '';
    let emptyFieldName: Array<string> = [];
    editingReportObj.Sections.forEach((sItem: any) => {
      sItem.FieldData.forEach((fItem: any) => {
        // console.log(Field, fItem);
        if (fItem.Type === fieldTypes.Table) {
          fItem.TableFieldDataList.forEach((tbFItem: any) => {
            if (
              fItem.property.required &&
              tbFItem.FieldValueList.indexOf('') !== -1
            ) {
              requiredChecked = false;
              emptyFieldName.push(tbFItem.FieldName);
              emptyFieldpKey =
                emptyFieldpKey === '' ? fItem.fieldKey : emptyFieldpKey;
            }
            if (tbFItem.Type === tableFieldTypes.Email) {
              tbFItem.FieldValueList.forEach((item: string) => {
                if (item && !regTools(item, regTypeConstants.EMAIL)) {
                  emailChecked = false;
                  invalidEmailFieldName.push(
                    fItem.FieldName + ' ' + tbFItem.FieldName,
                  );
                }
              });
            }
          });
        } else {
          if (fItem.Type === fieldTypes.Name && fItem.property.required) {
            let valueArr = fItem.FieldValue
              ? fItem.FieldValue.split(',')
              : [''];
            if (
              fItem.FieldValue === '' ||
              (Array.isArray(valueArr) &&
                valueArr.some((item: string) => !item))
            ) {
              requiredChecked = false;
              emptyFieldName.push(fItem.FieldName);
              emptyFieldpKey =
                emptyFieldpKey === '' ? fItem.fieldKey : emptyFieldpKey;
            }
          } else if (fItem.property.required && fItem.FieldValue === '') {
            requiredChecked = false;
            emptyFieldName.push(fItem.FieldName);
            emptyFieldpKey =
              emptyFieldpKey === '' ? fItem.fieldKey : emptyFieldpKey;
          }
          if (
            fItem.Type === fieldTypes.Email &&
            fItem.FieldValue &&
            !regTools(fItem.FieldValue, regTypeConstants.EMAIL)
          ) {
            emailChecked = false;
            invalidEmailFieldName.push(fItem.FieldName);
          }
        }
      });
    });

    const {task, approval} = editingReportObj;
    const hasTask = task && Array.isArray(task.staffs) && task.staffs.length;
    const lastTaskStaff =
      task && Array.isArray(task.staffs) && task.staffs[task.staffs.length - 1];

    if (
      !hasTask ||
      (hasTask && lastTaskStaff && lastTaskStaff === currentUserInfo.staffId)
    ) {
      // 滚动
      if (emptyFieldpKey !== '') {
        let item = this.state.layoutY.find(
          (item: layout) => item.pKey === emptyFieldpKey,
        );
        item
          ? this.myScrollView.scrollTo({x: 0, y: item.y, animated: true})
          : null;
      }
      // 验证必填
      if (!requiredChecked) {
        this.showErrorMsg(`${emptyFieldName.join(', ')} is required`);
        return;
      }
    }

    if (!emailChecked) {
      this.showErrorMsg(`Invalid value of ${invalidEmailFieldName.join(', ')}`);
      return;
    }

    const pageType = navigation.getParam('type'),
      modalTitle =
        pageType === 'Create'
          ? 'Create new Data ?'
          : pageType === 'Edit'
          ? 'Update Data ?'
          : '';

    const onPressOK = () => {
      setTimeout(() => {
        if (confirmType === 'Save') {
          this.handleSave(pageType);
        } else if (confirmType === 'Submit') {
          this.handleSubmit();
        }
      }, 500);
    };
    if (withoutConfirm) {
      onPressOK();
    } else {
      Modal.alert(modalTitle, '', [
        {
          text: 'Cancel',
          onPress: () => {
            console.log('cancel');
          },
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: onPressOK,
        },
      ]);
    }
  };

  // 分享
  handleShareReport = () => {
    const {navigation} = this.props;
    this.closeControllerModal();
    navigation.navigate('CreateGroup', {
      title: 'Share',
      type: 'shareReport',
    });
  };

  // 打开操作弹窗
  openControllerModal = () => {
    Keyboard.dismiss();
    this.setState({
      controllerVisible: true,
    });
  };

  // 关闭操作弹窗
  closeControllerModal = () => {
    this.setState({
      controllerVisible: false,
    });
  };

  // 保存至本地数据库
  handleSave = (pageType: string) => {
    const {navigation, currentUserInfo} = this.props;
    const {editingReportObj} = this.state;
    if (pageType === 'Create') {
      console.log('create');
      this.props.dispatch(
        createCompanyReportDraft(currentUserInfo._id, {
          ...editingReportObj,
          createdAt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        }),
      );
      navigation.navigate('Data', {tab: 1});
      this.handleClear();
    } else {
      console.log('update');
      this.props.dispatch(
        updateCompanyReportDraft(currentUserInfo._id, {
          ...editingReportObj,
          updatedAt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        }),
      );
      navigation.navigate('Data', {tab: 1});
      this.handleClear();
    }
  };

  // 上传至服务器（个人）
  handleSubmit = () => {
    const {navigation, currentUserInfo} = this.props;
    const {editingReportObj} = this.state;
    const templateSource = this.props.navigation.getParam('source');
    if (templateSource === 'ByShareTemplate') {
      this.props.dispatch(
        submitReportByShare(
          currentUserInfo.authToken,
          {...editingReportObj},
          () => {
            this.handleClear();
            navigation.navigate('Template');
          },
        ),
      );
    } else {
      this.props.dispatch(
        uploadCompanyReport(
          currentUserInfo.authToken,
          {...editingReportObj},
          editingReportObj.UploadStatus ? false : true,
          () => {
            this.handleClear();
            navigation.navigate('Data', {tab: 1});
          },
        ),
      );
    }
  };

  // 存入多选框的值
  onCheckBox = (valueArr: Array<string>) => {
    const {currentFieldOrder, currentSectionOrder} = this.state;
    let theValue = valueArr.join(',');
    this.onReportFieldChange(theValue, currentFieldOrder, currentSectionOrder);
  };

  // 存入单选框的值
  onRadioBox = (value: string) => {
    const {currentFieldOrder, currentSectionOrder} = this.state;
    this.onReportFieldChange(value, currentFieldOrder, currentSectionOrder);
  };

  onDepartmentOrStaffSelect = (value: string) => {
    const {currentFieldOrder, currentSectionOrder} = this.state;
    // console.log(currentFieldOrder, currentSectionOrder);
    this.onReportFieldChange(value, currentFieldOrder, currentSectionOrder);
  };

  handleLinkedReportChange = (linkReportKey: string, reportMap: any = {}) => {
    // console.log("handleLinkedReportChange", reportMap);
    this.setState(prevState => ({
      ...prevState,
      linkReportMap: {
        ...prevState.linkReportMap,
        ...reportMap,
      },
      editingReportObj: {
        ...prevState.editingReportObj,
        Sections: prevState.editingReportObj.Sections.map((sItem: any) => ({
          ...sItem,
          FieldData: sItem.FieldData.map((fItem: any) => {
            if (
              fItem.Type === fieldTypes.LinkedReport &&
              fItem.fieldKey === linkReportKey &&
              fItem.property &&
              fItem.property.fieldId
            ) {
              // 关联表单
              return {
                ...fItem,
                FieldValue: reportMap._id,
              };
            } else if (
              fItem.Type === fieldTypes.LinkedField &&
              fItem.property &&
              fItem.property.fieldId &&
              fItem.property.linkedReportId === linkReportKey
            ) {
              // 关联属性
              return {
                ...fItem,
                FieldValue: reportMap[fItem.property.fieldId],
              };
            } else {
              return fItem;
            }
          }),
        })),
      },
    }));
  };

  showErrorMsg = (errorMsg: string) => {
    if (errorMsg) {
      this.setState({errorMsg});
      setTimeout(() => {
        this.hideErrorMsg();
      }, 15000);
    }
  };
  hideErrorMsg = () => {
    this.setState({errorMsg: ''});
  };

  render() {
    const {navigation, currentUserInfo} = this.props;
    const {
      linkReportMap,
      editingReportObj,
      modeOfDateTimePicker,
      isDateTimePickerVisible,
      initialSelectDateTime,
      errorMsg,
      canSubmit,
    } = this.state;
    const templateSource = navigation.getParam('source');
    // console.log('render===',  editingReportObj);

    const hasMoreAction =
      editingReportObj.task ||
      editingReportObj.taskId ||
      editingReportObj.approval
        ? false
        : true;

    const renderPageFooter = canSubmit ? (
      <TouchableOpacity
        style={styles.btnSubmit}
        onPress={() => {
          this.handleCreateConfirm('Submit');
        }}>
        <Text style={{fontSize: 16, color: '#fff'}}>Submit</Text>
      </TouchableOpacity>
    ) : null;

    // 渲染Section
    const renderSections = (section: any) => {
      return (
        <Fragment key={section.Order}>
          {!editingReportObj.hiddenSection ? (
            <View
              style={{
                width: setSizeWithPx(982),
                borderLeftWidth: 4,
                borderLeftColor: '#20a0ff',
                paddingLeft: 10,
                marginBottom: 32,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: Page.titleColor,
                }}>
                {section.Name}
              </Text>
            </View>
          ) : null}
          <Fragment>
            {section.FieldData.map((field: any) =>
              renderField(field, section.Order),
            )}
          </Fragment>
        </Fragment>
      );
    };

    // 渲染field
    const renderField = (field: any, SectionOrder: number) => {
      let FieldContent = <View />;
      // 判断是否显示红色警示框
      const {isSubmitted} = this.state;
      const {departmentMap, staffMap} = this.props;

      // console.log('render field ', field);
      let isWarn =
        isSubmitted &&
        field.property.required &&
        (field.FieldValue === '' ||
          (field.FieldValue &&
            Array.isArray(field.FieldValue.split(',')) &&
            field.FieldValue.split(',').some((item: string) => !item)));

      const {task, approval} = editingReportObj;
      const hasTask = task && Array.isArray(task.staffs) && task.staffs.length;
      const lastTaskStaff =
        task &&
        Array.isArray(task.staffs) &&
        task.staffs[task.staffs.length - 1];
      if (
        hasTask &&
        lastTaskStaff &&
        lastTaskStaff !== currentUserInfo.staffId
      ) {
        isWarn = false;
      }

      if (field.Type === fieldTypes.Text) {
        FieldContent = (
          <InputField
            isWarn={isWarn}
            FieldType={field.Type}
            FieldValue={field.FieldValue}
            placeholder={field.Remark || ''}
            maxLength={field.property.maxLength || undefined}
            handleChangeText={(text: string) => {
              this.onReportFieldChange(text, field.Order, SectionOrder);
            }}
          />
        );
      } else if (field.Type === fieldTypes.TextArea) {
        FieldContent = (
          <TextAreaField
            isWarn={isWarn}
            FieldType={field.Type}
            FieldValue={field.FieldValue}
            placeholder={field.Remark || ''}
            handleChangeText={(text: string) => {
              this.onReportFieldChange(text, field.Order, SectionOrder);
            }}
          />
        );
      } else if (
        field.Type === fieldTypes.ScanBarCode ||
        field.Type === fieldTypes.ScanQRCode
      ) {
        FieldContent = (
          <ScanField
            isWarn={isWarn}
            FieldType={field.Type}
            FieldValue={field.FieldValue}
            placeholder={field.Remark || ''}
            handleChangeText={(text: string) => {
              this.onReportFieldChange(text, field.Order, SectionOrder);
            }}
          />
        );
      } else if (field.Type === fieldTypes.Name) {
        FieldContent = (
          <FullNameField
            isWarn={isWarn}
            FieldType={field.Type}
            FieldValue={field.FieldValue}
            handleChangeText={(text: string) => {
              this.onReportFieldChange(text, field.Order, SectionOrder);
            }}
          />
        );
      } else if (field.Type === fieldTypes.Email) {
        FieldContent = (
          <InputField
            isWarn={isWarn}
            FieldType={field.Type}
            FieldValue={field.FieldValue}
            placeholder={field.Remark || ''}
            maxLength={field.property.maxLength || undefined}
            handleChangeText={(text: string) => {
              this.onReportFieldChange(text, field.Order, SectionOrder);
            }}
            handleBlur={() => {
              if (
                field.FieldValue &&
                !regTools(field.FieldValue, regTypeConstants.EMAIL)
              ) {
                this.showErrorMsg(`Invalid value of ${field.FieldName}`);
              }
            }}
          />
        );
      } else if (field.Type === fieldTypes.Number) {
        const decimalPlaces = field.property.decimalPlaces || 0,
          maxLength = field.property.maxLength || 20;
        FieldContent = (
          <InputField
            isWarn={isWarn}
            FieldType={field.Type}
            FieldValue={field.FieldValue}
            placeholder={field.Remark || ''}
            maxLength={maxLength}
            // placeholder={
            //   decimalPlaces === 1
            //     ? decimalPlaces + " decimal place"
            //     : decimalPlaces === 2
            //     ? decimalPlaces + " decimal places"
            //     : "Only number"
            // }
            decimalPlaces={decimalPlaces}
            handleChangeText={(text: string) => {
              let newText =
                decimalPlaces && maxLength
                  ? decimalJudgeFormatFun(text, maxLength, decimalPlaces)
                  : text;
              this.onReportFieldChange(newText, field.Order, SectionOrder);
            }}
            handleBlur={() => {
              let newText =
                toDecimal(field.FieldValue, decimalPlaces || 0) || '';
              this.onReportFieldChange(newText, field.Order, SectionOrder);
            }}
          />
        );
      } else if (field.Type === fieldTypes.Money) {
        const decimalPlaces = field.property.decimalPlaces || 0,
          maxLength = field.property.maxLength || 20;
        FieldContent = (
          <InputField
            isWarn={isWarn}
            FieldType={field.Type}
            FieldValue={field.FieldValue}
            placeholder={field.Remark || ''}
            maxLength={maxLength}
            decimalPlaces={decimalPlaces}
            property={field.property}
            handleChangeText={(text: string) => {
              let newText =
                decimalPlaces && maxLength
                  ? decimalJudgeFormatFun(text, maxLength, decimalPlaces, true)
                  : text;
              this.onReportFieldChange(newText, field.Order, SectionOrder);
            }}
            handleBlur={() => {
              let newText =
                toDecimal(field.FieldValue, decimalPlaces || 0) || '';
              this.onReportFieldChange(newText, field.Order, SectionOrder);
            }}
          />
        );
      } else if (
        field.Type === fieldTypes.Radio ||
        field.Type === fieldTypes.RadioButton
      ) {
        FieldContent = (
          <CheckBoxField
            isWarn={isWarn}
            placeholder={field.Remark}
            FieldValue={field.FieldValue}
            handlePress={() => {
              this.setState({
                currentFieldOrder: field.Order,
                currentSectionOrder: SectionOrder,
              });
              navigation.navigate('RadioField', {
                field,
                onRadioBox: this.onRadioBox,
                options: field.property.customOption
                  ? [...field.property.options, '']
                  : [...field.property.options],
              });
            }}
          />
        );
      } else if (field.Type === fieldTypes.Staff) {
        FieldContent = (
          <CheckBoxField
            isWarn={isWarn}
            FieldValue={
              getIn(staffMap, [field.FieldValue, 'staffName']) ||
              field.FieldValue
            }
            handlePress={() => {
              this.setState({
                currentFieldOrder: field.Order,
                currentSectionOrder: SectionOrder,
              });
              this.handleSaveEditingReport();
              navigation.navigate('StaffSelect', {
                field,
                onSelect: this.onDepartmentOrStaffSelect,
              });
            }}
          />
        );
      } else if (field.Type === fieldTypes.Department) {
        FieldContent = (
          <CheckBoxField
            isWarn={isWarn}
            FieldValue={
              getIn(departmentMap, [field.FieldValue, 'name']) ||
              field.FieldValue
            }
            handlePress={() => {
              this.setState({
                currentFieldOrder: field.Order,
                currentSectionOrder: SectionOrder,
              });
              this.handleSaveEditingReport();
              navigation.navigate('DepartmentSelect', {
                field,
                onSelect: this.onDepartmentOrStaffSelect,
              });
            }}
          />
        );
      } else if (field.Type === fieldTypes.LinkedReport) {
        let linkFieldType = getIn(field, ['linkReportValue', 'type'], '');
        let linkFieldValue = getIn(field, ['linkReportValue', 'value'], '');
        FieldContent = (
          <CheckBoxField
            isWarn={isWarn}
            placeholder={field.Remark}
            FieldValue={
              field.FieldValue &&
              field.property.fieldId &&
              linkReportMap[field.property.fieldId]
                ? formatValueTextForLinkReport(
                    getIn(linkReportMap, [field.property.fieldId, 'value'], ''),
                    getIn(linkReportMap, [field.property.fieldId, 'type'], ''),
                    '--',
                    staffMap,
                    departmentMap,
                  )
                : field.linkReportValue &&
                  (linkFieldType === fieldTypes.Datetime ||
                    linkFieldType === fieldTypes.Date ||
                    linkFieldType === fieldTypes.TimeStamp)
                ? formatValueTextForLinkReport(
                    linkFieldValue,
                    linkFieldType,
                    '--',
                    staffMap,
                    departmentMap,
                  )
                : linkFieldValue
            }
            handlePress={() => {
              this.setState({
                currentFieldOrder: field.Order,
                currentSectionOrder: SectionOrder,
              });
              navigation.navigate('LinkedReportSelect', {
                fieldName: field.FieldName,
                linkReportKey: field.fieldKey,
                templateId: field.property.templateId,
                fieldId: field.property.fieldId,
                onChange: this.handleLinkedReportChange,
                value: field.FieldValue,
              });
            }}
          />
        );
      } else if (field.Type === fieldTypes.LinkedField) {
        let linkFieldType = getIn(field, ['FieldValue', 'type'], '');
        let linkFieldValue = getIn(field, ['FieldValue', 'value'], '');
        if (linkFieldType === fieldTypes.Department) {
          linkFieldValue =
            getIn(field, ['FieldValue', 'departmentName'], '') ||
            getIn(field, ['FieldValue', 'value'], '');
        } else if (linkFieldType === fieldTypes.Staff) {
          linkFieldValue =
            getIn(field, ['FieldValue', 'staffName'], '') ||
            getIn(field, ['FieldValue', 'value'], '');
        } else {
          linkFieldValue = formatValueTextForLinkReport(
            linkFieldValue,
            linkFieldType,
            '',
            staffMap,
            departmentMap,
          );
        }
        let linkReportFieldName = '';
        editingReportObj.Sections.forEach((sItem: any) => {
          sItem.FieldData.forEach((fItem: any) => {
            if (
              fItem.Type === fieldTypes.LinkedReport &&
              fItem.fieldKey ===
                getIn(field, ['property', 'linkedReportId'], '')
            ) {
              linkReportFieldName = fItem.FieldName;
            }
          });
        });
        FieldContent = (
          <View style={styles.linkFieldWrap}>
            <InputField
              isWarn={isWarn}
              FieldType={field.Type}
              FieldValue={linkFieldValue}
              placeholder={field.Remark || ''}
              // maxLength={field.property.maxLength || 50}
              handleChangeText={(text: string) => {
                this.onReportFieldChange(text, field.Order, SectionOrder);
              }}
            />
            <View style={styles.fieldLink}>
              <Image
                style={{width: 12, height: 12, marginRight: 8}}
                source={DIcon.LinkIcon}
              />
              <Text numberOfLines={1} style={styles.fieldLinkText}>
                {linkReportFieldName}
              </Text>
            </View>
          </View>
        );
      } else if (field.Type === fieldTypes.Datetime) {
        FieldContent = (
          <DatetimeField
            isWarn={isWarn}
            FieldValue={
              field.FieldValue
                ? moment(field.FieldValue).format(customFormat.DATETIME)
                : ''
            }
            placeholder={field.Remark}
            autocomplete={field.property.autoCompleteCreationTime}
            handlePress={() => {
              if (!field.property.autoCompleteCreationTime) {
                this._showDateTimePicker(
                  'datetime',
                  field.FieldValue,
                  field.Order,
                  SectionOrder,
                );
              }
            }}
          />
        );
      } else if (field.Type === fieldTypes.Date) {
        FieldContent = (
          <DateField
            isWarn={isWarn}
            FieldValue={
              field.FieldValue
                ? moment(field.FieldValue).format(customFormat.DATE)
                : ''
            }
            placeholder={field.Remark}
            autocomplete={field.property.autoCompleteCreationTime}
            handlePress={() => {
              if (!field.property.autoCompleteCreationTime) {
                this._showDateTimePicker(
                  'date',
                  field.FieldValue,
                  field.Order,
                  SectionOrder,
                );
              }
            }}
          />
        );
      } else if (field.Type === fieldTypes.TimeStamp) {
        FieldContent = (
          <TimeField
            isWarn={isWarn}
            FieldValue={
              field.FieldValue
                ? moment(field.FieldValue).format(customFormat.TIME)
                : ''
            }
            placeholder={field.Remark}
            autocomplete={field.property.autoCompleteCreationTime}
            handlePress={() => {
              if (!field.property.autoCompleteCreationTime) {
                this._showDateTimePicker(
                  'time',
                  field.FieldValue,
                  field.Order,
                  SectionOrder,
                );
              }
            }}
          />
        );
      } else if (field.Type === fieldTypes.Picture) {
        FieldContent = (
          <PictureField
            maxFiles={field.property.pictureNumber}
            FieldValue={field.FieldValue}
            handleImageSelect={(uri: string) => {
              this._handleSelectImage(uri, field.Order, SectionOrder);
            }}
            authToken={currentUserInfo.authToken}
          />
        );
      } else if (field.Type === fieldTypes.Video) {
        FieldContent = (
          <VideoField
            maxFiles={field.property.videoNumber}
            FieldValue={field.FieldValue}
            durationLimit={field.property.videoTime}
            handleVideoSelect={(uri: string) => {
              this._handleSelectImage(uri, field.Order, SectionOrder);
            }}
            authToken={currentUserInfo.authToken}
          />
        );
      } else if (field.Type === fieldTypes.Signature) {
        FieldContent = (
          <SignatureField
            FieldValue={field.FieldValue}
            handleSignatureSave={(uri: string) => {
              this._handleSignatureSave(uri, field.Order, SectionOrder);
            }}
            authToken={currentUserInfo.authToken}
          />
        );
      } else if (field.Type === fieldTypes.CheckBox) {
        FieldContent = (
          <CheckBoxField
            isCheckbox={true}
            isWarn={isWarn}
            placeholder={field.Remark}
            FieldValue={field.FieldValue}
            handlePress={() => {
              this.setState({
                currentFieldOrder: field.Order,
                currentSectionOrder: SectionOrder,
              });
              navigation.navigate('CheckField', {
                field,
                onCheckBox: this.onCheckBox,
                options: field.property.options,
              });
            }}
          />
        );
      } else if (field.Type === fieldTypes.Location) {
        // FieldContent = (
        //   <LocationField
        //     isWarn={isWarn}
        //     navigation={navigation}
        //     FieldValue={field.FieldValue}
        //     getLocation={() => this.getLocation(field.Order, SectionOrder)}
        //     onReportFieldChange={(value: string) =>
        //       this.onReportFieldChange(value, field.Order, SectionOrder)
        //     }
        //   />
        // );

        FieldContent = (
          <PlaceInputField
            isWarn={isWarn}
            FieldValue={field.FieldValue}
            onReportFieldChange={(value: string) => {
              console.log('on place change', value);
              this.onReportFieldChange(value, field.Order, SectionOrder);
            }}
            reportId={editingReportObj.pKey}
            navigation={navigation}
          />
        );
      } else if (field.Type === fieldTypes.File) {
        FieldContent =
          getIn(field, ['FieldValue']) &&
          getIn(field, ['property', 'fileName']) ? (
            <TouchableOpacity
              onPress={() => {
                Modal.alert('Please go to the web side to download file', '', [
                  {text: 'OK', onPress: () => {}},
                ]);
              }}
              style={styles.formItemWrap}>
              <Text style={{...styles.formInput, color: DColors.mainColor}}>
                {getIn(field, ['property', 'fileName'])}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formItemWrap}>
              <Text
                style={{...styles.formInput, color: DColors.auxiliaryOrange}}>
                Please go to the web side to upload file
              </Text>
            </View>
          );
      } else if (field.Type === fieldTypes.Table) {
        FieldContent = (
          <TableField
            currentUserInfo={this.props.currentUserInfo}
            navigation={navigation}
            FieldName={field.FieldName}
            TableFieldDataList={field.TableFieldDataList}
            FieldTableProperty={field.FieldTableProperty}
            saveEditingReport={this.handleSaveEditingReport}
            onReportTableFieldChange={(
              TableFieldDataList: any,
              FieldTableProperty: any,
            ) =>
              this.onReportTableFieldChange(
                TableFieldDataList,
                FieldTableProperty,
                field.Order,
                SectionOrder,
              )
            }
            staffMap={staffMap}
            departmentMap={departmentMap}
          />
        );
      }
      return (
        <View
          key={field.Order}
          style={{
            width: deviceWidth - 34,
          }}
          onLayout={event => {
            if (field.property.required) {
              const y = event.nativeEvent.layout.y;
              this.setState(prevState => ({
                layoutY: [...prevState.layoutY, {pKey: field.fieldKey, y}],
              }));
            }
          }}>
          <Text
            style={{
              fontFamily: Page.font_family,
              fontSize: 16,
              color: '#2E2E2E',
            }}>
            {field.FieldName}
            {field.property.required ? (
              <Text style={{color: '#ed2f31'}}> *</Text>
            ) : null}
            {field.Type === fieldTypes.Video && field.property.videoTime ? (
              <Text style={{color: '#757575', fontSize: 14}}>
                {'   (Duration limit ' + field.property.videoTime + 's)'}
              </Text>
            ) : null}
          </Text>
          {FieldContent}
        </View>
      );
    };

    let showCode: boolean = editingReportObj.showCode;

    let titleBarRight: any = {};
    if (!hasMoreAction) {
    } else if (templateSource === 'ByShareTemplate') {
      // 通过二维码分享填写报表
    } else if (editingReportObj.UploadStatus) {
      if (canIEditTemplate(currentUserInfo) || !hasEdit) {
        titleBarRight = {
          button: DIcon.more,
          function: this.openControllerModal,
        };
      }
    } else {
      if (canIEditTemplate(currentUserInfo)) {
        titleBarRight = {
          button: DIcon.more,
          function: this.openControllerModal,
        };
      } else {
        titleBarRight = {
          button: 'Save',
          function: () => {
            this.handleCreateConfirm('Save', true);
          },
        };
      }
    }

    // console.log(
    //   'render editingReportObj',
    //   editingReportObj.Sections[0].FieldData,
    // );

    return (
      <View style={styles.container}>
        <TitleBarNew
          title={
            navigation.getParam('type') === 'Create'
              ? 'Collect Data'
              : 'Edit Data'
          }
          right={
            typeof titleBarRight.button === 'string'
              ? titleBarRight.button
              : null
          }
          rightImage={
            typeof titleBarRight.button === 'string'
              ? null
              : titleBarRight.button
          }
          navigation={navigation}
          pressLeft={this.onBackButtonPressAndroid}
          pressRight={titleBarRight.function}
          // errorMsg={errorMsg}
        />
        {Array.isArray(editingReportObj.Sections) ? (
          <View style={{flex: 1}}>
            {errorMsg ? (
              <View style={styles.noticeBarWrap}>
                <NoticeBar
                  mode="closable"
                  icon={<Icon name="exclamation-circle" color="#f5222d" />}
                  onPress={this.hideErrorMsg}
                  marqueeProps={{
                    loop: true,
                    leading: 2000,
                    trailing: 2000,
                    fps: 40,
                    style: {},
                  }}>
                  {errorMsg}
                </NoticeBar>
              </View>
            ) : null}
            <View style={{marginBottom: 20}}>
              {/* <View style={styles.titleBar}>
                <TextInput
                  value={editingReportObj.Name}
                  placeholder="Data Name"
                  numberOfLines={1}
                  style={styles.templateTitle}
                  onChangeText={this.onReportNameChange}
                />
              </View> */}
              <View style={styles.dataTemplateTitle}>
                <Text style={{...styles.templateTitle, textAlign: 'center'}}>
                  {editingReportObj.templateName}
                </Text>
              </View>
              <View style={{...styles.reportNameWrap, height: 20}}>
                <Text style={{fontSize: 14, color: '#484848'}}>
                  {editingReportObj.Name ? 'ID: ' + editingReportObj.Name : ''}
                </Text>
              </View>
              {showCode && editingReportObj.code ? (
                <View style={{marginHorizontal: 17}}>
                  <Text style={{fontSize: 14, color: '#484848'}}>
                    {editingReportObj.codeType + ' No.' + editingReportObj.code}
                  </Text>
                </View>
              ) : null}
            </View>
            <ScrollView
              style={{flex: 1}}
              ref={ref => (this.myScrollView = ref)}>
              <View style={{flex: 1, alignItems: 'center'}}>
                {editingReportObj.Sections.map((section: any) =>
                  renderSections(section),
                )}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View />
        )}

        {editingReportObj.Name ? renderPageFooter : null}
        <DateTimePicker
          mode={modeOfDateTimePicker}
          headerTextIOS={'Pick a ' + modeOfDateTimePicker}
          isVisible={isDateTimePickerVisible}
          date={
            initialSelectDateTime
              ? moment(initialSelectDateTime).toDate()
              : moment().toDate()
          }
          onConfirm={(date: any) => {
            this._handleDatePicked(date);
          }}
          onCancel={this._hideDateTimePicker}
        />
        {this.renderControllerModal()}
      </View>
    );
  }

  renderControllerModal = () => {
    const {navigation, currentUserInfo} = this.props;
    const {editingReportObj, controllerVisible} = this.state;
    let controllers: any = [];
    if (!editingReportObj.UploadStatus) {
      controllers.push({
        text: 'Save Data',
        onPress: () => {
          this.handleCreateConfirm('Save', true);
        },
      });
    }
    if (editingReportObj.UploadStatus && !hasEdit) {
      controllers.push({
        text: 'Share Data',
        onPress: () => {
          this.handleShareReport();
        },
      });
    }
    if (canIEditTemplate(currentUserInfo) && !editingReportObj.isDefault) {
      controllers.push({
        text: 'Edit Template',
        onPress: () => {
          this.handleEditTemplate();
        },
      });
      controllers.push({
        text: 'Share Template',
        onPress: () => {
          this.handleShareTemplate();
        },
      });
      controllers.push({
        text: 'Share via URL web link',
        onPress: () => {
          this.handleShareTemplateByLink();
        },
      });
      controllers.push({
        text: 'Share via QR code',
        onPress: () => {
          this.handleShareTemplateByQRCode();
        },
      });
      if (editingReportObj.isTemplateSharing) {
        controllers.push({
          text: 'Stop Sharing Template',
          color: DColors.auxiliaryRed,
          onPress: () => {
            this.handleStopSharingTemplate();
          },
        });
      }
    }

    return (
      <DActionSheet
        visible={controllerVisible}
        onClose={this.closeControllerModal}
        actions={controllers}
      />
    );
  };
}

const mapStateToProps = (state: any) => {
  return {
    editingReport: state.report.editingReport,
    currentUserInfo: state.loginInfo.currentUserInfo,
    templates: state.template.templates,
    organizationTemplates: state.template.companyTemplates,
    staffMap: state.company.staffMap,
    departmentMap: state.company.departmentMap,
  };
};

export default connect(mapStateToProps)(CollectDataScreen);
