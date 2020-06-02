import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  BackHandler,
} from 'react-native';
import {Toast, Modal, Icon} from '@ant-design/react-native';
import moment from 'moment';
import {
  TitleBarNew,
  DMoviePlayer,
  DImagePreview,
  signatureHeight,
  DActionSheet,
} from '../../common/components';
import {
  fieldTypes,
  toastTips,
  customFormat,
  tableFieldTypes,
} from '../../common/constants';
import {
  getIn,
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
} from '../../common/utils';
import {
  ReportType,
  TemplateType,
  ModelType,
} from '../../common/constants/ModeTypes';
import {
  deleteUserReport,
  deleteCompanyReport,
  deleteUserReportDraft,
  deleteCompanyReportDraft,
  clearEditingReport,
  handleDataApproval,
} from '../../store/actions';
import {DColors, DFontSize, FONT_FAMILY} from '../../common/styles';
import {canDeleteDataFromOrg, isAdmin} from '../template/judgement';
import {formatValueTextForLinkReport} from './components/LinkedReportSelectScreen';

const LocationIcon = require('../images/template/Location.png');
const DatetimeIcon = require('../images/template/datetime.png');
const DateIcon = require('../images/template/date.png');
const TimeIcon = require('../images/template/time.png');
const LinkIcon = require('../images/template/Link.png');

let previewImgArr: any = [];

interface State {
  addControllerVisible: boolean;
  previewVisible: boolean;
  previewIndex: number;
}
interface Props {
  navigation: any;
  reports: Array<ModelType & ReportType>;
  editingReport: ModelType & ReportType & any;
  authToken: string;
  currentUserInfo: any;
  authName: string;
  authPkey: string;
  authPic: string;
  dispatch: Function;
  staffMap: any;
  departmentMap: any;
}
const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  titleColor: DColors.title,
};
const DIcon = {
  more: require('../images/Index-Login/more-operation.png'),
  Delete: require('../images/template/Delete.png'),
  Edit: require('../images/template/Edit.png'),
  Share: require('../images/template/Share.png'),
  headerImageIcon: require('../images/Me/Portrait.png'),
  downloadIcon: require('../images/template/download.png'),
};
export class ReportPreviewScreen extends Component<Props, State> {
  _didFocusSubscription: any;
  _willBlurSubscription: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      addControllerVisible: false,
      previewVisible: false,
      previewIndex: 0,
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

  componentWillMount() {
    previewImgArr = [];
  }

  componentWillUnmount() {
    previewImgArr = [];
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
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
    this.closeControllerModal();
    this.props.navigation.goBack();
    return true;
  };

  handleClickFileName = () => {
    Modal.alert('Please go to the web side to download file', '', [
      {text: 'OK', onPress: () => {}},
    ]);
  };

  // 渲染sections
  renderSections = (section: any) => {
    return (
      <View key={section.Order} style={{alignItems: 'center'}}>
        <View style={[styles.dataFieldCardWrap, {width: deviceWidth - 17 * 2}]}>
          <View style={styles.sectionNameWrapper}>
            <Text style={styles.sectionName}>{section.Name}</Text>
          </View>
        </View>
        <View>
          {section.FieldData.map((field: any) => this.renderField(field))}
        </View>
      </View>
    );
  };

  renderSection = (section: any) => {
    return (
      <View key={section.Order} style={{alignItems: 'center'}}>
        {section.FieldData.map((field: any) => this.renderField(field))}
      </View>
    );
  };

