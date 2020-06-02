import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  StatusBar,
  TouchableWithoutFeedback,
  FlatList,
  ImageBackground,
  Modal as ReactModal,
  TextStyle,
} from 'react-native';
import {PlatFormAndroid} from '../../env';
import {DColors, FONT_FAMILY} from '../../common/styles';
import {
  requestApiV2,
  API_v2,
  requestMultiplePermission,
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
  statusBarHeight,
  searchType,
  deviceHeight,
  isIphoneX,
  isIphoneXsMax,
  getIsFirstBubble,
  setIsFirstBubble,
  isNetworkConnected,
  getAutoSubmitDraft,
  getIn,
  backgroundColorEnum,
} from '../../common/utils';
import {NetworkStateBar} from '../../common/components';
import {Toast, Modal} from '@ant-design/react-native';
import {
  fetchUserTemplates,
  fetchCompanyTemplates,
  fetchUserReports,
  fetchCompanyReports,
  previewTemplate,
  previewTemplateBySelect,
  uploadCompanyTemplate,
  deleteUserTemplateDraft,
  deleteUserTemplate,
  deleteCompanyTemplate,
  initReport,
  copyTemplateAddToMine,
  autoUploadCompanyReportDraft,
} from '../../store/actions';
import {
  TemplateType,
  ModelType,
  ReportType,
} from '../../common/constants/ModeTypes';
import moment from 'moment';
import {
  canUploadTemplateToOrg,
  canDeleteTemplateFromOrg,
  canDownloadTemplateFromOrg,
  isStaffInCompany,
} from './judgement';
import {toastTips, LOGIN_IN} from '../../common/constants';
import {Action} from '@ant-design/react-native/lib/modal/PropsType';

interface State {
  currentTab: number;
  hadFetch: boolean;
  refreshing: boolean;
  bubbleVisible: boolean;
  bubbleIndex: number;
}
interface Props {
  navigation: any;
  authToken: string;
  currentUserInfo: any;
  companyInfo: any;
  userTemplateDrafts: Array<ModelType & TemplateType>;
  templates: Array<ModelType & TemplateType>;
  organizationTemplates: Array<ModelType & TemplateType>;
  companyReportDrafts: Array<ModelType & ReportType>;
  dispatch: Function;
}

interface Bubble {
  [key: string]: any;
}

const Page = {
  font_family: FONT_FAMILY,
  templateMargin: 16,
};

const Icon = {
  searchIcon: require('../images/Me/search.png'),
  AdminIcon: require('../images/template/Administration.png'),
  upLoadIcon: require('../images/template/Upload.png'),
  deleteIcon: require('../images/template/Delete_red.png'),
  defaultIcon: require('../images/template/default.png'),
  write_grey: require('../images/template/write_grey.png'),
  write_blue: require('../images/template/write_blue.png'),
  submit_grey: require('../images/template/submit_grey.png'),
  submit_blue: require('../images/template/submit_blue.png'),
  upload_grey: require('../images/template/upload_grey.png'),
  upload_blue: require('../images/template/upload_blue.png'),
  downloadIcon: require('../images/template/download.png'),
  blankpage1: require('../images/template/blankpage1.png'),
  headerImageIcon: require('../images/Me/Portrait.png'),
  AddScanIcon: require('../images/Me/Add_scan.png'),
  d2gIcon: require('../images/Me/about.png'),
};

const Bubble: Bubble = {
  bubble1: require('../images/GuidePage/long1.png'),
  bubble2: require('../images/GuidePage/long3.png'),
  bubble3: require('../images/GuidePage/long_add.png'),
  button: require('../images/GuidePage/button.png'),
};
let busy = false;

