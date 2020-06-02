import React from 'react';
import {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SectionList,
} from 'react-native';
import {
  TitleBarNew,
  SearchInput,
  formatSearchResultText,
} from '../../../common/components';
import {FONT_FAMILY, DColors} from '../../../common/styles';
import {searchType, deviceWidth, pinying} from '../../../common/utils';
import {Modal, Toast} from '@ant-design/react-native';
import {
  fetchFriendList,
  fetchGroupList,
  createGroup,
  joinGroup,
  getGroupMembers,
  inviteFriendsToCompany,
  deleteUser,
  shareTemplateAndReport,
} from '../../../store/actions';
import {ModelType, TemplateType} from '../../../common/constants/ModeTypes';
import {toastTips} from '../../../common/constants';
import {sortGroupsByName} from './MyGroupScreen';

interface State {
  searchValue: string;
  initUsers: Array<string>;
  checkedUsers: Array<string>;
  FriendsForSectionList: Array<any>;
  hadFetch: boolean;
  refreshing: boolean;
}
interface Props {
  navigation: any;
  currentUserInfo: any;
  staffs: Array<any>;
  editingTemplate: ModelType & TemplateType;
  editingReport: any;
  authToken: string;
  friends: Array<any>;
  groupList: Array<any>;
  createGroup: (
    authToken: string,
    name: string,
    remark: string,
    invitee: Array<string>,
    callback?: Function,
  ) => void;
  fetchFriendList: (authToken: string, callback?: Function) => void;
  fetchGroupList: (
    authToken: string,
    isCreator: boolean,
    callback?: Function,
  ) => void;
  joinGroup: (
    authToken: string,
    usersId: Array<string>,
    groupId: string,
    callback?: Function,
  ) => void;
  getGroupMembers: (
    authToken: string,
    groupId: string,
    callback?: Function,
  ) => void;
  deleteUser: (
    authToken: string,
    usersId: Array<string>,
    groupId: string,
    callback?: Function,
  ) => void;
  userData: Array<any>;
  groupId: string;
  shareTemplateAndReport: (
    authToken: string,
    option: {
      recipientIds: Array<string>;
      groupId: Array<string>;
      templateId: string;
      reportId: string;
    },
    callback?: Function,
  ) => void;
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
  EnterIcon: require('../../images/Me/enterwhite.png'),
  checked: require('../../images/template/CheckBox-checked.png'),
  grayCheckedIcon: require('../../images/Me/Selection_grey.png'),
  headerImageIcon: require('../../images/Me/Portrait.png'),
};