  renderTableField = (
    tbFItem: any,
    valueIndex: number,
    onlyOneCol: boolean,
  ) => {
    const {editingReport, departmentMap, staffMap} = this.props;
    let tableFieldValue = tbFItem.FieldValueList[valueIndex];
    if (tableFieldValue) {
      if (tbFItem.Type === tableFieldTypes.Datetime) {
        tableFieldValue = moment(tableFieldValue).format(customFormat.DATETIME);
      } else if (tbFItem.Type === tableFieldTypes.Date) {
        tableFieldValue = moment(tableFieldValue).format(customFormat.DATE);
      } else if (tbFItem.Type === tableFieldTypes.TimeStamp) {
        tableFieldValue = moment(tableFieldValue).format(customFormat.TIME);
      } else if (tbFItem.Type === tableFieldTypes.Staff) {
        tableFieldValue =
          getIn(staffMap, [tableFieldValue, 'staffName']) || tableFieldValue;
      } else if (tbFItem.Type === tableFieldTypes.Department) {
        tableFieldValue =
          getIn(departmentMap, [tableFieldValue, 'name']) || tableFieldValue;
      }
    }

    let unitText =
      tbFItem.property && tbFItem.property.currencyUnit
        ? tbFItem.property.currencyUnit.substr(
            0,
            tbFItem.property.currencyUnit.indexOf(','),
          ) + ' '
        : '$ ';

    return (
      <View
        key={tbFItem.Order}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        {!onlyOneCol && (
          <View
            style={{
              paddingRight: 20,
              width: '40%',
            }}>
            <Text style={styles.tableFieldName}>{tbFItem.FieldName}</Text>
          </View>
        )}
        <View style={styles.formCheckBoxTextView}>
          {tbFItem.Type === tableFieldTypes.Radio && tableFieldValue ? (
            <Text style={styles.inputText}>{tableFieldValue}</Text>
          ) : tbFItem.Type === tableFieldTypes.CheckBox && tableFieldValue ? (
            tableFieldValue.split(',').map((item: string, index: number) => (
              <Text key={index} style={styles.inputText}>
                {item.trim() + ' ;  '}
              </Text>
            ))
          ) : (
            <Text
              style={{
                ...styles.tableFieldName,
                color: '#757575',
              }}>
              {tbFItem.Type === tableFieldTypes.Money ? unitText : ''}
              {tableFieldValue.length > 50
                ? tableFieldValue + '\n'
                : tableFieldValue}
            </Text>
          )}
        </View>
      </View>
    );
  };

