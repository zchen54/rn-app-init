import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {Button, Toast, Modal} from '@ant-design/react-native';
import {
  TitleBarWithTabs,
  TitleBarNew,
  SearchInput,
  formatSearchResultText,
} from '../../common/components';
import {
  previewReport,
  duplicateData,
  fetchReportInfo,
  fetchUserReports,
  fetchCompanyReports,
} from '../../store/actions';
import {
  setSizeWithPx, // 设置字体 px 转 dp
  deviceWidth,
  searchType,
  fuzzySearchTools,
} from '../../common/utils';
import {FONT_FAMILY} from '../../common/styles';
import {
  ReportType,
  TemplateType,
  ModelType,
} from '../../common/constants/ModeTypes';
import moment from 'moment';
import {isStaffInCompany, isAdmin} from '../template/judgement';

let Icon = {
  rightIcon: require('../images/template/right_choose.png'),
};
const Page = {
  font_family: FONT_FAMILY,
};
interface State {
  searchValue: string;
  selectedReportData: any;
  checkReportPkey: string;
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
  authPkey: string;
  organizationReports: Array<ModelType & ReportType>;
  currentUserInfo: any;
  dispatch: Function;
}

let contentOffsetY = 0;
let canAction = false;

export class SelectReportScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchValue: '',
      selectedReportData: {},
      checkReportPkey: '',
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

  componentWillReceiveProps(nextProps: Props) {
    this.handleFetchList(nextProps);
  }

  handleFetchList = (props: Props, refresh = false) => {
    const {navigation, currentUserInfo} = props;
    const {hadFetch, page} = this.state;
    const hasCompany = isStaffInCompany(currentUserInfo);
    canAction = false;
    if (!hadFetch || refresh) {
      this.setState({hadFetch: true, refreshing: true});
      this.props.dispatch(
        fetchCompanyReports(
          currentUserInfo.authToken,
          {
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

  handleSearchChange = (value: string) => {
    this.setState({
      searchValue: value,
    });
  };

  handleConfirm = () => {
    const {navigation, currentUserInfo} = this.props;
    const {checkReportPkey, selectedReportData} = this.state;
    const action = navigation.getParam('action');
    if (checkReportPkey === '') {
      Toast.fail('Please select data', 1, undefined, false);
      return;
    }
    if (action === 'editData' || action === 'copyData') {
      if (action === 'editData') {
        if (selectedReportData.UploadStatus) {
          this.props.dispatch(
            fetchReportInfo(currentUserInfo.authToken, selectedReportData.pKey),
          );
        } else {
          this.props.dispatch(previewReport(selectedReportData));
        }
      } else {
        this.props.dispatch(
          duplicateData(currentUserInfo.authToken, selectedReportData.pKey),
        );
      }
      setTimeout(() => {
        this.props.navigation.navigate('CollectData', {
          type: action === 'copyData' ? 'Create' : 'Edit',
        });
      }, 100);

      return;
    }
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
      navigation,
      authPkey,
      organizationReports,
      currentUserInfo,
    } = this.props;
    const {refreshing, searchValue, checkReportPkey} = this.state;
    const action = navigation.getParam('action');
    const hasCompany = isStaffInCompany(currentUserInfo);
    let showReports,
      dataSource: Array<any> = [];

    if (action === 'editData') {
      if (isAdmin(currentUserInfo)) {
        // 管理员显示所有organizationReports
        dataSource = organizationReports;
      } else if (isStaffInCompany(currentUserInfo)) {
        // 员工显示自己的organizationReports
        dataSource = organizationReports.filter(
          item => item.User_pKey_Creator === authPkey,
        );
      }
    } else if (action === 'copyData') {
      dataSource = organizationReports;
    }
    if (searchValue === '') {
      showReports = dataSource;
    } else {
      showReports = dataSource.filter(item =>
        fuzzySearchTools(searchValue, item.Name),
      );
    }

    const _renderItem = (data: any) => {
      const {index, item} = data;

      return (
        <View>
          <TouchableOpacity
            onPress={() => {
              checkReportPkey === item.pKey
                ? this.setState({checkReportPkey: '', selectedReportData: {}})
                : this.setState({
                    checkReportPkey: item.pKey,
                    selectedReportData: item,
                  });
            }}>
            <View style={{marginBottom: 16}}>
              <View style={styles.itemWrapper}>
                <View style={styles.itemLeft}>
                  <Text numberOfLines={2} style={styles.templateTitle}>
                    {formatSearchResultText(item.Name, searchValue)}
                  </Text>
                  <View style={styles.itemInfo}>
                    <Text
                      style={{...styles.infoText, width: deviceWidth - 290}}
                      numberOfLines={1}>
                      {item.CreatorName || item.anonymityType || 'Anonymity'}
                    </Text>
                    <Text style={styles.infoText}>
                      {moment(item.createdAt).format('MMM D, YYYY HH:mm')}
                    </Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  {checkReportPkey === item.pKey ? (
                    <Image
                      style={{...styles.cricle, borderWidth: 0}}
                      source={Icon.rightIcon}
                    />
                  ) : (
                    <View style={styles.cricle} />
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    };

    const tabs = hasCompany
      ? [{title: 'ORGANIZATION', key: 1}, {title: 'PERSONAL', key: 0}]
      : [{title: 'Data', key: 0}];

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
        <TitleBarNew title={'Select Data'} navigation={navigation} />
        {/* <View style={styles.searchBarWrapper}>
          <SearchInput value={searchValue} onChange={this.handleSearchChange} />
        </View> */}
        <View style={{alignItems: 'center', flex: 1, paddingTop: 16}}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={showReports}
            renderItem={sectionItem => _renderItem(sectionItem)}
            keyExtractor={(item: any, index: number) => item.pKey + '' + index}
            extraData={this.state}
            refreshing={refreshing}
            onRefresh={this.onRefresh}
            ListFooterComponent={_renderFooter()}
            onEndReached={() => {
              setTimeout(() => {
                this.onEndReached();
              }, 100);
            }}
            onEndReachedThreshold={0.2}
            onScrollBeginDrag={(event: any) => {
              console.log(
                'onScrollBeginDrag',
                event.nativeEvent.contentOffset.y,
              );
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
          <Button
            disabled={!checkReportPkey ? true : undefined}
            onPress={this.handleConfirm}
            style={styles.buttonStyle}
            type={checkReportPkey ? 'primary' : undefined}>
            {action === 'editData'
              ? 'Edit Data'
              : action === 'copyData'
              ? 'Copy Data'
              : 'Confirm'}
          </Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  searchBarWrapper: {
    marginVertical: 16,
    marginHorizontal: 17,
    width: deviceWidth - 34,
  },
  itemWrapper: {
    width: deviceWidth - 34,
    height: 120,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingLeft: 21,
    paddingBottom: 18,
    paddingRight: 17,
    borderRadius: 7,
  },
  itemLeft: {
    width: '85%',
    height: 78,
  },
  itemRight: {
    justifyContent: 'center',
  },
  templateTitle: {
    width: '100%',
    height: 55,
    fontFamily: Page.font_family,
    fontSize: 18,
    color: '#2E2E2E',
  },
  itemInfo: {
    marginTop: 6,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoText: {
    fontFamily: Page.font_family,
    fontSize: 14,
    color: '#757575',
  },
  cricle: {
    width: 20,
    height: 20,
    marginLeft: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#999999',
  },
  buttonStyle: {
    marginVertical: 6,
    width: deviceWidth - 34,
    height: 40,
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
  return {
    authPkey: state.loginInfo.currentUserInfo._id,
    organizationReports: state.report.companyReports,
    currentUserInfo: state.loginInfo.currentUserInfo,
  };
};

export default connect(mapStateToProps)(SelectReportScreen);
