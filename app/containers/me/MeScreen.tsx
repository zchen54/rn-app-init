import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {Modal, Toast, Portal, NoticeBar} from '@ant-design/react-native';
import {TitleBarNew} from '../../common/components';
import {PlatFormAndroid} from '../../env';
import {
  fetchMessage,
  fetchUserRole,
  fetchFriendList,
  fetchNewMessageCount,
  updateNewMessageCount,
  fetchAllData,
  updateCurrentUserInfo,
} from '../../store/actions';
import {DColors, FONT_FAMILY} from '../../common/styles';
import {deviceWidth, getIn, requestApiV2, API_v2} from '../../common/utils';

interface State {}
interface Props {
  navigation: any;
  message: Array<any>;
  newMessageCount: number;
  authToken: string;
  currentUserInfo: any;
  dispatch: Function;
}
const Page = {
  font_family: FONT_FAMILY,
};

const Icon = {
  MessageIcon: require('../images/Me/message.png'),
  NewMessageIcon: require('../images/Me/Message_new.png'),
  EnterIcon: require('../images/Me/enterwhite.png'),
  FriendsIcon: require('../images/Me/friend.png'),
  GroupIcon: require('../images/Me/Group.png'),
  OrganizationIcon: require('../images/Me/Organization.png'),
  SettingIcon: require('../images/Me/setting.png'),
  CollectDataIcon: require('../images/Index-Login/Work_Collect.png'),
  CreateOrgIcon: require('../images/Me/Create_org.png'),
  headerImageIcon: require('../images/Me/Portrait.png'),
  AddScanIcon: require('../images/Me/Add_scan.png'),
};