  renderField = (field: any) => {
    const {editingReport, departmentMap, staffMap} = this.props;
    let FieldContent = <View />;
    if (field.Type === fieldTypes.Text || field.Type === fieldTypes.Number) {
      FieldContent = (
        <View style={styles.inputMode}>
          <Text style={styles.inputText}>{field.FieldValue}</Text>
        </View>
      );
    } else if (
      field.Type === fieldTypes.TextArea ||
      field.Type === fieldTypes.ScanBarCode ||
      field.Type === fieldTypes.ScanQRCode
    ) {
      FieldContent = (
        <View style={styles.inputMode}>
          <Text style={styles.inputText}>{field.FieldValue}</Text>
        </View>
      );
    } else if (field.Type === fieldTypes.File) {
      FieldContent = (
        <TouchableOpacity
          onPress={this.handleClickFileName}
          style={styles.inputMode}>
          <Text style={{...styles.inputText, color: DColors.mainColor}}>
            {getIn(field, ['property', 'fileName'], field.FieldValue)}
          </Text>
        </TouchableOpacity>
      );
    } else if (field.Type === fieldTypes.Money) {
      let unitText =
        field.property && field.property.currencyUnit
          ? field.property.currencyUnit.substr(
              0,
              field.property.currencyUnit.indexOf(','),
            ) + ' '
          : '$ ';
      FieldContent = (
        <View style={styles.inputMode}>
          <Text>{unitText}</Text>
          <Text style={styles.inputText}>{field.FieldValue}</Text>
        </View>
      );
    } else if (field.Type === fieldTypes.Email) {
      FieldContent = (
        <View style={styles.inputMode}>
          <Text style={styles.inputText}>{field.FieldValue}</Text>
        </View>
      );
    } else if (field.Type === fieldTypes.Name) {
      FieldContent = (
        <View style={styles.inputMode}>
          <Text style={styles.inputText}>
            {field.FieldValue.replace(',', ' ')}
          </Text>
        </View>
      );
    } else if (field.Type === fieldTypes.Staff) {
      FieldContent = (
        <View style={styles.inputMode}>
          <Text style={styles.inputText}>
            {getIn(staffMap, [field.FieldValue, 'staffName']) ||
              field.FieldValue}
          </Text>
        </View>
      );
    } else if (field.Type === fieldTypes.Department) {
      FieldContent = (
        <View style={styles.inputMode}>
          <Text style={styles.inputText}>
            {getIn(departmentMap, [field.FieldValue, 'name']) ||
              field.FieldValue}
          </Text>
        </View>
      );
    } else if (
      field.Type === fieldTypes.Radio ||
      field.Type === fieldTypes.RadioButton
    ) {
      FieldContent = (
        <View style={styles.inputMode}>
          <View style={styles.formCheckBoxTextView}>
            <Text style={styles.inputText}>{field.FieldValue}</Text>
          </View>
        </View>
      );
    } else if (field.Type === fieldTypes.CheckBox) {
      FieldContent = (
        <View style={styles.inputMode}>
          <View style={styles.formCheckBoxTextView}>
            {field.FieldValue
              ? field.FieldValue.split(',').map(
                  (item: string, index: number) => (
                    <Text key={index} style={styles.inputText}>
                      {item.trim() + ' ;  '}
                    </Text>
                  ),
                )
              : null}
          </View>
        </View>
      );
    } else if (field.Type === fieldTypes.LinkedReport) {
      let linkFieldType = getIn(field, ['linkReportValue', 'type'], '');
      let linkFieldValue = getIn(field, ['linkReportValue', 'value'], '');
      FieldContent = (
        <View style={styles.inputMode}>
          <Text style={styles.inputText}>
            {linkFieldType === fieldTypes.Datetime ||
            linkFieldType === fieldTypes.Date ||
            linkFieldType === fieldTypes.TimeStamp
              ? formatValueTextForLinkReport(
                  linkFieldValue,
                  linkFieldType,
                  '--',
                  staffMap,
                  departmentMap,
                )
              : linkFieldValue}
          </Text>
        </View>
      );
    } else if (field.Type === fieldTypes.LinkedField) {
      let linkReportFieldName = '';
      editingReport.Sections.forEach((sItem: any) => {
        sItem.FieldData.forEach((fItem: any) => {
          if (
            fItem.Type === fieldTypes.LinkedReport &&
            fItem.fieldKey === getIn(field, ['property', 'linkedReportId'], '')
          ) {
            linkReportFieldName = fItem.FieldName;
          }
        });
      });
      let linkFieldType = getIn(field, ['FieldValue', 'type'], '');
      let linkFieldValue = getIn(field, ['FieldValue', 'value'], '');
      FieldContent = (
        <View style={styles.linkFieldWrap}>
          <View style={styles.inputMode}>
            <Text style={styles.inputText}>
              {linkFieldType === fieldTypes.Datetime ||
              linkFieldType === fieldTypes.Date ||
              linkFieldType === fieldTypes.TimeStamp
                ? formatValueTextForLinkReport(
                    linkFieldValue,
                    linkFieldType,
                    '',
                    staffMap,
                    departmentMap,
                  )
                : linkFieldValue}
            </Text>
          </View>
          <View style={styles.fieldLink}>
            <Image
              style={{width: 12, height: 12, marginRight: 8}}
              source={LinkIcon}
            />
            <Text numberOfLines={1} style={styles.fieldLinkText}>
              {linkReportFieldName}
            </Text>
          </View>
        </View>
      );
    } else if (field.Type === fieldTypes.Picture) {
      let valueArr = field.FieldValue.split(',');
      let emptyLen = 4 - (valueArr.length % 4);
      for (let i = 0; i < emptyLen; i++) {
        valueArr.push('');
      }
      FieldContent = (
        <View style={styles.picGroupWrap}>
          {valueArr.map((value: string, index: number) =>
            value !== '' ? (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  this.handleClickImage(value);
                }}>
                <Image style={styles.pictureItem} source={{uri: value}} />
              </TouchableOpacity>
            ) : (
              <View key={index} style={{width: 64}} />
            ),
          )}
        </View>
      );
    } else if (field.Type === fieldTypes.Video) {
      let valueArr = field.FieldValue.split(',');
      FieldContent = (
        <View>
          {valueArr.map((value: string, index: number) => (
            <View key={index} style={{marginBottom: 12}}>
              <DMoviePlayer source={value} height={184} />
            </View>
          ))}
        </View>
      );
    } else if (field.Type === fieldTypes.Location) {
      let region = field.FieldValue.split(',');
      FieldContent = (
        <TouchableWithoutFeedback
        // onPress={() =>
        //   this.props.navigation.navigate("Maps", {
        //     region
        //   })
        // }
        >
          <View style={styles.inputMode}>
            <Image
              style={{width: 14, height: 16, marginRight: 9}}
              source={LocationIcon}
            />
            <Text style={styles.inputText}>{field.FieldValue}</Text>
          </View>
        </TouchableWithoutFeedback>
      );
    } else if (field.Type === fieldTypes.Signature) {
      FieldContent =
        field.FieldValue && field.FieldValue !== '' ? (
          <View style={styles.signatureWrap}>
            <Image
              style={{
                width: deviceWidth - 32 - 13 * 2,
                height:
                  (signatureHeight * (deviceWidth - 32 - 13 * 2)) /
                  (deviceWidth - 32),
              }}
              source={{uri: field.FieldValue}}
            />
          </View>
        ) : (
          <View />
        );
    } else if (field.Type === fieldTypes.TimeStamp) {
      FieldContent = (
        <View style={styles.inputMode}>
          <Image
            style={{
              width: 16,
              height: 16,
              marginRight: 9,
            }}
            source={TimeIcon}
          />
          <Text style={styles.inputText}>
            {field.FieldValue
              ? moment(field.FieldValue).format(customFormat.TIME)
              : ''}
          </Text>
        </View>
      );
    } else if (field.Type === fieldTypes.Date) {
      FieldContent = (
        <View style={styles.inputMode}>
          <Image
            style={{width: 16, height: 16, marginRight: 9}}
            source={DateIcon}
          />
          <Text style={styles.inputText}>
            {field.FieldValue
              ? moment(field.FieldValue).format(customFormat.DATE)
              : ''}
          </Text>
        </View>
      );
    } else if (field.Type === fieldTypes.Datetime) {
      FieldContent = (
        <View style={styles.inputMode}>
          <Image
            style={{width: 16, height: 16, marginRight: 9}}
            source={DatetimeIcon}
          />
          <Text style={styles.inputText}>
            {field.FieldValue
              ? moment(field.FieldValue).format(customFormat.DATETIME)
              : ''}
          </Text>
        </View>
      );
    } else if (field.Type === fieldTypes.Table) {
      const onlyOneCol = field.TableFieldDataList.length === 1;
      let tableContent = field.TableFieldDataList[0].FieldValueList.map(
        (item: string, valueIndex: number) => {
          let tableFieldsDom = field.TableFieldDataList.map((tbFItem: any) =>
            this.renderTableField(tbFItem, valueIndex, onlyOneCol),
          );
          return (
            <View
              key={valueIndex}
              style={
                valueIndex !==
                field.TableFieldDataList[0].FieldValueList.length - 1
                  ? [{borderBottomWidth: 1}, styles.tableRowWrap]
                  : styles.tableRowWrap
              }>
              {tableFieldsDom}
            </View>
          );
        },
      );
      FieldContent = (
        <View style={styles.tableWrap}>
          {onlyOneCol ? (
            <View
              style={{
                paddingRight: 20,
                maxWidth: '40%',
              }}>
              <Text style={styles.tableFieldName}>
                {field.TableFieldDataList[0].FieldName}
              </Text>
            </View>
          ) : null}
          <View style={{flex: 1}}>{tableContent}</View>
        </View>
      );
    }
    return (
      <View
        key={field.Order + field.FieldName}
        style={[styles.fieldWrapper, styles.dataFieldCardWrap]}>
        <Text style={styles.fieldName}>{field.FieldName}</Text>
        {FieldContent}
      </View>
    );
  };

  // 分享
  handleShare = () => {
    const {navigation} = this.props;
    navigation.navigate('CreateGroup', {
      title: 'Share',
      type: 'shareReport',
    });
  };

  // 编辑
  handleEdit = () => {
    let {navigation, editingReport} = this.props;
    navigation.navigate('CollectData', {
      type: 'Edit',
      from: 'previewPage',
    });
  };

  handleDelete = (item: ModelType & ReportType) => {
    Modal.alert('Are you sure to delete?', '', [
      {
        text: 'Cancel',
        onPress: () => {
          console.log('cancel');
        },
        style: 'cancel',
      },
      {
        text: 'Sure',
        onPress: () => {
          setTimeout(() => {
            this.submitDeleteReport(item);
          }, 500);
        },
      },
    ]);
  };

  submitDeleteReport = (item: ModelType & ReportType) => {
    const {authToken, navigation, currentUserInfo} = this.props;
    if (item.UploadStatus) {
      this.props.dispatch(deleteCompanyReport(authToken, item.pKey));
    } else {
      this.props.dispatch(
        deleteCompanyReportDraft(currentUserInfo._id, item.pKey),
      );
    }
    this.props.navigation.goBack();
  };

  // 打开操作弹窗
  openControllerModal = () => {
    this.setState({
      addControllerVisible: true,
    });
  };

  // 关闭操作弹窗
  closeControllerModal = () => {
    this.setState({
      addControllerVisible: false,
    });
  };

  handleClickImage = (uri: string) => {
    if (uri && uri !== '' && Array.isArray(previewImgArr)) {
      this.handlePreviewVisible(true, previewImgArr.indexOf(uri));
    }
  };

  handlePreviewVisible = (visible: boolean, index: number) => {
    this.setState({previewVisible: visible, previewIndex: index || 0});
  };

  renderControllerModal = () => {
    let {editingReport, authPkey, currentUserInfo, navigation} = this.props;
    const {addControllerVisible} = this.state;
    let controllers: any = [];
    const isHimself =
      editingReport.User_pKey_Creator === authPkey ? true : false;
    if (isAdmin(currentUserInfo) || isHimself) {
      controllers.push({
        text: 'Edit Data',
        onPress: () => {
          this.handleEdit();
          this.closeControllerModal();
        },
      });
    }
    controllers.push({
      text: 'Share Data',
      onPress: () => {
        this.handleShare();
        this.closeControllerModal();
      },
    });
    if (isAdmin(currentUserInfo) || isHimself) {
      controllers.push({
        text: 'Delete Data',
        onPress: () => {
          this.handleDelete(editingReport);
          this.closeControllerModal();
        },
      });
    }
    return (
      <DActionSheet
        visible={addControllerVisible}
        onClose={this.closeControllerModal}
        actions={controllers}
      />
    );
  };

  handleApproval = (approve: boolean) => {
    const {authToken, editingReport} = this.props;
    this.props.dispatch(
      handleDataApproval(
        authToken,
        editingReport.pKey,
        approve ? 'next' : 'deny',
      ),
    );
  };

  render() {
    const {navigation, authPkey, editingReport, currentUserInfo} = this.props;
    const {previewVisible, previewIndex} = this.state;
    let Report = editingReport;
    previewImgArr = [];
    if (Array.isArray(editingReport.Sections)) {
      editingReport.Sections.forEach((sItem: any) => {
        sItem.FieldData.forEach((fItem: any) => {
          if (fItem.Type === fieldTypes.Picture) {
            let valueArr = fItem.FieldValue.split(',');
            previewImgArr.push(...valueArr);
          }
        });
      });
    }
    let previewSourceArr = previewImgArr.map((item: string) => ({url: item}));
    let userPic =
      Report.UploadStatus && Report.CreatorPic
        ? {
            uri: Report.CreatorPic,
          }
        : !Report.UploadStatus
        ? {
            uri: this.props.authPic,
          }
        : DIcon.headerImageIcon;
    let creatorName = Report.CreatorName || Report.anonymityType || 'Anonymity';
    let lastUpdateUser =
      Report.User_pKey_Modifier && Report.User_pKey_Modifier.nickName
        ? Report.User_pKey_Modifier.nickName
        : creatorName;

    let ApprovalDom: any = null;
    let ApprovalButtons: any = null;
    const {approval, task} = Report;
    const hasTask = task && Array.isArray(task.staffs) && task.staffs.length;
    const hasApproval =
      approval && Array.isArray(approval.staffs) && approval.staffs.length;
    if (hasTask || hasApproval) {
      let stateColor = DColors.mainColor,
        stateText = 'Processing';
      if (hasApproval) {
        const {state} = approval;
        if (state === -1) {
          // 已关闭
          stateColor = '#aaa';
          stateText = 'Closed';
        } else if (state === 0) {
          // 待重新提交
          stateColor = '#FABF40';
          stateText = 'Pending';
        } else if (state === 1) {
          // 审核中
          stateColor = DColors.mainColor;
          stateText = 'Processing';
        } else if (state === 2) {
          // 审核通过
          stateColor = '#39da7b';
          stateText = 'Approved';
        }
      } else if (hasTask) {
        const {state} = task;
        if (state === 0) {
          // 待重新提交
          stateColor = '#aaa';
          stateText = 'Closed';
        } else if (state === 1) {
          // 审核中
          stateColor = DColors.mainColor;
          stateText = 'Processing';
        } else if (state === 2) {
          // 审核通过
          stateColor = '#39da7b';
          stateText = 'Completed';
        }
      }

      ApprovalDom = (
        <View style={styles.approvalInfo}>
          <View style={styles.approvalLeft}>
            <View
              style={{...styles.approvalPoint, backgroundColor: stateColor}}
            />
            <Text style={{...styles.approvalStateText, color: stateColor}}>
              {stateText}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ApprovalProcess');
            }}
            style={styles.approvalRight}>
            <Text style={styles.approvalRightText}>Approval Process</Text>
            <Icon name="right" color="#757575" style={{marginLeft: 6}} />
          </TouchableOpacity>
        </View>
      );

      const {cc, currentStaff, process, staffs, state, type} = approval;
      if (state === 1) {
        let needToHandle = false;
        if (type === 'and') {
          const lastProcessStaff = process[process.length - 1];
          if (
            !lastProcessStaff.result &&
            lastProcessStaff.staff === currentUserInfo.staffId
          ) {
            needToHandle = true;
          }
        } else if (
          type === 'or' &&
          staffs.indexOf(currentUserInfo.staffId) > -1
        ) {
          needToHandle = true;
        }
        if (needToHandle) {
          ApprovalButtons = (
            <View style={styles.approvalBtnGroup}>
              <TouchableOpacity
                onPress={() => {
                  this.handleApproval(true);
                }}
                style={styles.approvalBtnBlue}>
                <Text style={{fontSize: 16, color: '#fff'}}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.handleApproval(false);
                }}
                style={styles.approvalBtnWhite}>
                <Text style={{fontSize: 16, color: DColors.mainColor}}>
                  Disapprove
                </Text>
              </TouchableOpacity>
            </View>
          );
        }
      }
    }

    const readOnly = navigation.getParam('readOnly') || hasTask || hasApproval;

    return (
      <View style={styles.normal}>
        <TitleBarNew
          title="Data"
          navigation={navigation}
          rightImage={readOnly ? null : DIcon.more}
          pressLeft={() => {
            setTimeout(() => {
              this.props.dispatch(clearEditingReport());
            }, 50);
            navigation.goBack();
          }}
          pressRight={
            readOnly
              ? null
              : () => {
                  this.openControllerModal();
                }
          }
        />

        {Report.Name && Array.isArray(Report.Sections) ? (
          <ScrollView style={styles.dataWarp}>
            <View style={styles.authorInfoWrap}>
              <View style={styles.createdInfo}>
                <Image source={userPic} style={styles.infoImage} />
                <View style={{marginLeft: 12}}>
                  <Text numberOfLines={1} style={styles.authNameText}>
                    {creatorName}
                  </Text>
                  <Text style={styles.createdTime}>
                    {moment(Report.createdAt).format('MMM Do, HH:mm')}
                  </Text>
                </View>
              </View>
              <View style={styles.topInfoRight}>
                <Text style={styles.topInfoRightText}>
                  {Report.showCode && Report.code ? 'No.' + Report.code : ''}
                </Text>
                <Text numberOfLines={1} style={styles.topInfoRightText}>
                  {lastUpdateUser ? 'Last Update: ' + lastUpdateUser : ''}
                </Text>
              </View>
            </View>
            {ApprovalDom}
            <View style={[styles.titleBar]}>
              <Text style={styles.templateTitle}>{Report.templateName}</Text>
              <Text style={styles.reportTitle}>{'ID: ' + Report.Name}</Text>
            </View>
            {Report.Sections.length > 1
              ? Report.Sections.map((section: any) =>
                  this.renderSections(section),
                )
              : Report.Sections.map((section: any) =>
                  this.renderSection(section),
                )}
            {ApprovalButtons}
            <View style={{height: setSizeWithPx(100)}} />
          </ScrollView>
        ) : null}
        {this.renderControllerModal()}
        <DImagePreview
          visible={previewVisible}
          imageUrls={previewSourceArr}
          index={previewIndex}
          handleClose={() => {
            this.handlePreviewVisible(false, 0);
          }}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  topInfoRight: {
    width: deviceWidth - 225,
    height: 36,
    marginRight: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  topInfoRightText: {
    color: '#2E2E2E',
    fontSize: 12,
  },
  dataWarp: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  authorInfoWrap: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 3,
    width: deviceWidth - 32,
    height: 66,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataFieldCardWrap: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 3,
    paddingHorizontal: 13,
    paddingVertical: 13,
  },
  createdInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  infoImage: {
    width: 40,
    height: 40,
    marginLeft: 8,
    borderRadius: 20,
  },
  authNameText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    marginBottom: 4,
    color: '#2E2E2E',
    width: 108,
  },
  createdTime: {
    fontFamily: Page.font_family,
    fontSize: 12,
    color: '#757575',
  },
  approvalInfo: {
    marginBottom: 12,
    height: 52,
    backgroundColor: '#fff',
    paddingHorizontal: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  approvalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approvalRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  approvalPoint: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#39da7b',
    marginRight: 8,
  },
  approvalStateText: {
    color: '#39da7b',
    fontSize: 16,
  },
  approvalRightText: {
    color: '#767676',
    fontSize: 12,
  },
  approvalBtnGroup: {
    marginTop: 40,
    marginHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approvalBtnWhite: {
    width: 120,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approvalBtnBlue: {
    width: 120,
    height: 40,
    backgroundColor: DColors.mainColor,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBar: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 3,
    paddingHorizontal: 13,
    paddingVertical: 14,
    minHeight: 80,
  },
  templateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Page.titleColor,
  },
  reportTitle: {
    marginTop: 10,
    textAlign: 'right',
    fontSize: 12,
    color: Page.titleColor,
  },
  line: {
    flex: 1,
    width: deviceWidth - 17 * 2,
    height: setSizeWithPx(4),
    opacity: 0.16,
    backgroundColor: '#aaaaaa',
    marginTop: setSizeWithPx(100),
  },
  sectionNameWrapper: {
    height: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#20a0ff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  sectionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Page.titleColor,
  },
  fieldWrapper: {
    width: deviceWidth - 17 * 2,
    minHeight: 66,
  },
  fieldName: {
    fontFamily: Page.font_family,
    fontSize: 16,
    marginBottom: 13,
    fontWeight: 'bold',
    color: '#2E2E2E',
  },
  tableFieldName: {
    fontFamily: Page.font_family,
    fontSize: 14,
    color: '#2E2E2E',
  },
  LocationText: {
    fontSize: setSizeWithPx(50),
    marginLeft: setSizeWithPx(20),
    color: Page.titleColor,
  },
  inputMode: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 16,
  },
  linkFieldWrap: {},
  fieldLink: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldLinkText: {
    fontSize: 12,
    color: DColors.mainColor,
  },
  picGroupWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: -13,
  },
  pictureItem: {
    width: 64,
    height: 64,
    marginBottom: 17,
    backgroundColor: '#F2F2F2',
  },
  videoItem: {
    width: '100%',
    minHeight: 184,
    backgroundColor: '#F2F2F2',
  },
  signatureWrap: {
    width: deviceWidth - 32 - 13 * 2,
    height:
      (signatureHeight * (deviceWidth - 32 - 13 * 2)) / (deviceWidth - 32),
    borderWidth: 1,
    borderColor: '#f2f2f2',
    backgroundColor: '#f2f2f2',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 14,
    color: '#757575',
  },
  twoIcon: {
    position: 'absolute',
    bottom: setSizeWithPx(25),
    right: setSizeWithPx(70),
  },
  circleButton: {
    width: setSizeWithPx(150),
    height: setSizeWithPx(150),
    marginBottom: setSizeWithPx(50),
  },
  tableWrap: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 3,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableRowWrap: {
    borderColor: '#e5e5e5',
    paddingVertical: 4,
  },
  tableFieldWrap: {
    marginHorizontal: 5,
    marginVertical: 5,
  },
  modalSelectItem: {
    width: 56,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIcon: {
    width: setSizeWithPx(66),
    height: setSizeWithPx(66),
  },
  modal: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  modalSelectWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    height: 120,
  },
  button: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  formCheckBoxTextView: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  formCheckBoxText: {
    marginVertical: 3,
    fontSize: DFontSize.c1,
    color: DColors.title,
  },
});

function mapStateToProps(state: any) {
  return {
    reports: state.report.reports,
    editingReport: state.report.editingReport,
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
    authPkey: state.loginInfo.currentUserInfo._id,
    authName: state.loginInfo.currentUserInfo.nickName,
    authPic: state.loginInfo.currentUserInfo.userPic,
    staffMap: state.company.staffMap,
    departmentMap: state.company.departmentMap,
  };
}

export default connect(mapStateToProps)(ReportPreviewScreen);
