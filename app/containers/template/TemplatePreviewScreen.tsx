import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  BackHandler,
  TextStyle,
  Keyboard,
} from 'react-native';
import {TitleBarNew, DActionSheet} from '../../common/components';
import {fieldTypes, toastTips, tableFieldTypes} from '../../common/constants';

import {
  copyTemplateAddToMine,
  addSystemTemplateToCompany,
} from '../../store/actions';
import {
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
} from '../../common/utils';
import {DColors, FONT_FAMILY} from '../../common/styles';
import {TemplateType, ModelType} from '../../common/constants/ModeTypes';
import {Modal, Toast, Icon, NoticeBar} from '@ant-design/react-native';
import {Action} from '@ant-design/react-native/lib/modal/PropsType';

const LocationIcon = require('../images/template/Location.png');
const DatetimeIcon = require('../images/template/datetime.png');
const DateIcon = require('../images/template/date.png');
const TimeIcon = require('../images/template/time.png');
const addPicture = require('../images/template/Add-picture.png');
const selectDown = require('../images/template/down.png');
const downloadIcon = require('../images/template/download.png');
const moreIcon = require('../images/Index-Login/more-operation.png');

interface State {
  editAble: Boolean;
  controllerVisible: boolean;
  showSystemTemplateTips: boolean;
}
interface Props {
  navigation: any;
  templates: Array<ModelType & TemplateType>;
  companyTemplates: Array<ModelType & TemplateType>;
  editingTemplate: ModelType & TemplateType;
  authToken: string;
  dispatch: Function;
}
const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  titleColor: DColors.title,
};