export class MeScreen extends Component<Props, State> {
  viewDidAppear: any;
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    const {authToken} = this.props;
    this.props.dispatch(fetchFriendList(authToken));
  }
  componentDidMount() {
    this.viewDidAppear = this.props.navigation.addListener(
      'willFocus',
      (navigationProps: any) => {
        // console.log("页面将要显示", navigationProps);
        StatusBar.setBarStyle('light-content', true);
        this.handleFetchData();
      },
    );
  }

  componentWillUnmount() {
    this.viewDidAppear.remove();
  }

  handleFetchData = () => {
    const {authToken, currentUserInfo} = this.props;

    // 获取未读消息数量
    requestApiV2(API_v2.getMessageUnreadCount, null, authToken)
      .then(res => {
        if (res.result === 'Success') {
          this.props.dispatch(updateNewMessageCount(res.data));
        } else if (res.error) {
          Modal.alert('Fetch new message count failed !', res.error, [
            {text: 'OK', onPress: () => {}},
          ]);
        }
      })
      .catch(error => {
        Toast.fail(error, 2);
      });

    // 判断用户权限是否变更
    requestApiV2(API_v2.getUserInfo, null, authToken)
      .then(res => {
        if (res.result === 'Success') {
          if (res.data && res.data.roleType === 4) {
            this.props.navigation.navigate('PersonalUser');
          } else if (currentUserInfo.companyName !== res.data.companyName) {
            // 公司有变动时更新App数据
            this.props.dispatch(fetchAllData(authToken, false));
          } else {
            this.props.dispatch(updateCurrentUserInfo(res.data));
          }
        } else if (res.error) {
          Modal.alert('Fetch user role failed !', res.error, [
            {text: 'OK', onPress: () => {}},
          ]);
        }
      })
      .catch(error => {
        Toast.fail(error, 2);
      });
  };

  render() {
    const {navigation, newMessageCount, currentUserInfo} = this.props;
    const {
      companyName,
      roleType,
      departmentName,
      companyAdmin,
      isFrozen,
    } = currentUserInfo;
    const isPersonalUser =
      companyName !== '' && [1, 2, 3].indexOf(roleType) > -1 ? false : true;
    // role: 1.SuperAdmin  2.Admin  3.Staff  4.Personal

    const renderTop = () => {
      const {currentUserInfo, navigation} = this.props;
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Profile')}>
          <View style={styles.topWrapper}>
            <View style={styles.topContainer}>
              <View style={{flexDirection: 'row'}}>
                <Image
                  style={styles.Avatar}
                  source={
                    currentUserInfo.userPic
                      ? {
                          uri: currentUserInfo.userPic,
                        }
                      : Icon.headerImageIcon
                  }
                />
                <View style={styles.userInfo}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.usernameStyle}>
                    {currentUserInfo.nickName}
                  </Text>
                  {companyName ? (
                    <Text numberOfLines={1} style={styles.infoTextStyle}>
                      {companyName}
                    </Text>
                  ) : null}
                  {currentUserInfo._id === companyAdmin ? (
                    <Text numberOfLines={1} style={styles.infoTextStyle}>
                      Administrator
                    </Text>
                  ) : departmentName ? (
                    <Text numberOfLines={1} style={styles.infoTextStyle}>
                      {departmentName}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Image style={styles.enterStyle} source={Icon.EnterIcon} />
            </View>
          </View>
        </TouchableOpacity>
      );
    };

    const renderItems = () => {
      const {authToken} = this.props;
      return (
        <View style={styles.itemsWrapper}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Friends')}>
            <View style={styles.itemStyle}>
              <View
                style={{
                  ...styles.itemImageWrapper,
                  backgroundColor: '#F38900',
                }}>
                <Image style={styles.itemImage} source={Icon.FriendsIcon} />
              </View>
              <View style={styles.itemTextWrapper}>
                <Text style={styles.itemText}>Friends</Text>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('MyGroup')}>
            <View style={styles.itemStyle}>
              <View
                style={{
                  ...styles.itemImageWrapper,
                  backgroundColor: '#01CB9C',
                }}>
                <Image style={styles.itemImage} source={Icon.GroupIcon} />
              </View>
              <View
                style={
                  isFrozen
                    ? {
                        ...styles.itemTextWrapper,
                        borderTopColor: '#D9D9D9',
                        borderTopWidth: 1,
                      }
                    : {
                        ...styles.itemTextWrapper,
                        borderBottomColor: '#D9D9D9',
                        borderTopColor: '#D9D9D9',
                        borderBottomWidth: 1,
                        borderTopWidth: 1,
                      }
                }>
                <Text style={styles.itemText}>Group Chats</Text>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </TouchableOpacity>
          {!isPersonalUser ? (
            isFrozen ? (
              <View
                style={[
                  styles.itemStyle,
                  {backgroundColor: '#f9f9f9', opacity: 0.3},
                ]}>
                <View
                  style={{
                    ...styles.itemImageWrapper,
                    backgroundColor: '#C86EDB',
                  }}>
                  <Image
                    style={styles.itemImage}
                    source={Icon.OrganizationIcon}
                  />
                </View>
                <View style={styles.itemTextWrapper}>
                  <Text style={styles.itemText}>My Organization</Text>
                  <Text style={{paddingRight: 17, color: DColors.auxiliaryRed}}>
                    Frozen
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('Organization');
                }}>
                <View style={styles.itemStyle}>
                  <View
                    style={{
                      ...styles.itemImageWrapper,
                      backgroundColor: '#C86EDB',
                    }}>
                    <Image
                      style={styles.itemImage}
                      source={Icon.OrganizationIcon}
                    />
                  </View>
                  <View style={styles.itemTextWrapper}>
                    <Text style={styles.itemText}>My Organization</Text>
                    <Image
                      style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                      source={Icon.EnterIcon}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )
          ) : null}
          {/* {isPersonalUser && (
            <Fragment>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('AddOrganization');
                }}>
                <View style={styles.itemStyle}>
                  <View
                    style={{
                      ...styles.itemImageWrapper,
                      backgroundColor: '#C86EDB',
                    }}>
                    <Image
                      style={styles.itemImage}
                      source={Icon.OrganizationIcon}
                    />
                  </View>
                  <View style={styles.itemTextWrapper}>
                    <Text style={styles.itemText}>Join Organization</Text>
                    <Image
                      style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                      source={Icon.EnterIcon}
                    />
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('CreateOrganization');
                }}>
                <View style={styles.itemStyle}>
                  <View
                    style={{
                      ...styles.itemImageWrapper,
                      backgroundColor: '#F38900',
                    }}>
                    <Image
                      style={styles.itemImage}
                      source={Icon.CreateOrgIcon}
                    />
                  </View>
                  <View
                    style={{
                      ...styles.itemTextWrapper,
                      borderTopColor: '#D9D9D9',
                      borderTopWidth: 1,
                    }}>
                    <Text style={styles.itemText}>Create Organization</Text>
                    <Image
                      style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                      source={Icon.EnterIcon}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </Fragment>
          )} */}
          {!isPersonalUser ? (
            <TouchableOpacity
              style={{marginTop: 7}}
              onPress={() => this.props.navigation.navigate('MyTaskList')}>
              <View style={styles.itemStyle}>
                <View style={styles.itemImageWrapper}>
                  <Image
                    style={{width: 27, height: 27}}
                    source={Icon.CollectDataIcon}
                  />
                </View>
                <View style={styles.itemTextWrapper}>
                  <Text style={styles.itemText}>My Task</Text>
                  <Image
                    style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                    source={Icon.EnterIcon}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={{marginTop: 7}}
            onPress={() => this.props.navigation.navigate('Settings')}>
            <View style={styles.itemStyle}>
              <View
                style={{
                  ...styles.itemImageWrapper,
                  backgroundColor: '#1E9DFC',
                }}>
                <Image style={styles.itemImage} source={Icon.SettingIcon} />
              </View>
              <View style={styles.itemTextWrapper}>
                <Text style={styles.itemText}>Settings</Text>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    };

    StatusBar.setBarStyle('light-content', true);
    if (Platform.OS === PlatFormAndroid) {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('rgba(0,0,0,0)', true);
    }
    return (
      <View style={styles.normal}>
        <TitleBarNew
          title={'Me'}
          navigation={null}
          pressLeft={() => navigation.navigate('ScanQRCode')}
          right={
            newMessageCount > 0 ? (
              // <View style={styles.newMessageTips}>
              // <Text style={styles.messageCount}>{newMessageCount}</Text>
              // </View>
              <Image style={styles.rightImage} source={Icon.NewMessageIcon} />
            ) : (
              <Image style={styles.rightImage} source={Icon.MessageIcon} />
            )
          }
          leftImage={Icon.AddScanIcon}
          pressRight={() => navigation.navigate('Message')}
        />
        {renderTop()}
        {renderItems()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  topWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: 100,
    backgroundColor: '#1E9DFC',
    paddingTop: 13,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 53,
  },
  Avatar: {
    width: 53,
    height: 53,
    borderRadius: 26.5,
    marginLeft: 17,
  },
  userInfo: {
    height: 53,
    marginLeft: 14,
    justifyContent: 'center',
  },
  usernameStyle: {
    maxWidth: 0.7 * deviceWidth,
    fontFamily: Page.font_family,
    fontSize: 20,
    color: '#FFFFFF',
  },
  infoTextStyle: {
    maxWidth: 0.6 * deviceWidth,
    fontSize: 12,
    color: '#FFFFFF',
  },
  enterStyle: {
    position: 'relative',
    width: 7,
    height: 12,
    marginRight: 17,
  },
  itemsWrapper: {
    marginTop: 7,
  },
  itemStyle: {
    flexDirection: 'row',
    width: '100%',
    height: 52,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  itemImageWrapper: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 17,
  },
  itemImage: {
    width: 16,
    height: 16,
  },
  itemTextWrapper: {
    height: 52,
    flex: 1,
    flexDirection: 'row',
    marginLeft: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 16,
    color: '#2E2E2E',
  },
  rightImage: {
    width: 20,
    height: 19,
    resizeMode: 'contain',
  },
  newMessageTips: {
    paddingRight: 10,
    width: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageCount: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: DColors.auxiliaryRed,
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    ...Platform.select({
      ios: {
        lineHeight: 18,
      },
      android: {},
    }),
  },
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
    message: state.message.message,
    newMessageCount: state.message.newMessageCount,
  };
};

export default connect(mapStateToProps)(MeScreen);
