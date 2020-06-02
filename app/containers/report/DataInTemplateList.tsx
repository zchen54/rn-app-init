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
  Modal as RNModal,
} from 'react-native';
import {PlatFormAndroid} from '../../env';
import {DColors, FONT_FAMILY} from '../../common/styles';
import {
  requestApiV2,
  API_v2,
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
  statusBarHeight,
  searchType,
  deviceHeight,
  isIphoneX,
  isIphoneXsMax,
  isNetworkConnected,
  getAutoSubmitDraft,
  getIsFirstBubble,
  setIsFirstBubble,
  getIn,
  randomTemplateColor,
  backgroundColorEnum,
} from '../../common/utils';
import {NetworkStateBar, TitleBarNew} from '../../common/components';
import {Toast, Modal} from '@ant-design/react-native';
import {
  fetchUserReports,
  fetchCompanyReports,
  fetchUserTemplates,
  fetchCompanyTemplates,
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
  isStaffInCompany,
} from '../template/judgement';
import {toastTips, LOGIN_IN} from '../../common/constants';

interface State {
  hadFetch: boolean;
  refreshing: boolean;
  title: string;
  modalVisible: boolean;
}
interface Props {
  navigation: any;
  authToken: string;
  currentUserInfo: any;
  companyInfo: any;
  userReportDrafts: Array<ModelType & ReportType>;
  companyReportDrafts: Array<ModelType & ReportType>;
  organizationReports: Array<ModelType & ReportType>;
  templates: Array<ModelType & TemplateType>;
  organizationTemplates: Array<ModelType & TemplateType>;
  dispatch: Function;
}

const Page = {
  font_family: FONT_FAMILY,
  templateMargin: 16,
};

const Icon = {
  searchIcon: require('../images/Me/search.png'),
  blankpage2: require('../images/template/blankpage2.png'),
  headerImageIcon: require('../images/Me/Portrait.png'),
  triangleIcon: require('../images/template/triangle.png'),
  rightIcon: require('../images/template/Right.png'),
  d2gIcon: require('../images/Me/about.png'),
};
let busy = false;

