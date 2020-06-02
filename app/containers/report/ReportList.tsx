import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  TouchableWithoutFeedback,
  Modal as RNModal,
  ActivityIndicator,
} from 'react-native';
import SwipeableFlatList from 'react-native-swipeable-list';
import {PlatFormAndroid} from '../../env';
import {DColors, FONT_FAMILY} from '../../common/styles';
import UUID from 'uuid/v1';
import {
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
  statusBarHeight,
  searchType,
  deviceHeight,
  getIn,
  requestApiV2,
  API_v2,
} from '../../common/utils';
import {formatServiceReportToLocal} from '../../store/sagas/report';
import {Toast, Modal} from '@ant-design/react-native';
import {
  fetchUserReports,
  fetchCompanyReports,
  previewReport,
  fetchReportInfo,
  deleteUserReportDraft,
  deleteCompanyReportDraft,
  uploadCompanyReport,
  copyReportAddToMine,
  deleteUserReport,
  deleteCompanyReport,
  createCompanyReportDraft,
} from '../../store/actions';
import {
  ReportType,
  TemplateType,
  ModelType,
} from '../../common/constants/ModeTypes';
import moment from 'moment';
import {TitleBarNew} from '../../common/components';
import {canDeleteDataFromOrg, isStaffInCompany} from '../template/judgement';
import {toastTips, LOGIN_IN} from '../../common/constants';

interface State {
  hadFetch: boolean;
  refreshing: boolean;
  page: {
    index: number;
    pageSize: number;
    total: number;
  };
  loadMore: number;
}
interface Props {
  navigation: any;
  authToken: string;
  currentUserInfo: any;
  companyInfo: any;
  authPkey: string;
  userReportDrafts: Array<ModelType & ReportType>;
  companyReportDrafts: Array<ModelType & ReportType>;
  organizationReports: Array<ModelType & ReportType>;
  dispatch: Function;
}
const Page = {
  font_family: FONT_FAMILY,
};
const Icon = {
  searchIcon: require('../images/Me/search.png'),
  AdminIcon: require('../images/template/Administration.png'),
  upLoadIcon: require('../images/template/Upload.png'),
  deleteIcon: require('../images/template/Delete_red.png'),
  recallIcon: require('../images/template/recall.png'),
  downloadIcon: require('../images/template/download.png'),
  triangleIcon: require('../images/template/triangle.png'),
  rightIcon: require('../images/template/Right.png'),
  editIcon: require('../images/template/Edit.png'),
  write_white: require('../images/template/write_white.png'),
  submit_white: require('../images/template/submit_white.png'),
  upload_grey: require('../images/template/upload_grey.png'),
  upload_blue: require('../images/template/upload_blue.png'),
  blankpage2: require('../images/template/blankpage2.png'),
};

let contentOffsetY = 0;
let canAction = false;

