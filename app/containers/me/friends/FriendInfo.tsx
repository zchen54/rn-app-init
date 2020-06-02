import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {Modal} from '@ant-design/react-native';
import {TitleBarNew} from '../../../common/components';
import {deviceWidth, searchType} from '../../../common/utils';
import {FONT_FAMILY} from '../../../common/styles';
import {
  deleteFriend,
  requestFriend,
  getGroupMembers,
  inviteFriendsToCompany,
} from '../../../store/actions';
interface State {}
interface Props {
  navigation: any;
  friendSelect: any;
  groupId: string;
  companyInfo: any;
  deleteFriend: (
    authToken: string,
    friendId: string,
    callback?: Function,
  ) => void;
  currentUserInfo: any;
  requestFriend: (
    authToken: string,
    email: string,
    callback?: Function,
  ) => void;
  getGroupMembers: (
    authToken: string,
    groupId: string,
    callback?: Function,
  ) => void;
  friends: Array<any>;
  inviteFriendsToCompany: (
    authToken: string,
    options: {
      receiverEmails: Array<string>;
      companyPkey: string;
    },
    callback?: Function,
  ) => void;
}
const Page = {
  font_family: FONT_FAMILY,
};

const Icon = {
  ManIcon: require('../../images/Me/man.png'),
  WomenIcon: require('../../images/Me/women.png'),
  headerImageIcon: require('../../images/Me/Portrait.png'),
};