export class TemplateList extends Component<Props, State> {
  viewDidAppear: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 1,
      hadFetch: true,
      refreshing: false,
      bubbleVisible: false,
      bubbleIndex: 1,
    };
  }

  componentWillMount() {
    // Android 首次进入应用时请求权限
    if (Platform.OS === PlatFormAndroid) {
      requestMultiplePermission().then(res => {
        console.log('requestPermission---', res);
        // 显示气泡教程
        getIsFirstBubble()
          .then(res => {
            this.setState({
              bubbleVisible: false,
            });
          })
          .catch(e => {
            this.setState({
              bubbleVisible: true,
            });
          });
      });
    } else {
      // 显示气泡教程
      getIsFirstBubble()
        .then(res => {
          this.setState({
            bubbleVisible: false,
          });
        })
        .catch(e => {
          this.setState({
            bubbleVisible: true,
          });
        });
    }
  }

  componentDidMount() {
    this.viewDidAppear = this.props.navigation.addListener(
      'willFocus',
      (navigationProps: any) => {
        // console.log("页面将要显示", navigationProps);
        StatusBar.setBarStyle('light-content', true);
        getAutoSubmitDraft()
          .then(res => {
            if (res) {
              isNetworkConnected().then(isConnected => {
                if (isConnected) {
                  this.handleAutoUploadCompanyReportDraft();
                }
              });
            }
          })
          .catch(e => {
            console.log(e);
          });
        const currentTab = this.props.navigation.getParam('tab');
        if (isStaffInCompany(this.props.currentUserInfo)) {
          if (currentTab === 0 || currentTab === 1) {
            this.handleTabChange(currentTab);
          } else {
            this.handleTabChange(1);
          }
        } else {
          this.handleTabChange(0);
        }
      },
    );
  }

  componentWillUnmount() {
    this.viewDidAppear.remove();
  }

  componentWillReceiveProps(nextProps: Props) {
    const {authToken} = nextProps;
    if (authToken) {
      this.handleFetchList(nextProps);
    }
  }

  handleAutoUploadCompanyReportDraft = () => {
    const {companyReportDrafts, authToken} = this.props;
    const autoUploadDrafts = companyReportDrafts.filter(
      (item: any) => !item.error,
    );
    if (autoUploadDrafts.length) {
      this.props.dispatch(
        autoUploadCompanyReportDraft(authToken, autoUploadDrafts),
      );
    }
  };

  handleFetchList = (props: Props, refresh = false, refreshTab?: number) => {
    const {authToken, templates, organizationTemplates} = props;
    const {hadFetch, currentTab} = this.state;
    let tab = refreshTab === 0 || refreshTab === 1 ? refreshTab : currentTab;
    if (tab === 0) {
      if ((!hadFetch && !templates.length) || refresh) {
        this.setState({hadFetch: true, refreshing: true});
        this.props.dispatch(
          fetchUserTemplates(authToken, () => {
            this.setState({refreshing: false});
          }),
        );
      } else {
        this.setState({refreshing: false});
        busy = false;
      }
    } else if (tab === 1) {
      if ((!hadFetch && !organizationTemplates.length) || refresh) {
        this.setState({hadFetch: true, refreshing: true});
        this.props.dispatch(
          fetchCompanyTemplates(authToken, () => {
            this.setState({refreshing: false});
          }),
        );
      } else {
        this.setState({refreshing: false});
        busy = false;
      }
    }
  };

  handleTabChange = (tabIndex: number) => {
    if (!busy) {
      busy = true;
      this.props.navigation.setParams({tab: tabIndex});
      this.setState({
        currentTab: tabIndex,
      });
      // this.handleFetchList(this.props, false, tabIndex);
    }
  };

  handleEdit = (item: ModelType & TemplateType) => {
    this.props.dispatch(previewTemplate(item));
    this.props.navigation.navigate('CreateTemplate', {type: 'Edit'});
  };

  handleCollectData = (template: ModelType & TemplateType) => {
    const {authToken} = this.props;
    this.props.dispatch(
      initReport(authToken, template, () => {
        this.props.navigation.navigate('CollectData', {
          type: 'Create',
        });
      }),
    );
  };

  handleDeleteTemplate = (
    item: ModelType & TemplateType,
    templateType: string,
  ) => {
    const {authToken} = this.props;
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
            if (templateType === 'User') {
              this.submitDeleteUserTemplate(item);
            } else if (templateType === 'Company') {
              this.submitDeleteCompanyTemplate(item);
            }
          }, 500);
        },
      },
    ]);
  };

  submitDeleteUserTemplate = (item: ModelType & TemplateType) => {
    const {authToken, currentUserInfo} = this.props;
    if (item.UploadStatus) {
      this.props.dispatch(deleteUserTemplate(authToken, item.pKey));
    } else {
      this.props.dispatch(
        deleteUserTemplateDraft(currentUserInfo._id, item.pKey),
      );
    }
  };

  submitDeleteCompanyTemplate = (item: ModelType & TemplateType) => {
    const {authToken} = this.props;
    this.props.dispatch(deleteCompanyTemplate(authToken, item.pKey));
  };

  handleUploadTemplateToCompany = (item: ModelType & TemplateType) => {
    const {authToken, organizationTemplates} = this.props;
    const handleUploadFun = (
      templateData: ModelType & TemplateType,
      createOrUpdate: boolean,
    ) => {
      this.props.dispatch(
        uploadCompanyTemplate(authToken, templateData, createOrUpdate, () => {
          this.handleTabChange(1);
        }),
      );
    };
    requestApiV2(
      API_v2.templateNameIsExist,
      {name: item.Name, target: 'company'},
      authToken,
    )
      .then(res => {
        if (res.result === 'Success') {
          if (res.data) {
            Modal.alert(
              'Are you sure to upload?',
              'The organization already has a template of the same name. Are you sure to overwrite it?',
              [
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
                    organizationTemplates.forEach((orgItem: any) => {
                      if (orgItem.Name === item.Name) {
                        handleUploadFun(
                          {
                            ...orgItem,
                            Sections: [...item.Sections],
                          },
                          false,
                        );
                      }
                    });
                  },
                },
              ],
            );
          } else {
            handleUploadFun(item, true);
          }
        } else if (res.error) {
          Modal.alert('Request error !', res.error, [
            {text: 'OK', onPress: () => {}},
          ]);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  handleDownloadCompanyToLocal = (
    templateItem: ModelType & TemplateType,
    name?: string,
  ) => {
    const {
      authToken,
      templates,
      organizationTemplates,
      currentUserInfo,
    } = this.props;
    let itemName = name ? name : templateItem.Name;
    let sameTemplates = templates.filter(item => item.Name === itemName);
    if (sameTemplates.length > 0) {
      Modal.prompt(
        'Download Failed!',
        'The template with the same name already exists, please rename to download.',
        [
          {
            text: 'Cancle',
            onPress: () => {},
          },
          {
            text: 'OK',
            onPress: (value: string) => {
              value
                ? this.handleDownloadCompanyToLocal(templateItem, value)
                : Toast.fail(
                    'Template Name is required !',
                    1,
                    undefined,
                    false,
                  );
              return;
            },
          },
        ] as Action<TextStyle>[],
        'default',
        '',
        ['please input name'],
      );
    } else {
      this.props.dispatch(
        copyTemplateAddToMine(
          authToken,
          {
            templatePkey: templateItem.pKey,
            templateName: name || '',
          },
          () => {
            Toast.success(toastTips.SuccessDownload, 1);
            this.handleTabChange(0);
          },
        ),
      );
    }
  };

  handleGotIt = () => {
    let {bubbleIndex} = this.state;
    let {navigation} = this.props;
    if (bubbleIndex < 3) {
      this.setState({
        bubbleIndex: bubbleIndex + 1,
      });
    } else {
      this.setState({
        bubbleVisible: false,
      });
      setIsFirstBubble(true);
    }
  };

  render() {
    if (Platform.OS === PlatFormAndroid) {
      StatusBar.setBackgroundColor('rgba(0,0,0,0)', true);
      StatusBar.setTranslucent(true);
    }
    const {
      templates,
      organizationTemplates,
      currentUserInfo,
      userTemplateDrafts,
    } = this.props;
    const {refreshing, currentTab} = this.state;
    const currentCompanyName = currentUserInfo.companyName || '';

    let dataSource =
      currentTab === 0
        ? [...userTemplateDrafts, ...templates]
        : currentTab === 1
        ? organizationTemplates
        : [];

    // 部门分类设置颜色
    const defaultDepartmentText = 'All Departments';
    let departmentListForColor = [
      ...new Set(
        organizationTemplates.map(
          (templateItem: ModelType & TemplateType) =>
            templateItem.departmentName || defaultDepartmentText,
        ),
      ),
    ];
    departmentListForColor = departmentListForColor.sort();

    const _renderTabBar = () => {
      const {currentTab} = this.state;
      return (
        <View>
          <View style={styles.tabWrapper}>
            <TouchableWithoutFeedback
              onPress={() => this.props.navigation.navigate('ScanQRCode')}>
              <View
                style={
                  isStaffInCompany(currentUserInfo)
                    ? [styles.imageWrapper, {marginRight: 16}]
                    : styles.imageWrapper
                }>
                <Image style={styles.imageStyle} source={Icon.AddScanIcon} />
              </View>
            </TouchableWithoutFeedback>
            <View style={styles.tabsStyle}>
              {isStaffInCompany(currentUserInfo) && (
                <TouchableWithoutFeedback
                  onPress={() => this.handleTabChange(1)}>
                  <View style={styles.tabStyle}>
                    <Text
                      style={
                        currentTab === 1
                          ? styles.tabTextStyle
                          : {
                              ...styles.tabTextStyle,
                              color: '#E6E6E6',
                              fontSize: 12,
                            }
                      }>
                      ORGANIZATION
                    </Text>
                    {currentTab === 1 ? (
                      <View style={styles.underLineStyle} />
                    ) : (
                      <View
                        style={{
                          ...styles.underLineStyle,
                          backgroundColor: DColors.mainColor,
                        }}
                      />
                    )}
                  </View>
                </TouchableWithoutFeedback>
              )}
              <TouchableWithoutFeedback onPress={() => this.handleTabChange(0)}>
                <View style={styles.tabStyle}>
                  <Text
                    style={
                      currentTab === 0
                        ? styles.tabTextStyle
                        : {
                            ...styles.tabTextStyle,
                            color: '#E6E6E6',
                            fontSize: 12,
                          }
                    }>
                    {isStaffInCompany(currentUserInfo) ? (
                      'PERSONAL'
                    ) : (
                      <Text style={{fontSize: 18}}>Template</Text>
                    )}
                  </Text>
                  {isStaffInCompany(currentUserInfo) ? (
                    currentTab === 0 ? (
                      <View style={styles.underLineStyle} />
                    ) : (
                      <View
                        style={{
                          ...styles.underLineStyle,
                          backgroundColor: DColors.mainColor,
                        }}
                      />
                    )
                  ) : null}
                </View>
              </TouchableWithoutFeedback>
            </View>
            <TouchableWithoutFeedback
              onPress={() => {
                this.props.navigation.navigate('FuzzySearchAll', {
                  type: searchType.TemplateName,
                });
              }}>
              <View style={styles.imageWrapper}>
                <Image style={styles.imageStyle} source={Icon.searchIcon} />
              </View>
            </TouchableWithoutFeedback>
          </View>
          <NetworkStateBar />
        </View>
      );
    };

    const _renderItem = (data: any) => {
      const {index, item} = data;
      let templateStatus: any;
      const isLocalHasUploaded =
        currentTab === 0 &&
        organizationTemplates.some(
          (templateItem: ModelType & TemplateType) =>
            templateItem.Name === item.Name,
        );
      if (isLocalHasUploaded) {
        templateStatus = Icon.upload_blue;
      } else if (item.UploadStatus) {
        templateStatus = Icon.submit_blue;
      } else {
        templateStatus = Icon.write_blue;
      }

      let departmentText = '',
        itemColor = backgroundColorEnum[index % 14];
      if (currentTab === 1) {
        departmentText = item.departmentName
          ? item.departmentName
          : item.isDefault
          ? defaultDepartmentText
          : defaultDepartmentText;
        let dIndex = departmentListForColor.indexOf(departmentText);
        itemColor =
          dIndex > -1
            ? backgroundColorEnum[dIndex % 14]
            : backgroundColorEnum[index % 14];
      }
      if (item.isDefault) {
        itemColor = DColors.mainColor;
      }

      const creatorIcon = item.isDefault
        ? Icon.d2gIcon
        : item.CreatorPic
        ? {
            uri: item.CreatorPic,
          }
        : Icon.headerImageIcon;

      return (
        <View style={styles.itemContainer}>
          <TouchableWithoutFeedback
            onPress={() => {
              if (item.UploadStatus) {
                if (currentTab === 0) {
                  this.handleCollectData(item);
                } else if (currentTab === 1) {
                  this.handleCollectData(item);
                }
              } else {
                this.handleEdit(item);
              }
            }}>
            <View
              style={[
                styles.itemWrapper,
                {
                  backgroundColor: itemColor,
                },
              ]}>
              <View style={styles.creatorInfo}>
                <Image
                  style={{width: 20, height: 20, borderRadius: 10}}
                  source={creatorIcon}
                />
                <Text numberOfLines={1} style={styles.creatorText}>
                  {item.isDefault ? 'Sample' : item.CreatorName}
                </Text>
              </View>
              <View style={{flex: 1, marginTop: 8}}>
                <Text numberOfLines={2} style={styles.templateTitle}>
                  {item.Name}
                </Text>
              </View>
              <Text numberOfLines={1} style={styles.infoText}>
                {departmentText}
              </Text>
              <View style={styles.statusIcon}>
                {currentTab === 0 && !item.isDefault ? (
                  <Image
                    style={{
                      width: 12,
                      height: 12,
                      tintColor: '#fff',
                    }}
                    source={templateStatus}
                  />
                ) : null}
              </View>
            </View>
          </TouchableWithoutFeedback>
          {_renderQuickAction(item)}
        </View>
      );
    };

    const _renderQuickAction = (item: any) => {
      let controllers: any = [];
      if (!item.isDefault) {
        if (currentTab === 0) {
          if (canUploadTemplateToOrg(currentUserInfo)) {
            if (item.UploadStatus) {
              controllers.push(
                <TouchableOpacity
                  key="uploadToCompany"
                  onPress={() => this.handleUploadTemplateToCompany(item)}>
                  <View style={styles.actionImageWrapper}>
                    <Image
                      style={styles.actionImage}
                      source={Icon.upLoadIcon}
                    />
                  </View>
                </TouchableOpacity>,
              );
              controllers.push(
                <View
                  key="middleLine"
                  style={{
                    width: 1,
                    height: 27,
                    backgroundColor: '#E6E6E6',
                  }}
                />,
              );
            }
          }
          controllers.push(
            <TouchableOpacity
              key="deleteUserTemplate"
              onPress={() => {
                this.handleDeleteTemplate(item, 'User');
              }}>
              <View style={styles.actionImageWrapper}>
                <Image style={styles.actionImage} source={Icon.deleteIcon} />
              </View>
            </TouchableOpacity>,
          );
        }
        if (currentTab === 1) {
          if (canDownloadTemplateFromOrg(currentUserInfo)) {
            controllers.push(
              <TouchableOpacity
                key="downloadToLocal"
                onPress={() => {
                  this.handleDownloadCompanyToLocal(item);
                }}>
                <View style={styles.actionImageWrapper}>
                  <Image
                    style={styles.actionImage}
                    source={Icon.downloadIcon}
                  />
                </View>
              </TouchableOpacity>,
            );
          }
          if (canDeleteTemplateFromOrg(currentUserInfo)) {
            controllers.push(
              <View
                key="middleLine"
                style={{
                  width: 1,
                  height: 27,
                  backgroundColor: '#E6E6E6',
                }}
              />,
            );
            controllers.push(
              <TouchableOpacity
                key="deleteCompanyTemplate"
                onPress={() => {
                  this.handleDeleteTemplate(item, 'Company');
                }}>
                <View style={styles.actionImageWrapper}>
                  <Image style={styles.actionImage} source={Icon.deleteIcon} />
                </View>
              </TouchableOpacity>,
            );
          }
        }
      }

      const defaultTemplateLabel = (
        <View
          style={{
            ...styles.quickContainer,
            justifyContent: 'flex-start',
            paddingHorizontal: 12,
          }}>
          <Image
            style={{width: 16, height: 16, marginRight: 10}}
            source={Icon.defaultIcon}
          />
          <Text style={styles.defaultText}>Default</Text>
        </View>
      );
      let quickActionDom = null;
      if (currentTab === 0) {
        quickActionDom = controllers.length ? (
          <View style={styles.quickContainer}>{controllers}</View>
        ) : (
          defaultTemplateLabel
        );
      } else if (currentTab === 1) {
        quickActionDom =
          canDownloadTemplateFromOrg(currentUserInfo) ||
          canDeleteTemplateFromOrg(currentUserInfo) ? (
            controllers.length ? (
              <View style={styles.quickContainer}>{controllers}</View>
            ) : (
              defaultTemplateLabel
            )
          ) : null;
      }

      return quickActionDom;
    };

    const _renderBubble = () => {
      let positionTop = 0;
      let positionBottom3 = 0;
      if (Platform.OS === PlatFormAndroid) {
        positionTop = -183;
        positionBottom3 = -120;
      } else {
        positionTop = isIphoneX() || isIphoneXsMax() ? -139 : -163;
        positionBottom3 = isIphoneX() || isIphoneXsMax() ? -90 : -120;
      }
      return (
        <ReactModal transparent={true} visible={this.state.bubbleVisible}>
          <Image
            style={
              this.state.bubbleIndex === 3
                ? {...styles.bubbleStyle, bottom: positionBottom3}
                : styles.bubbleStyle
            }
            source={Bubble['bubble' + this.state.bubbleIndex]}
          />
          <TouchableWithoutFeedback onPress={this.handleGotIt}>
            <Image style={styles.bubbleButton} source={Bubble.button} />
          </TouchableWithoutFeedback>
        </ReactModal>
      );
    };

    let emptyTip = (
      <View style={styles.emptyWrapper}>
        <Image source={Icon.blankpage1} style={{width: 252, height: 178}} />
        <Text style={styles.emptyText}>You don’t have a template yet.</Text>
        <Text style={styles.emptyText}>Create it.</Text>
      </View>
    );

    return (
      <View style={styles.normal}>
        <StatusBar barStyle="light-content" translucent={true} />
        {_renderTabBar()}

        <FlatList
          showsVerticalScrollIndicator={false}
          data={dataSource}
          refreshing={refreshing}
          onRefresh={() => {
            this.handleFetchList(this.props, true);
          }}
          numColumns={2}
          contentContainerStyle={{
            paddingTop: Page.templateMargin,
            paddingBottom: Page.templateMargin,
            paddingLeft: Page.templateMargin,
          }}
          renderItem={(sectionItem: any) => _renderItem(sectionItem)}
          keyExtractor={(item: any, index: number) =>
            item.pKey + '_' + item.Name + index
          }
          extraData={this.state}
          ListEmptyComponent={emptyTip}
        />
        {_renderBubble()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#f3f3f3',
    // alignItems: "center"
  },
  tabWrapper: {
    flexDirection: 'row',
    width: deviceWidth,
    height: 48 + statusBarHeight,
    backgroundColor: DColors.mainColor,
    paddingTop: statusBarHeight,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabsStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: deviceWidth - 70 * 2,
    height: 48,
  },
  tabStyle: {
    width: (deviceWidth - 70 * 2) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabTextStyle: {
    fontFamily: Page.font_family,
    fontSize: 14,
    color: '#FFFFFF',
  },
  underLineStyle: {
    width: 40,
    height: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  imageWrapper: {
    width: 54,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStyle: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  itemContainer: {
    width: (deviceWidth - Page.templateMargin * 3) / 2,
    marginRight: Page.templateMargin,
    marginBottom: Page.templateMargin,
    borderRadius: 7,
    overflow: 'hidden',
  },
  itemWrapper: {
    height: 100,
    padding: 10,
  },
  templateTitle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    lineHeight: 18,
    color: '#fff',
  },
  defaultText: {
    fontSize: 14,
    color: '#2e2e2e',
  },
  creatorInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  creatorText: {
    fontFamily: Page.font_family,
    fontSize: 14,
    marginLeft: 10,
    width: 100,
    color: '#fff',
  },
  infoText: {
    fontFamily: Page.font_family,
    fontSize: 12,
    color: '#fff',
    textAlign: 'right',
  },
  statusIcon: {
    position: 'absolute',
    top: 7,
    right: 7,
  },
  quickContainer: {
    flex: 1,
    height: 33,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  actionImageWrapper: {
    width: (deviceWidth - Page.templateMargin * 3) / 4 - 2,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionImage: {
    width: 21,
    height: 21,
  },
  emptyWrapper: {
    width: 260,
    marginTop: (deviceHeight - statusBarHeight - 48 - 100 - 223) / 2,
    marginHorizontal: (deviceWidth - 260) / 2 - Page.templateMargin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 5,
    fontFamily: Page.font_family,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#96D0FC',
  },
  bubbleStyle: {
    position: 'absolute',
    width: deviceWidth,
    resizeMode: 'stretch',
    bottom: isIphoneX() || isIphoneXsMax() ? 0 : -30,
  },
  bubbleButton: {
    position: 'absolute',
    bottom: 150,
    left: deviceWidth / 2 + 20,
  },
});

const mapStateToProps = (state: any) => {
  const userId = state.loginInfo.currentUserInfo._id;
  const userTemplateDraftsMap = getIn(
      state,
      ['draft', 'userIdIndexedDrafts', userId, 'userTemplateDraftsMap'],
      [],
    ),
    companyReportDraftsMap = getIn(
      state,
      ['draft', 'userIdIndexedDrafts', userId, 'companyReportDraftsMap'],
      [],
    );
  let userTemplateDrafts: Array<ModelType & TemplateType> = [],
    companyReportDrafts: Array<ModelType & ReportType> = [];
  if (userTemplateDraftsMap.length) {
    state.draft.userTemplateDrafts.forEach((item: ModelType & TemplateType) => {
      if (userTemplateDraftsMap.includes(item.pKey)) {
        userTemplateDrafts.unshift(item);
      }
    });
  }
  if (companyReportDraftsMap.length) {
    state.draft.companyReportDrafts.forEach((item: ModelType & ReportType) => {
      if (companyReportDraftsMap.includes(item.pKey)) {
        companyReportDrafts.unshift(item);
      }
    });
  }
  return {
    userTemplateDrafts,
    companyReportDrafts,
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
    companyInfo: state.company.companyInfo,
    templates: state.template.templates,
    organizationTemplates: state.template.companyTemplates,
  };
};

export default connect(mapStateToProps)(TemplateList);