export class ReportList extends Component<Props, State> {
  swipeableList: any;
  viewDidAppear: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      hadFetch: false,
      refreshing: false,
      page: {
        index: 1,
        pageSize: 10,
        total: 0,
      },
      loadMore: 0, // 0 隐藏 1 加载中 2 没有更多了
    };
  }

  componentWillMount() {
    this.handleFetchList(this.props);
  }

  componentDidMount() {
    this.viewDidAppear = this.props.navigation.addListener(
      'willFocus',
      (navigationProps: any) => {
        this.swipeableList._onClose();
        // console.log("页面将要显示", navigationProps);
      },
    );
  }

  componentWillUnmount() {
    this.viewDidAppear.remove();
    this.swipeableList = null;
  }

  componentWillReceiveProps(nextProps: any) {
    this.handleFetchList(nextProps);
  }

  handleFetchList = (props: Props, refresh = false) => {
    const {authToken, organizationReports, navigation} = props;
    const {hadFetch, page} = this.state;
    const selectedTemplate = navigation.getParam('selectedTemplate');
    canAction = false;
    if (!hadFetch || refresh) {
      this.setState({hadFetch: true, refreshing: true});
      this.props.dispatch(
        fetchCompanyReports(
          authToken,
          {
            templateId: selectedTemplate._id,
            page: page.index,
            pageSize: page.pageSize,
          },
          (page: any) => {
            this.setState(prevState => ({
              ...prevState,
              page: {
                ...prevState.page,
                ...page,
              },
              loadMore: 0,
            }));
          },
          () => {
            this.setState({refreshing: false, loadMore: 0});
          },
        ),
      );
    } else {
      this.setState({refreshing: false});
    }
  };

  handleSelectReportPreview = (reportItem: ModelType & ReportType) => {
    const {navigation, currentUserInfo} = this.props;
    const navigateFunction = () => {
      this.props.navigation.navigate('ReportPreview', {});
    };
    if (reportItem.UploadStatus) {
      this.props.dispatch(
        fetchReportInfo(
          currentUserInfo.authToken,
          reportItem.pKey,
          navigateFunction,
        ),
      );
    } else {
      this.props.dispatch(previewReport(reportItem));
      navigateFunction();
    }
  };

  handleSelectReportEdit = (reportItem: ModelType & ReportType) => {
    const {navigation, currentUserInfo} = this.props;
    const navigateFunction = () => {
      this.props.navigation.navigate('CollectData', {
        type: 'Edit',
      });
    };
    if (reportItem.UploadStatus) {
      this.props.dispatch(
        fetchReportInfo(
          currentUserInfo.authToken,
          reportItem.pKey,
          navigateFunction,
        ),
      );
    } else {
      this.props.dispatch(previewReport(reportItem));
      navigateFunction();
    }
  };

  // 撤回company data
  handleRecallCompanyReportToDraft = (item: ModelType & ReportType) => {
    const {authToken, currentUserInfo} = this.props;
    Modal.alert(
      'Are you sure to recall this?',
      'The data will be retracted to draft',
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
            setTimeout(() => {
              requestApiV2(
                API_v2.getReportInfo,
                {reportId: item.pKey},
                authToken,
              )
                .then(res => {
                  if (res.result === 'Success') {
                    const reportDetail = formatServiceReportToLocal(res.data);
                    this.props.dispatch(
                      deleteCompanyReport(
                        authToken,
                        item.pKey,
                        () => {
                          this.props.dispatch(
                            createCompanyReportDraft(currentUserInfo._id, {
                              ...reportDetail,
                              pKey: UUID(),
                              UploadStatus: 0,
                              code: '',
                            }),
                          );
                          Toast.success('Successfully withdrawal', 1);
                        },
                        true,
                      ),
                    );
                  } else {
                    Toast.fail('Delete data failed!');
                  }
                })
                .catch(error => {
                  console.error(error);
                });
            }, 500);
          },
        },
      ],
    );
    this.swipeableList._onClose();
  };

  // 删除Local Data
  handleDeleteData = (item: ModelType & ReportType, reportType: string) => {
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
            if (reportType === 'User') {
              this.submitDeleteUserReport(item);
            } else if (reportType === 'Company') {
              this.submitDeleteOrgReport(item);
            }
          }, 500);
        },
      },
    ]);
  };

  submitDeleteUserReport = (item: ModelType & ReportType) => {
    const {authToken, currentUserInfo} = this.props;
    if (item.UploadStatus) {
      this.props.dispatch(deleteUserReport(authToken, item.pKey));
    } else {
      this.props.dispatch(
        deleteUserReportDraft(currentUserInfo._id, item.pKey),
      );
    }
    this.swipeableList._onClose();
  };

  submitDeleteOrgReport = (item: ModelType & ReportType) => {
    const {authToken, currentUserInfo} = this.props;
    if (item.UploadStatus) {
      this.props.dispatch(deleteCompanyReport(authToken, item.pKey));
    } else {
      this.props.dispatch(
        deleteCompanyReportDraft(currentUserInfo._id, item.pKey),
      );
    }

    this.swipeableList._onClose();
  };

  onEndReached = () => {
    const {loadMore, page} = this.state;
    let {index, pageSize, total} = page;
    console.log('load more', index, Math.ceil(total / pageSize), canAction);
    // 最后一页
    if (index === Math.ceil(total / pageSize)) {
      this.setState({loadMore: 2});
      return;
    }

    if (!canAction) return;
    //如果是正在加载中或没有更多数据了，则返回
    if (loadMore !== 0) {
      return;
    }

    //如果当前页大于或等于总页数，那就是到最后一页了，返回
    if (index !== 1 && index >= Math.ceil(total / pageSize)) {
      return;
    } else {
      index++;
    }
    canAction = false;
    this.setState(
      prevState => ({
        ...prevState,
        page: {
          ...prevState.page,
          index,
        },
        loadMore: 1,
      }),
      () => {
        this.handleFetchList(this.props, true);
      },
    );
  };

  onRefresh = () => {
    console.log('---onRefresh');
    this.setState(
      prevState => ({
        ...prevState,
        page: {
          ...prevState.page,
          index: 1,
        },
        loadMore: 0,
      }),
      () => {
        this.handleFetchList(this.props, true);
      },
    );
  };

  render() {
    const {
      organizationReports,
      authPkey,
      currentUserInfo,
      companyInfo,
      navigation,
      userReportDrafts,
      companyReportDrafts,
    } = this.props;
    const {refreshing} = this.state;
    const selectedTemplate = navigation.getParam('selectedTemplate');
    const title = navigation.getParam('title');
    const currentCompanyName =
      currentUserInfo && currentUserInfo.companyName
        ? currentUserInfo.companyName
        : '';

    // console.log('render page', this.state.page);

    const _renderItem = (data: any) => {
      const {item} = data;
      const itemColor = navigation.getParam('itemColor');

      let departmentText = '';
      const defaultDepartmentText = 'All Departments';
      departmentText = selectedTemplate.departmentName
        ? selectedTemplate.departmentName
        : selectedTemplate.isDefault
        ? defaultDepartmentText
        : defaultDepartmentText;

      let saveStu: any, submitStu: any;
      if (item.UploadStatus) {
        submitStu = Icon.submit_white;
      } else {
        saveStu = Icon.write_white;
      }
      return (
        <TouchableWithoutFeedback
          onPress={() => {
            item.UploadStatus
              ? this.handleSelectReportPreview(item)
              : this.handleSelectReportEdit(item);
          }}>
          <View
            style={{
              ...styles.itemWrapper,
              backgroundColor: itemColor || selectedTemplate.color,
            }}>
            <View style={styles.leftDate}>
              <Text style={styles.createdAtTextBig}>
                {item.createdAt ? moment(item.createdAt).format('D') : ''}
              </Text>
              <Text style={styles.regularText}>
                {item.createdAt ? moment(item.createdAt).format('MMM') : ''}
              </Text>
            </View>
            <View style={styles.middleLine} />
            <View style={styles.itemInfo}>
              <Text numberOfLines={1} style={{...styles.regularText}}>
                {item.CreatorName || item.anonymityType || 'Anonymity'}
              </Text>
              <Text numberOfLines={1} style={{...styles.regularText}}>
                {departmentText}
              </Text>
              <Text style={styles.regularText}>
                {item.createdAt ? moment(item.createdAt).format('HH:mm') : ''}
              </Text>
            </View>
            <Text numberOfLines={1} style={styles.templateTitle}>
              {'ID: ' + item.Name}
            </Text>
            <View style={styles.statusIcon}>
              {saveStu && (
                <Image style={{width: 17, height: 17}} source={saveStu} />
              )}
              {submitStu && (
                <Image style={{width: 17, height: 20}} source={submitStu} />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    };

    const _renderQuickAction = (data: any) => {
      let {item} = data;
      let controllers: any = [];
      if (item.UploadStatus && item.User_pKey_Creator === authPkey) {
        // 本人提交的Company Data 本人可撤回到草稿
        controllers.push(
          <TouchableOpacity
            key="deleteCompanyTemplate"
            style={{marginLeft: 12}}
            onPress={() => {
              this.handleRecallCompanyReportToDraft(item);
            }}>
            <View style={styles.actionImageWrapper}>
              <Image source={Icon.recallIcon} />
            </View>
          </TouchableOpacity>,
        );
      } else if (
        item.UploadStatus &&
        canDeleteDataFromOrg(currentUserInfo) &&
        item.User_pKey_Creator !== authPkey
      ) {
        // 非本人提交的Company Data 管理员可删除
        controllers.push(
          <TouchableOpacity
            key="deleteCompanyTemplate"
            style={{marginLeft: 12}}
            onPress={() => {
              this.handleDeleteData(item, 'Company');
            }}>
            <View style={styles.actionImageWrapper}>
              <Image style={styles.actionImage} source={Icon.deleteIcon} />
            </View>
          </TouchableOpacity>,
        );
      } else if (!item.UploadStatus) {
        controllers.push(
          <TouchableOpacity
            key="deleteCompanyTemplate"
            style={{marginLeft: 12}}
            onPress={() => {
              this.handleDeleteData(item, 'Company');
            }}>
            <View style={styles.actionImageWrapper}>
              <Image style={styles.actionImage} source={Icon.deleteIcon} />
            </View>
          </TouchableOpacity>,
        );
      }
      return <View style={styles.quickContainer}>{controllers}</View>;
    };

    let emptyTip = (
      <View style={styles.emptyWrapper}>
        <Image source={Icon.blankpage2} />
        <Text style={styles.emptyText}>You don’t have a data yet.</Text>
        <Text style={styles.emptyText}>Create it.</Text>
      </View>
    );

    let dataSource = [...companyReportDrafts, ...organizationReports].filter(
      item => item.TemplatepKey === selectedTemplate.pKey,
    );
    if (title === 'My') {
      dataSource = dataSource.filter(
        item =>
          item.User_pKey_Creator === authPkey || item.User_pKey_Creator === '',
      );
    } else if (title === 'Others') {
      dataSource = dataSource.filter(
        item =>
          item.User_pKey_Creator !== '' && item.User_pKey_Creator !== authPkey,
      );
    }
    let quickWidth = 60;

    const _renderFooter = () => {
      const {loadMore} = this.state;
      if (loadMore === 2) {
        return (
          <View
            style={{
              ...styles.footer,
              height: 30,
            }}>
            <Text
              style={{
                color: '#999999',
                fontSize: 14,
                marginTop: 5,
                marginBottom: 5,
              }}>
              No more data
            </Text>
          </View>
        );
      } else if (loadMore === 1) {
        return (
          <View style={styles.footer}>
            <ActivityIndicator style={{marginRight: 10}} />
            <Text>Loading...</Text>
          </View>
        );
      } else if (loadMore === 0) {
        return (
          <View style={styles.footer}>
            <Text />
          </View>
        );
      }
    };

    return (
      <View style={styles.normal}>
        <TitleBarNew
          middleStyle={{maxWidth: deviceWidth - 160}}
          title={selectedTemplate.Name}
          navigation={navigation}
        />
        <SwipeableFlatList
          ref={(ref: any) => (this.swipeableList = ref)}
          showsVerticalScrollIndicator={false}
          data={dataSource}
          refreshing={refreshing}
          onRefresh={this.onRefresh}
          contentContainerStyle={{
            paddingBottom: setSizeWithPx(80),
          }}
          renderItem={(sectionItem: any) => _renderItem(sectionItem)}
          keyExtractor={(item: any, index: number) => '' + index}
          extraData={this.state}
          renderQuickActions={(item: any) => _renderQuickAction(item)} //侧滑展示的View
          maxSwipeDistance={quickWidth} //侧滑最大距离
          bounceFirstRowOnMount={false}
          ListEmptyComponent={emptyTip}
          ListFooterComponent={_renderFooter()}
          onEndReached={() => {
            setTimeout(() => {
              this.onEndReached();
            }, 100);
          }}
          onEndReachedThreshold={0.2}
          onScrollBeginDrag={(event: any) => {
            console.log('onScrollBeginDrag', event.nativeEvent.contentOffset.y);
            canAction = false;
            contentOffsetY = event.nativeEvent.contentOffset.y;
          }}
          onScrollEndDrag={(event: any) => {
            console.log('onScrollEndDrag', event.nativeEvent.contentOffset.y);
            if (event.nativeEvent.contentOffset.y > contentOffsetY) {
              canAction = true;
            }
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  filterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    width: 65,
  },
  topText: {
    fontFamily: Page.font_family,
    fontSize: 20,
    color: '#FFFFFF',
  },
  tabsStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: deviceWidth - 65 * 2,
    height: 48,
  },
  tabStyle: {
    width: (deviceWidth - 65 * 2) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabTextStyle: {
    fontFamily: Page.font_family,
    fontSize: 20,
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
    height: 108,
    backgroundColor: '#4AADF7',
    paddingVertical: 20,
    paddingHorizontal: 25,
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftDate: {
    minWidth: 25,
    flexDirection: 'column',
    alignItems: 'center',
  },
  templateTitle: {
    position: 'absolute',
    top: 10,
    right: 20,
    fontFamily: Page.font_family,
    fontSize: 10,
    lineHeight: 12,
    color: '#FFFFFF',
  },
  itemInfo: {
    width: deviceWidth - 170,
    height: 64,
    marginTop: 8,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  createdAtTextBig: {
    fontFamily: Page.font_family,
    fontSize: 24,
    lineHeight: 26,
    color: '#fff',
  },
  regularText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    lineHeight: 18,
    color: '#fff',
  },
  middleLine: {
    width: 2,
    height: 68,
    backgroundColor: '#FFFFFF',
    marginLeft: 16,
    marginRight: 13,
  },
  statusIcon: {
    position: 'absolute',
    bottom: 13,
    right: 24,
  },
  quickContainer: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionImageWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionImage: {
    width: 21,
    height: 21,
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
  emptyWrapper: {
    width: '100%',
    // height: deviceHeight - statusBarHeight - 48 - 49,
    marginTop: (deviceHeight - statusBarHeight - 48 - 49 - 223) / 2,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#96D0FC',
  },
  footer: {
    flexDirection: 'row',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
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
    authPkey: state.loginInfo.currentUserInfo._id,
    organizationReports: state.report.companyReports,
  };
};

export default connect(mapStateToProps)(ReportList);