export class FriendInfo extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  handleAddFriend = () => {
    const {currentUserInfo, friendSelect, navigation} = this.props,
      {authToken} = currentUserInfo,
      {_id, email} = friendSelect;
    this.props.requestFriend(authToken, email);
  };

  handleDeleteFriend = () => {
    const {currentUserInfo, friendSelect} = this.props,
      {authToken} = currentUserInfo,
      {_id, email} = friendSelect;
    Modal.alert('Are you sure to delete?', null, [
      {
        text: 'Cancel',
        onPress: () => {},
      },
      {
        text: 'Sure',
        onPress: () => {
          this.props.deleteFriend(authToken, _id);
        },
      },
    ]);
  };

  handleInviteUserToCompany = () => {
    const {currentUserInfo, friendSelect, navigation} = this.props,
      {authToken} = currentUserInfo,
      {_id, email} = friendSelect;
    this.props.inviteFriendsToCompany(
      authToken,
      {
        receiverEmails: [email],
        companyPkey: '',
      },
      () => {
        navigation.navigate('Organization');
      },
    );
  };

  render() {
    let {
      navigation,
      friendSelect,
      currentUserInfo,
      friends,
      companyInfo,
    } = this.props;
    StatusBar.setBarStyle('dark-content', true);
    const staffs: Array<any> =
      companyInfo && Array.isArray(companyInfo.staffs)
        ? companyInfo.staffs
        : [];
    const renderUserInfoDom = () => (
      <View style={styles.topWrapper}>
        {friendSelect.userPic ? (
          <Image style={styles.Avatar} source={{uri: friendSelect.userPic}} />
        ) : (
          <Image style={styles.Avatar} source={Icon.headerImageIcon} />
        )}
        <View style={styles.userInfo}>
          <View style={styles.row}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.usernameStyle}>
              {friendSelect.nickName}
            </Text>
            {friendSelect.gender === 0 || friendSelect.gender === 1 ? (
              <Image
                source={
                  friendSelect.gender === 0 ? Icon.ManIcon : Icon.WomenIcon
                }
                style={{
                  width: 18,
                  height: 18,
                  marginLeft: 12,
                  marginTop: 5,
                }}
              />
            ) : null}
          </View>
          <Text style={styles.infoTextStyle}>{friendSelect.email}</Text>
        </View>
      </View>
    );
    const renderCompanyInfoDom = () => (
      <View style={styles.itemStyle}>
        <View style={styles.itemTextWrapper}>
          <Text style={styles.itemLabel}>Organization</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text numberOfLines={1} style={styles.itemText}>
              {friendSelect.companyName}
            </Text>
            <View style={styles.enterStyle} />
          </View>
        </View>
      </View>
    );
    const renderCounterDom = () => (
      <Fragment>
        <View style={{...styles.itemStyle, marginTop: 8}}>
          <View
            style={{
              ...styles.itemTextWrapper,
              borderBottomColor: '#F2F2F2',
              borderBottomWidth: 1,
            }}>
            <Text style={styles.itemLabel}>Number of templates created</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.itemText}>{friendSelect.templateCount}</Text>
              <View style={styles.enterStyle} />
            </View>
          </View>
        </View>
        <View style={styles.itemStyle}>
          <View style={styles.itemTextWrapper}>
            <Text style={styles.itemLabel}>Number of data collected</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.itemText}>{friendSelect.reportCount}</Text>
              <View style={styles.enterStyle} />
            </View>
          </View>
        </View>
      </Fragment>
    );
    let type = navigation.getParam('type');

    // 添加好友
    let controllerDom = <View />;
    if (
      type === searchType.FriendEmail ||
      type === searchType.FriendNickname ||
      type === searchType.CompanyStaffs
    ) {
      controllerDom = (
        <TouchableOpacity onPress={this.handleAddFriend} style={{marginTop: 8}}>
          <View style={styles.buttonStyle}>
            <Text style={{...styles.buttonText, color: '#1E9DFC'}}>
              Add Friends
            </Text>
          </View>
        </TouchableOpacity>
      );
      if (currentUserInfo.email === friendSelect.email) {
        // 搜索本人
        controllerDom = <View />;
      } else if (friends.some(item => item.email === friendSelect.email)) {
        // 搜索好友
        controllerDom = (
          <TouchableOpacity
            onPress={this.handleDeleteFriend}
            style={{marginTop: 8}}>
            <View style={styles.buttonStyle}>
              <Text style={styles.buttonText}>Delete Friends</Text>
            </View>
          </TouchableOpacity>
        );
      }
    } else if (
      type === searchType.InviteEmployeesByEmail &&
      !staffs.some(item => item.user.email === friendSelect.email)
    ) {
      controllerDom = (
        <TouchableOpacity
          onPress={this.handleInviteUserToCompany}
          style={{marginTop: 8}}>
          <View style={styles.buttonStyle}>
            <Text style={{...styles.buttonText, color: '#1E9DFC'}}>Invite</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.normal}>
        <TitleBarNew
          title={''}
          navigation={navigation}
          backgroundColor="#FFFFFF"
        />
        {renderUserInfoDom()}
        {renderCompanyInfoDom()}
        {renderCounterDom()}
        {controllerDom}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
  },
  topWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: 100,
    backgroundColor: '#FFFFFF',
    paddingTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  Avatar: {
    width: 53,
    height: 53,
    // backgroundColor: "#F38900",
    borderRadius: 26.5,
    marginLeft: 30,
  },
  userInfo: {
    height: 53,
    marginLeft: 17,
  },
  row: {
    flexDirection: 'row',
  },
  usernameStyle: {
    maxWidth: 0.5 * deviceWidth,
    fontSize: 20,
    color: '#2E2E2E',
  },
  infoTextStyle: {
    fontSize: 14,
    color: '#757575',
  },
  buttonStyle: {
    width: deviceWidth,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 16,
    color: '#ED2F31',
  },
  itemStyle: {
    flexDirection: 'row',
    width: '100%',
    height: 52,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  itemTextWrapper: {
    height: 52,
    flex: 1,
    flexDirection: 'row',
    marginLeft: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLabel: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#2E2E2E',
  },
  itemText: {
    fontFamily: Page.font_family,
    maxWidth: 180,
    fontSize: 16,
    color: '#757575',
  },
  enterStyle: {
    position: 'relative',
    width: 7,
    height: 12,
    marginRight: 17,
  },
});
const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo,
    friendSelect: state.friendsList.friendSelect,
    friends: state.friendsList.friends,
    companyInfo: state.company.companyInfo,
    groupId: state.group.groupSelect._id,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    deleteFriend: (
      authToken: string,
      friendId: string,
      callback?: Function,
    ) => {
      dispatch(deleteFriend(authToken, friendId, callback));
    },
    requestFriend: (authToken: string, email: string, callback?: Function) => {
      dispatch(requestFriend(authToken, email, callback));
    },
    getGroupMembers: (
      authToken: string,
      groupId: string,
      callback?: Function,
    ) => dispatch(getGroupMembers(authToken, groupId, callback)),
    inviteFriendsToCompany: (
      authToken: string,
      options: {
        receiverEmails: Array<string>;
        companyPkey: string;
      },
      callback?: Function,
    ) => dispatch(inviteFriendsToCompany(authToken, options, callback)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FriendInfo);