export class CreateGroup extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchValue: '',
      initUsers: [],
      checkedUsers: [],
      FriendsForSectionList: [],
      hadFetch: false,
      refreshing: false,
    };
  }

  // 将默认已选项存入state
  componentWillMount() {
    this.handleFetchList(this.props, true);
    let initUsers: Array<any> = [];
    if (this.props.navigation.getParam('type') === 'addFriendsToGroup') {
      this.props.userData.forEach(item => {
        initUsers.push(item._id);
      });
    } else if (
      this.props.navigation.getParam('type') === 'inviteFriendToCompany'
    ) {
      this.props.staffs.forEach(item => {
        initUsers.push(item.userPkey);
      });
    }
    this.setState({
      initUsers,
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    this.handleFetchList(nextProps);
  }

  // 多选点击
  handleCheckUser = (value: string) => {
    let checkedUsers = [...this.state.checkedUsers];
    let index = checkedUsers.indexOf(value);
    index === -1 ? checkedUsers.push(value) : checkedUsers.splice(index, 1);
    this.setState({checkedUsers});
  };

  handleFetchList = (props: Props, refresh = false) => {
    const {authToken, friends, groupList} = this.props;
    const {hadFetch} = this.state;
    if ((!hadFetch && (!friends.length || !groupList.length)) || refresh) {
      this.setState({hadFetch: true, refreshing: true});
      this.props.fetchFriendList(authToken, () =>
        this.props.fetchGroupList(authToken, false),
      );
    } else {
      this.setState({refreshing: false});
    }
    this.handleFriendsSection(props);
  };

  // 确认按钮
  handleConfirm = () => {
    const {
      createGroup,
      currentUserInfo,
      authToken,
      navigation,
      friends,
      groupId,
      inviteFriendsToCompany,
      groupList,
      editingTemplate,
    } = this.props;
    const {checkedUsers} = this.state;
    if (navigation.getParam('type') === 'addFriendsToGroup') {
      this.props.joinGroup(authToken, checkedUsers, groupId, () => {
        currentUserInfo._id === this.props.userData[0]._id
          ? Toast.success('Successfully invited', 2)
          : Toast.success(toastTips.SuccessAddFriend, 2);
        this.props.getGroupMembers(authToken, groupId, () =>
          navigation.goBack(),
        );
      });
    } else if (navigation.getParam('type') === 'createGroupChats') {
      createGroup(authToken, '', '', checkedUsers, () => navigation.goBack());
    } else if (navigation.getParam('type') === 'inviteFriendToCompany') {
      let emails: Array<string> = [];
      checkedUsers.forEach(item =>
        friends.forEach(friend => {
          if (friend._id === item) {
            emails.push(friend.email);
          }
        }),
      );

      inviteFriendsToCompany(
        authToken,
        {
          receiverEmails: emails,
          companyPkey: navigation.getParam('companyPkey'),
        },
        () => {
          navigation.navigate('Organization');
        },
      );
    } else if (navigation.getParam('type') === 'deleteMemberFromGroup') {
      this.props.deleteUser(authToken, checkedUsers, groupId, () => {
        this.props.getGroupMembers(authToken, groupId, () => {
          navigation.goBack();
        });
      });
    } else if (navigation.getParam('type') === 'shareTemplate') {
      let templateId = editingTemplate.pKey;
      let option = {
        recipientIds: checkedUsers.filter(item =>
          friends.some(friend => friend._id === item),
        ),
        groupId: checkedUsers.filter(item =>
          groupList.some(group => group._id === item),
        ),
        templateId: templateId,
        reportId: '',
      };

      this.props.shareTemplateAndReport(authToken, option, () =>
        navigation.goBack(),
      );
    } else if (navigation.getParam('type') === 'shareReport') {
      let option = {
        recipientIds: checkedUsers.filter(item =>
          friends.some(friend => friend._id === item),
        ),
        groupId: checkedUsers.filter(item =>
          groupList.some(group => group._id === item),
        ),
        templateId: '',
        reportId: this.props.editingReport.pKey,
      };

      this.props.shareTemplateAndReport(authToken, option, () =>
        navigation.goBack(),
      );
    }
  };

  // 渲染群头像
  renderGroupImg = (item: any) => {
    if (item.members.length === 2) {
      return (
        <View style={styles.imageStyleWrapper2}>
          {item.members[0].userPic ? (
            <Image
              source={{uri: item.members[0].userPic}}
              style={styles.imageHalfStyle}
            />
          ) : (
            <Image
              source={Icon.headerImageIcon}
              style={styles.imageHalfStyle}
            />
          )}
          {item.members[1].userPic ? (
            <Image
              source={{uri: item.members[1].userPic}}
              style={styles.imageHalfStyle}
            />
          ) : (
            <Image
              source={Icon.headerImageIcon}
              style={styles.imageHalfStyle}
            />
          )}
        </View>
      );
    } else if (item.members.length === 3) {
      return (
        <View style={styles.imageStyleWrapper2}>
          {item.members[0].userPic ? (
            <Image
              source={{uri: item.members[0].userPic}}
              style={styles.imageHalfStyle}
            />
          ) : (
            <Image
              source={Icon.headerImageIcon}
              style={styles.imageHalfStyle}
            />
          )}
          <View style={styles.imageHalfStyle}>
            {item.members[1].userPic ? (
              <Image
                source={{uri: item.members[1].userPic}}
                style={styles.imageQuiteStyle}
              />
            ) : (
              <Image
                source={Icon.headerImageIcon}
                style={styles.imageQuiteStyle}
              />
            )}
            {item.members[2].userPic ? (
              <Image
                source={{uri: item.members[2].userPic}}
                style={styles.imageQuiteStyle}
              />
            ) : (
              <Image
                source={Icon.headerImageIcon}
                style={styles.imageQuiteStyle}
              />
            )}
          </View>
        </View>
      );
    } else if (item.members.length === 1) {
      return item.members[0].userPic ? (
        <Image
          source={{uri: item.members[0].userPic}}
          style={styles.imageStyle}
        />
      ) : (
        <Image source={Icon.headerImageIcon} style={styles.imageStyle} />
      );
    } else {
      return (
        <View style={styles.imageStyleWrapper2}>
          <View style={styles.imageHalfStyle}>
            {item.members[0].userPic ? (
              <Image
                source={{uri: item.members[0].userPic}}
                style={styles.imageQuiteStyle}
              />
            ) : (
              <Image
                source={Icon.headerImageIcon}
                style={styles.imageQuiteStyle}
              />
            )}
            {item.members[1].userPic ? (
              <Image
                source={{uri: item.members[1].userPic}}
                style={styles.imageQuiteStyle}
              />
            ) : (
              <Image
                source={Icon.headerImageIcon}
                style={styles.imageQuiteStyle}
              />
            )}
          </View>
          <View style={styles.imageHalfStyle}>
            {item.members[2].userPic ? (
              <Image
                source={{uri: item.members[2].userPic}}
                style={styles.imageQuiteStyle}
              />
            ) : (
              <Image
                source={Icon.headerImageIcon}
                style={styles.imageQuiteStyle}
              />
            )}
            {item.members[3].userPic ? (
              <Image
                source={{uri: item.members[3].userPic}}
                style={styles.imageQuiteStyle}
              />
            ) : (
              <Image
                source={Icon.headerImageIcon}
                style={styles.imageQuiteStyle}
              />
            )}
          </View>
        </View>
      );
    }
  };

  renderItems = (data: any) => {
    const {index, item} = data;
    const {checkedUsers, initUsers, searchValue} = this.state;
    let itemPkey = item.pKey || item._id;
    const showName = item.members
      ? item.name === ''
        ? item.members.map((user: any) => user.nickName).join(',')
        : item.name
      : item.nickName;
    return (
      <View>
        <TouchableOpacity
          onPress={
            initUsers.indexOf(itemPkey) !== -1
              ? () => {}
              : () => {
                  this.handleCheckUser(itemPkey);
                }
          }>
          <View style={styles.itemWrapper}>
            {initUsers.indexOf(itemPkey) !== -1 ? (
              <Image style={styles.check} source={Icon.grayCheckedIcon} />
            ) : checkedUsers.indexOf(itemPkey) !== -1 ? (
              <Image style={styles.check} source={Icon.checked} />
            ) : (
              <View style={styles.unCheck} />
            )}
            {item.members ? (
              this.renderGroupImg(item)
            ) : item.userPic ? (
              <Image style={styles.imageStyle} source={{uri: item.userPic}} />
            ) : (
              <Image style={styles.imageStyle} source={Icon.headerImageIcon} />
            )}
            <View style={index === 0 ? null : styles.line}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.nicknameStyle}>
                {formatSearchResultText(showName, searchValue)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  renderTitle = (Section: any) => {
    let {title, data} = Section.section;
    return (
      <View style={styles.headerWrapper}>
        <Text style={styles.headerTitleStyle}>{title}</Text>
      </View>
    );
  };

  // 汉字转换字母
  handleFriendsLetter = (nickName: string) => {
    let firstChar = nickName.substr(0, 1);
    firstChar = pinying
      .getSpell(
        firstChar,
        function(charactor: any, spell: any) {
          return spell[1];
        },
        null,
      )
      .substr(0, 1);
    return firstChar.toUpperCase();
  };

  handleSearchChange = (value: string) => {
    this.setState({
      searchValue: value,
    });
    this.handleFriendsSection(this.props, value);
  };

  // 整理格式
  handleFriendsSection = (props: Props, searchValue: string = '') => {
    let {friends, userData, navigation, currentUserInfo} = props;
    let Type = navigation.getParam('type');
    let userDataSource: any;
    if (Type === 'deleteMemberFromGroup') {
      userDataSource = userData.filter(
        item => item._id !== currentUserInfo._id,
      );
    } else {
      userDataSource = friends;
    }

    let FriendsForSectionList: any = [];
    let Letter: Array<string> = [];
    let showUsers =
      searchValue === ''
        ? userDataSource
        : userDataSource.filter(
            (item: any) =>
              item.nickName.toUpperCase().indexOf(searchValue.toUpperCase()) >
              -1,
          );
    showUsers.forEach((friend: any) => {
      const pattern = new RegExp('[\u4E00-\u9FA5]+');
      const pattern2 = new RegExp('[A-Za-z]+');
      if (
        !pattern.test(this.handleFriendsLetter(friend.nickName)) &&
        !pattern2.test(this.handleFriendsLetter(friend.nickName))
      ) {
        if (Letter.every((item: string) => item !== '#')) {
          Letter.push('#');
        }
      } else {
        if (
          Letter.every(
            (item: string) =>
              item !== this.handleFriendsLetter(friend.nickName),
          )
        ) {
          Letter.push(this.handleFriendsLetter(friend.nickName));
        }
      }
    });
    Letter.forEach(letter => {
      if (letter === '#') {
        const pattern = new RegExp('[\u4E00-\u9FA5]+');
        const pattern2 = new RegExp('[A-Za-z]+');
        let data: Array<any> = [];
        showUsers.forEach((friend: any) => {
          if (
            !pattern.test(this.handleFriendsLetter(friend.nickName)) &&
            !pattern2.test(this.handleFriendsLetter(friend.nickName))
          ) {
            data.push(friend);
          }
        });
        FriendsForSectionList.push({
          title: letter,
          data: data.sort(function(a: any, b: any) {
            let nameA = a.nickName.toUpperCase();
            let nameB = b.nickName.toUpperCase();
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          }),
        });
      } else {
        let data: Array<any> = [];
        showUsers.forEach((friend: any) => {
          if (letter === this.handleFriendsLetter(friend.nickName)) {
            data.push(friend);
          }
        });
        FriendsForSectionList.push({
          title: letter,
          data: data.sort(function(a: any, b: any) {
            let nameA = a.nickName.toUpperCase();
            let nameB = b.nickName.toUpperCase();
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          }),
        });
      }
    });
    this.setState({
      FriendsForSectionList: FriendsForSectionList.sort(function(
        a: any,
        b: any,
      ) {
        var titleA = a.title.toUpperCase();
        var titleB = b.title.toUpperCase();
        if (titleA < titleB) {
          return -1;
        }
        if (titleA > titleB) {
          return 1;
        }
        return 0;
      }),
    });
  };

  render() {
    let {navigation, groupList} = this.props;
    let {checkedUsers, FriendsForSectionList, searchValue} = this.state;
    let dataSource: Array<any> = [];

    if (
      navigation.getParam('type') === 'shareTemplate' ||
      navigation.getParam('type') === 'shareReport'
    ) {
      let newGroupList: Array<any> = [];
      if (searchValue !== '') {
        newGroupList = groupList
          .filter((item: any) => {
            const groupName = item.name
              ? item.name
              : item.members.map((item: any) => item.nickName).join(',');
            return (
              groupName.toUpperCase().indexOf(searchValue.toUpperCase()) > -1
            );
          })
          .sort(sortGroupsByName);
      } else {
        let groupList1 = groupList.filter((item: any) => item.lastActiveTime);
        let groupList2 = groupList
          .filter((item: any) => !item.lastActiveTime)
          .sort(sortGroupsByName);
        newGroupList = [...groupList1, ...groupList2];
      }
      dataSource = newGroupList.length
        ? [{title: 'Group', data: newGroupList}, ...FriendsForSectionList]
        : [...FriendsForSectionList];
    } else {
      dataSource = [...FriendsForSectionList];
    }

    return (
      <View style={{flex: 1}}>
        <View style={styles.normal}>
          <TitleBarNew
            title={navigation.getParam('title')}
            navigation={navigation}
          />
          <View style={styles.searchBarWrapper}>
            <SearchInput
              value={searchValue}
              onChange={this.handleSearchChange}
            />
          </View>
          <SectionList
            removeClippedSubviews={false}
            keyboardShouldPersistTaps="handled"
            sections={dataSource}
            renderItem={this.renderItems}
            renderSectionHeader={this.renderTitle}
            keyExtractor={(item, index) => item + index}
            refreshing={this.state.refreshing}
            onRefresh={() => this.handleFetchList(this.props, true)}
          />
        </View>
        <View style={styles.bottomWrapper}>
          <Text style={styles.bottomText}>
            {'Selected:' + checkedUsers.length + ' Members'}
          </Text>
          <TouchableOpacity
            onPress={
              navigation.getParam('type') === 'createGroupChats'
                ? checkedUsers.length > 1
                  ? this.handleConfirm
                  : () => {}
                : checkedUsers.length > 0
                ? this.handleConfirm
                : () => {}
            }
            disabled={
              navigation.getParam('type') === 'createGroupChats'
                ? checkedUsers.length > 1
                  ? false
                  : true
                : checkedUsers.length > 0
                ? false
                : true
            }>
            <View
              style={
                navigation.getParam('type') === 'createGroupChats'
                  ? checkedUsers.length > 1
                    ? styles.buttonStyle
                    : {...styles.buttonStyle, backgroundColor: '#757575'}
                  : checkedUsers.length > 0
                  ? styles.buttonStyle
                  : {...styles.buttonStyle, backgroundColor: '#757575'}
              }>
              <Text style={styles.buttonText}>
                {'OK(' + checkedUsers.length + ')'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },

  searchBarWrapper: {
    marginVertical: 8,
    marginHorizontal: 17,
    width: deviceWidth - 34,
  },

  itemWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: 52,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  imageStyle: {
    maxWidth: '70%',
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 17,
    marginRight: 18,
    backgroundColor: '#EDEEF5',
  },
  imageStyleWrapper2: {
    flexDirection: 'row',
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 17,
    marginRight: 17,
    backgroundColor: '#EDEEF5',
    overflow: 'hidden',
  },
  imageHalfStyle: {
    width: 20,
    height: 40,
    // borderRadius: 20,
  },
  imageQuiteStyle: {
    width: 20,
    height: 20,
    // borderRadius: 20,
  },
  line: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    height: 52,
    justifyContent: 'center',
  },
  nicknameStyle: {
    fontFamily: Page.font_family,
    width: 0.6 * deviceWidth,
    fontSize: 16,
    color: '#2E2E2E',
  },
  headerWrapper: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
    paddingLeft: 17,
  },
  headerTitleStyle: {
    fontFamily: Page.font_family,
    fontSize: 12,
    color: '#2E2E2E',
  },
  bottomWrapper: {
    flexDirection: 'row',
    height: 50,
    width: deviceWidth,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: 17,
  },
  bottomText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: DColors.mainColor,
  },
  buttonStyle: {
    width: 100,
    height: 33,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DColors.mainColor,
  },
  buttonText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#FFFFFF',
  },
  unCheck: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginLeft: 18,
    borderRadius: 1,
  },
  check: {
    width: 16,
    height: 16,
    marginLeft: 18,
    borderWidth: 0,
  },
});
const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo,
    authToken: state.loginInfo.currentUserInfo.authToken,
    staffs: state.company.companyInfo.staffs,
    friends: state.friendsList.friends,
    groupId: state.group.groupSelect._id,
    userData: state.group.groupSelect.members,
    groupList: state.group.groupList,
    editingTemplate: state.template.editingTemplate,
    editingReport: state.report.editingReport,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    fetchFriendList: (authToken: string, callback?: Function) =>
      dispatch(fetchFriendList(authToken, callback)),
    fetchGroupList: (
      authToken: string,
      isCreator: boolean,
      callback?: Function,
    ) => dispatch(fetchGroupList(authToken, isCreator, callback)),
    createGroup: (
      authToken: string,
      name: string,
      remark: string,
      invitee: Array<string>,
      callback?: Function,
    ) => dispatch(createGroup(authToken, name, remark, invitee, callback)),
    joinGroup: (
      authToken: string,
      usersId: Array<string>,
      groupId: string,
      callback?: Function,
    ) => dispatch(joinGroup(authToken, usersId, groupId, callback)),
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
    deleteUser: (
      authToken: string,
      usersId: Array<string>,
      groupId: string,
      callback?: Function,
    ) => dispatch(deleteUser(authToken, usersId, groupId, callback)),
    shareTemplateAndReport: (
      authToken: string,
      option: {
        recipientIds: Array<string>;
        groupId: Array<string>;
        templateId: string;
        reportId: string;
      },
      callback?: Function,
    ) => dispatch(shareTemplateAndReport(authToken, option, callback)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateGroup);