export class TemplatePreviewScreen extends Component<Props, State> {
  _didFocusSubscription: any;
  _willBlurSubscription: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      editAble: false,
      showSystemTemplateTips: true,
      controllerVisible: false,
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
    this.handleGoBack();
    return true;
  };

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

  componentWillMount() {
    // console.log("componentWillMount");
    this.handleInitialState(this.props);
  }

  componentWillReceiveProps(nextProps: any) {
    // console.log("componentWillReceiveProps");
    this.handleInitialState(nextProps);
  }

  handleInitialState = (props: any) => {
    let {navigation} = this.props;
    let from = navigation.getParam('from');
    if (from !== 'Editing') {
      this.setState({editAble: true});
    } else {
      this.setState({editAble: false});
    }
  };

  handleGoBack = () => {
    const {navigation} = this.props;
    navigation.goBack();
  };

  renderTableField = (tbFItem: any) => {
    return (
      <View key={tbFItem.Order} style={styles.itemStyle}>
        <Text style={styles.itemTitle}>
          {tbFItem.Type === tableFieldTypes.Money
            ? tbFItem.Name + ' ($)'
            : tbFItem.Name}
          <Text>
            {tbFItem.property.required ? (
              <Text style={{color: '#ed2f31'}}> *</Text>
            ) : null}
          </Text>
        </Text>
        <Text style={styles.defaultText} />
      </View>
    );
  };

  renderField = (field: any) => {
    let FieldContent = <View />;
    if (
      field.Type === fieldTypes.Text ||
      field.Type === fieldTypes.Number ||
      field.Type === fieldTypes.Email ||
      field.Type === fieldTypes.TextArea
    ) {
      FieldContent = <View style={styles.inputMode} />;
    }
    if (
      field.Type === fieldTypes.ScanBarCode ||
      field.Type === fieldTypes.ScanQRCode
    ) {
      FieldContent = (
        <View style={styles.inputMode}>
          <Icon name="scan" style={styles.scanFieldIcon} />
        </View>
      );
    } else if (field.Type === fieldTypes.Name) {
      FieldContent = (
        <View style={styles.fullNameGroup}>
          <View style={styles.fullNameItem}>
            <Text style={{color: '#999'}}>First</Text>
          </View>
          <View style={styles.fullNameItem}>
            <Text style={{color: '#999'}}>Last</Text>
          </View>
        </View>
      );
    } else if (field.Type === fieldTypes.Money) {
      FieldContent = (
        <View
          style={{
            ...styles.inputMode,
            paddingHorizontal: setSizeWithPx(30),
            justifyContent: 'flex-start',
          }}>
          <Text>$ </Text>
        </View>
      );
    } else if (field.Type === fieldTypes.LinkedReport) {
      FieldContent = (
        <View style={styles.inputMode}>
          <Image
            style={{
              width: setSizeWithPx(36),
              height: setSizeWithPx(20),
              marginRight: 17,
            }}
            source={selectDown}
          />
        </View>
      );
    } else if (field.Type === fieldTypes.LinkedField) {
      FieldContent = <View style={styles.inputMode} />;
    } else if (
      field.Type === fieldTypes.Radio ||
      field.Type === fieldTypes.CheckBox ||
      field.Type === fieldTypes.Staff ||
      field.Type === fieldTypes.Department
    ) {
      FieldContent = (
        <View style={styles.inputMode}>
          <Image
            style={{
              width: setSizeWithPx(36),
              height: setSizeWithPx(20),
              marginRight: 17,
            }}
            source={selectDown}
          />
        </View>
      );
    } else if (field.Type === fieldTypes.Picture) {
      FieldContent = (
        <View style={styles.pictureMode}>
          <Image style={{width: 19, height: 19}} source={addPicture} />
        </View>
      );
    } else if (field.Type === fieldTypes.Video) {
      FieldContent = (
        <View style={styles.pictureMode}>
          <Image style={{width: 19, height: 19}} source={addPicture} />
        </View>
      );
    } else if (field.Type === fieldTypes.Location) {
      FieldContent = (
        <View style={{...styles.inputMode, justifyContent: 'space-between'}}>
          <Image
            style={{width: 14, height: 16, marginLeft: 18}}
            source={LocationIcon}
          />
          <Image
            style={{
              width: setSizeWithPx(36),
              height: setSizeWithPx(20),
              marginRight: 17,
            }}
            source={selectDown}
          />
        </View>
      );
    } else if (field.Type === fieldTypes.TimeStamp) {
      FieldContent = (
        <View style={{...styles.inputMode, justifyContent: 'space-between'}}>
          <Image
            style={{width: 16, height: 16, marginLeft: 18}}
            source={TimeIcon}
          />
          <Image
            style={{
              width: setSizeWithPx(36),
              height: setSizeWithPx(20),
              marginRight: 17,
            }}
            source={selectDown}
          />
        </View>
      );
    } else if (field.Type === fieldTypes.Date) {
      FieldContent = (
        <View style={{...styles.inputMode, justifyContent: 'space-between'}}>
          <Image
            style={{width: 16, height: 16, marginLeft: 18}}
            source={DateIcon}
          />
          <Image
            style={{
              width: setSizeWithPx(36),
              height: setSizeWithPx(20),
              marginRight: 17,
            }}
            source={selectDown}
          />
        </View>
      );
    } else if (field.Type === fieldTypes.Datetime) {
      FieldContent = (
        <View style={{...styles.inputMode, justifyContent: 'space-between'}}>
          <Image
            style={{width: 16, height: 16, marginLeft: 18}}
            source={DatetimeIcon}
          />
          <Image
            style={{
              width: setSizeWithPx(36),
              height: setSizeWithPx(20),
              marginRight: 17,
            }}
            source={selectDown}
          />
        </View>
      );
    } else if (field.Type === fieldTypes.Signature) {
      FieldContent = <View style={styles.Signature} />;
    } else if (field.Type === fieldTypes.Table) {
      let tableFieldsDom = field.TableFieldList.map((tbFItem: any) =>
        this.renderTableField(tbFItem),
      );
      FieldContent = (
        <View style={{marginTop: 16, marginBottom: 32}}>
          <View style={styles.rowContent}>
            <View style={styles.rowTitle}>
              <Text style={styles.rowText}>Row 1</Text>
            </View>
            {tableFieldsDom}
          </View>
        </View>
      );
    }
    return (
      <View key={field.Order + '_' + field.Name} style={styles.fieldWrapper}>
        <Text style={styles.TableName}>
          {field.Type === fieldTypes.Table ? field.Name || 'Table' : field.Name}
          {field.property.required ? (
            <Text style={{color: '#ed2f31'}}> *</Text>
          ) : null}
        </Text>
        {FieldContent}
      </View>
    );
  };

  renderSections = (section: any) => {
    return (
      <View
        key={section.Order + '_' + section.Name}
        style={{alignItems: 'center'}}>
        <View style={styles.sectionNameWrapper}>
          <Text style={styles.sectionName}>{section.Name}</Text>
        </View>
        {section.Fields.map((field: any) => this.renderField(field))}
      </View>
    );
  };

  renderSection = (section: any) => {
    return (
      <View
        key={section.Order + '_' + section.Name}
        style={{alignItems: 'center'}}>
        {section.Fields.map((field: any) => this.renderField(field))}
      </View>
    );
  };

  handleDownloadCompanyToLocal = () => {
    const {authToken, editingTemplate, navigation, templates} = this.props;
    let sameTemplates = templates.filter(
      item => item.Name === editingTemplate.Name,
    );
    if (sameTemplates.length > 0) {
      Modal.alert(
        'Download Failed!',
        'The local already has a template of the same name.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ],
      );
    } else {
      this.props.dispatch(
        copyTemplateAddToMine(
          authToken,
          {
            templatePkey: editingTemplate.pKey,
          },
          () => {
            Toast.success(toastTips.SuccessDownload, 1);
            navigation.goBack();
          },
        ),
      );
    }
  };

  handleAddDynamicTemplateToMy = () => {
    let {authToken, templates, editingTemplate} = this.props;
    Modal.prompt(
      'Add template',
      '',
      [
        {
          text: 'Cancel',
          onPress: () => {
            Keyboard.dismiss();
          },
        },
        {
          text: 'OK',
          onPress: (value: string) => {
            Keyboard.dismiss();
            if (value) {
              let sameTemplates = templates.filter(item => item.Name === value);
              if (sameTemplates.length > 0) {
                Modal.alert(
                  'Add template failed !',
                  'The template with the same name already exists, please rename to add.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {},
                    },
                  ],
                );
              } else {
                this.props.dispatch(
                  copyTemplateAddToMine(
                    authToken,
                    {
                      templatePkey: editingTemplate.pKey,
                      templateName: value || '',
                    },
                    () => {
                      Toast.success(toastTips.SuccessAdd, 1);
                    },
                  ),
                );
              }
            } else {
              Toast.fail('Template Name is required !', 1, undefined, false);
            }
          },
        },
      ] as Action<TextStyle>[],
      'default',
      editingTemplate.Name,
      ['please input name'],
    );
  };

  handleAddSystemTemplate = (pKey: string, name: string) => {
    let {authToken, companyTemplates, navigation} = this.props;
    const isSystemTemplate = navigation.getParam('isSystemTemplate');
    Modal.prompt(
      isSystemTemplate ? 'Download template' : 'Copy template',
      '',
      [
        {
          text: 'Cancel',
          onPress: () => {
            Keyboard.dismiss();
          },
        },
        {
          text: 'OK',
          onPress: (value: string) => {
            Keyboard.dismiss();
            if (value) {
              let sameTemplates = companyTemplates.filter(
                item => item.Name === value,
              );
              if (sameTemplates.length > 0) {
                Modal.alert(
                  'Add template failed !',
                  'The template with the same name already exists, please rename to add.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {},
                    },
                  ],
                );
              } else {
                this.props.dispatch(
                  addSystemTemplateToCompany(
                    authToken,
                    {templatePkey: pKey, templateName: value || ''},
                    () => {
                      Toast.success(toastTips.SuccessAdd, 1);
                    },
                  ),
                );
              }
            } else {
              Toast.fail('Template Name is required !', 1, undefined, false);
            }
          },
        },
      ] as Action<TextStyle>[],
      'default',
      name,
      ['please input name'],
    );
  };

  // 打开操作弹窗
  openControllerModal = () => {
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

  hideErrorMsg = () => {
    this.setState({showSystemTemplateTips: false});
  };

  renderControllerModal = () => {
    let {navigation, editingTemplate} = this.props;
    const {controllerVisible} = this.state;
    const isSystemTemplate = navigation.getParam('isSystemTemplate');
    const isDynamicTemplate = navigation.getParam('isDynamicTemplate');
    let controllers: any = [];
    if (isSystemTemplate) {
      controllers.push({
        text: 'Download Template',
        onPress: () => {
          this.handleAddSystemTemplate(
            editingTemplate.pKey,
            editingTemplate.Name,
          );
          this.closeControllerModal();
        },
      });
    }
    if (isDynamicTemplate) {
      controllers.push({
        text: 'Add Template',
        onPress: () => {
          this.handleAddDynamicTemplateToMy();
          this.closeControllerModal();
        },
      });
    }

    return (
      <DActionSheet
        visible={controllerVisible}
        onClose={this.closeControllerModal}
        actions={controllers}
      />
    );
  };

  render() {
    const {navigation, editingTemplate} = this.props;
    const isSystemTemplate = navigation.getParam('isSystemTemplate');
    const isDynamicTemplate = navigation.getParam('isDynamicTemplate');
    const {showSystemTemplateTips} = this.state;
    console.log('preview', isSystemTemplate, showSystemTemplateTips);
    return (
      <View style={styles.normal}>
        <TitleBarNew
          title="Template"
          navigation={navigation}
          pressLeft={() => {
            this.handleGoBack();
          }}
          rightImage={isDynamicTemplate || isSystemTemplate ? moreIcon : null}
          pressRight={() => {
            this.openControllerModal();
          }}
        />
        {editingTemplate.Name && Array.isArray(editingTemplate.Sections) ? (
          <ScrollView contentContainerStyle={{paddingBottom: 50}}>
            {isSystemTemplate && showSystemTemplateTips ? (
              <View style={{height: 30}}>
                <View style={styles.noticeBarWrap}>
                  <NoticeBar
                    mode="closable"
                    icon={<Icon name="sound" color={DColors.auxiliaryOrange} />}
                    onPress={this.hideErrorMsg}
                    marqueeProps={{
                      loop: true,
                      leading: 1000,
                      trailing: 2000,
                      fps: 60,
                      style: {},
                    }}>
                    {'You will need to download the system template to use it.'}
                  </NoticeBar>
                </View>
              </View>
            ) : null}
            <View style={{...styles.titleBar, marginBottom: 28}}>
              <Text style={styles.templateTitle}>{editingTemplate.Name}</Text>
            </View>
            {editingTemplate.Sections.length > 1
              ? editingTemplate.Sections.map((section: any) =>
                  this.renderSections(section),
                )
              : editingTemplate.Sections.map((section: any) =>
                  this.renderSection(section),
                )}
          </ScrollView>
        ) : (
          <View />
        )}
        {this.renderControllerModal()}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  titleBar: {
    marginHorizontal: 17,
    marginTop: 18,
    height: 52,
    borderRadius: 3,
    justifyContent: 'center',
  },
  templateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Page.titleColor,
  },
  line: {
    flex: 1,
    width: setSizeWithPx(980),
    height: setSizeWithPx(4),
    opacity: 0.16,
    backgroundColor: '#aaaaaa',
    marginTop: setSizeWithPx(100),
  },
  sectionNameWrapper: {
    width: setSizeWithPx(982),
    borderLeftWidth: 4,
    borderLeftColor: '#20a0ff',
    paddingLeft: 10,
    marginBottom: 32,
  },
  sectionName: {
    fontSize: 16,
    color: Page.titleColor,
  },
  fieldWrapper: {
    width: deviceWidth - 34,
  },
  TableName: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#2E2E2E',
  },
  inputMode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 48,
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: '#ffffff',
  },
  noticeBarWrap: {
    width: deviceWidth,
    zIndex: 999,
    position: 'absolute',
    top: 0,
  },
  fullNameGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    marginTop: 16,
    marginBottom: 32,
  },
  fullNameItem: {
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: (deviceWidth - 48) / 2,
    height: 48,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pictureMode: {
    width: 64,
    height: 64,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  Location: {
    marginHorizontal: 10,
    marginTop: setSizeWithPx(45),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  Signature: {
    height: 120,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  LocationText: {
    fontSize: setSizeWithPx(50),
    marginLeft: setSizeWithPx(20),
    color: Page.titleColor,
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
    marginTop: 10,
    marginBottom: 32,
    borderRadius: setSizeWithPx(24),
    padding: 10,
    backgroundColor: '#fff',
  },
  rowContent: {
    backgroundColor: '#FFFFFF',
    paddingLeft: 17,
    paddingRight: 10,
    borderRadius: 3,
    marginBottom: 8,
  },
  rowTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 47,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  rowText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: Page.titleColor,
  },
  deleteText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: Page.mainColor,
  },
  itemStyle: {
    flexDirection: 'row',
    flex: 1,
    height: 47,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  itemTitle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#757575',
    maxWidth: '50%',
  },
  defaultText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#CCCCCC',
    width: '50%',
    textAlign: 'right',
  },
  scanFieldIcon: {
    position: 'absolute',
    right: 17,
    bottom: 12,
  },
});

function mapStateToProps(state: any) {
  return {
    templates: state.template.templates,
    editingTemplate: state.template.editingTemplate,
    companyTemplates: state.template.companyTemplates,
    authToken: state.loginInfo.currentUserInfo.authToken,
  };
}

export default connect(mapStateToProps)(TemplatePreviewScreen);