export class TemplateList extends Component<Props, State> {
  viewDidAppear: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      hadFetch: true,
      refreshing: true,
      title: 'All',
      modalVisible: false,
    };
  }

  componentWillMount() {}

  componentDidMount() {
    this.viewDidAppear = this.props.navigation.addListener(
      'willFocus',
      (navigationProps: any) => {
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

  handleFetchList = (props: Props, refresh = false) => {
    const {authToken, templates, organizationTemplates} = props;
    const {hadFetch} = this.state;
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
  };

  handleClickTemplate = (selectedTemplate: any, itemColor: string) => {
    const {title} = this.state;
    this.props.navigation.navigate('ReportList', {
      title: title,
      selectedTemplate: selectedTemplate,
      itemColor,
    });
  };

  handleSelectFilter = (key: string) => {
    this.setState({
      title: key,
      modalVisible: false,
    });
  };

  render() {
    if (Platform.OS === PlatFormAndroid) {
      StatusBar.setBackgroundColor('rgba(0,0,0,0)', true);
      StatusBar.setTranslucent(true);
    }
    const {
      organizationReports,
      currentUserInfo,
      companyInfo,
      templates,
      organizationTemplates,
      userReportDrafts,
      companyReportDrafts,
    } = this.props;
    const {refreshing, title, modalVisible} = this.state;
    const currentCompanyName = currentUserInfo.companyName || '';

    let dataSource = organizationTemplates;

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

    const _renderTopTrue = () => {
      const topStyle =
        Platform.OS === PlatFormAndroid
          ? {...styles.tabWrapper, height: 48, paddingTop: 0}
          : {...styles.tabWrapper};
      return (
        <View style={topStyle}>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                modalVisible: false,
              });
            }}>
            <View style={styles.filterWrap}>
              <Text style={styles.topText}>{title}</Text>
              <Image
                style={{width: 8, height: 5, marginLeft: 8}}
                source={Icon.triangleIcon}
              />
            </View>
          </TouchableOpacity>
        </View>
      );
    };

    const _renderItem = (data: any) => {
      const {index, item} = data;

      let departmentText = '',
        itemColor = backgroundColorEnum[index % 14];
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
        <TouchableWithoutFeedback
          onPress={() => {
            this.handleClickTemplate(item, itemColor);
          }}>
          <View style={[styles.itemWrapper, {backgroundColor: itemColor}]}>
            <View style={styles.creatorInfo}>
              <Image
                style={{width: 20, height: 20, borderRadius: 10}}
                source={creatorIcon}
              />
              <Text numberOfLines={1} style={styles.creatorText}>
                {item.CreatorName}
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
          </View>
        </TouchableWithoutFeedback>
      );
    };

    let emptyTip = (
      <View style={styles.emptyWrapper}>
        <Image source={Icon.blankpage2} style={{width: 252, height: 178}} />
        <Text style={styles.emptyText}>You don’t have a data yet.</Text>
        <Text style={styles.emptyText}>Create it.</Text>
      </View>
    );

    // console.log('template dataSource', dataSource);

    return (
      <View style={styles.normal}>
        <TitleBarNew
          title={'Data'}
          navigation={null}
          hideLeftArrow={true}
          right={<Image style={styles.imageStyle} source={Icon.searchIcon} />}
          pressRight={() => {
            this.props.navigation.navigate('FuzzySearchAll', {
              type: searchType.ReportName,
            });
          }}
        />
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
        <RNModal
          animationType="fade"
          transparent={true}
          onRequestClose={() => {
            this.setState({
              modalVisible: false,
            });
          }}
          visible={modalVisible}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              this.setState({
                modalVisible: false,
              });
            }}
            style={styles.ModalStyle}>
            {_renderTopTrue()}
            <View>
              <TouchableWithoutFeedback
                onPress={() => {
                  this.handleSelectFilter('All');
                }}>
                <View style={styles.modalItemWrapper}>
                  <Text
                    style={
                      title === 'All'
                        ? {...styles.modalText, color: '#1E9DFC'}
                        : styles.modalText
                    }>
                    All
                  </Text>
                  {title === 'All' ? (
                    <Image
                      style={{width: 15, height: 10}}
                      source={Icon.rightIcon}
                    />
                  ) : null}
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback
                onPress={() => {
                  this.handleSelectFilter('My');
                }}>
                <View style={styles.modalItemWrapper}>
                  <Text
                    style={
                      title === 'My'
                        ? {...styles.modalText, color: '#1E9DFC'}
                        : styles.modalText
                    }>
                    My
                  </Text>
                  {title === 'My' ? (
                    <Image
                      style={{width: 15, height: 10}}
                      source={Icon.rightIcon}
                    />
                  ) : null}
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback
                onPress={() => {
                  this.handleSelectFilter('Others');
                }}>
                <View style={styles.modalItemWrapper}>
                  <Text
                    style={
                      title === 'Others'
                        ? {...styles.modalText, color: '#1E9DFC'}
                        : styles.modalText
                    }>
                    Others
                  </Text>
                  {title === 'Others' ? (
                    <Image
                      style={{width: 15, height: 10}}
                      source={Icon.rightIcon}
                    />
                  ) : null}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableOpacity>
        </RNModal>
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
  filterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    width: 70,
  },
  topText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#FFFFFF',
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

  itemWrapper: {
    width: (deviceWidth - Page.templateMargin * 3) / 2,
    marginRight: Page.templateMargin,
    marginBottom: Page.templateMargin,
    borderRadius: 7,
    overflow: 'hidden',
    height: 100,
    padding: 10,
  },
  templateTitle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    lineHeight: 18,
    color: '#fff',
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
  ModalStyle: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    paddingLeft: setSizeWithPx(75),
    paddingRight: setSizeWithPx(75),
  },
  modalItemWrapper: {
    flexDirection: 'row',
    width: deviceWidth,
    height: 52,
    alignItems: 'center',
    paddingLeft: 17,
    paddingRight: 17,
    top: 0,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  modalText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#757575',
  },
});

const mapStateToProps = (state: any) => {
  const userId = state.loginInfo.currentUserInfo._id;
  const userReportDraftsMap = getIn(
      state,
      ['draft', 'userIdIndexedDrafts', userId, 'userReportDraftsMap'],
      [],
    ),
    companyReportDraftsMap = getIn(
      state,
      ['draft', 'userIdIndexedDrafts', userId, 'companyReportDraftsMap'],
      [],
    );
  let userReportDrafts: Array<ModelType & ReportType> = [],
    companyReportDrafts: Array<ModelType & ReportType> = [];
  if (userReportDraftsMap.length) {
    state.draft.userReportDrafts.forEach((item: ModelType & ReportType) => {
      if (userReportDraftsMap.includes(item.pKey)) {
        userReportDrafts.unshift(item);
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
    userReportDrafts,
    companyReportDrafts,
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
    companyInfo: state.company.companyInfo,
    organizationReports: state.report.companyReports,
    templates: state.template.templates,
    organizationTemplates: state.template.companyTemplates,
  };
};

export default connect(mapStateToProps)(TemplateList);
