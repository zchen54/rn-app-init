import React from 'react';
import {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import {Icon} from '@ant-design/react-native';
import {
  TitleBarNew,
  SearchInput,
  formatSearchResultText,
} from '../../../common/components';
import {Tabs} from '@ant-design/react-native';
import {FONT_FAMILY} from '../../../common/styles';
import {
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  titleHeight,
  sortObjectArray,
  statusBarHeight,
} from '../../../common/utils';
import {
  fetchGroupList,
  fetchFriendList,
  selectGroup,
  getGroupMembers,
} from '../../../store/actions';

interface State {
  searchValue: string;
  hadFetch: boolean;
  refreshing: boolean;
}
interface Props {
  navigation: any;
  authToken: string;
  groupList: Array<any>;
  createdGroupList: Array<any>;
  friends: Array<any>;
  authPkey: string;
  selectGroup: (groupSelect: any) => void;
  fetchGroupList: (
    authToken: string,
    isCreator: boolean,
    callback?: Function,
  ) => void;
  fetchFriendList: (authToken: string, callback?: Function) => void;
  getGroupMembers: (
    authToken: string,
    groupId: string,
    callback?: Function,
  ) => void;
}
const Page = {
  font_family: FONT_FAMILY,
};
const DIcon = {
  headerImageIcon: require('../../images/Me/Portrait.png'),
  emptyGroups: require('../../images/Me/empty-group.png'),
};

export const sortGroupsByName = (a: any, b: any) => {
  if (a && b) {
    var valueA = a.name
      ? a.name
      : a.members
          .map((item: any) => item.nickName)
          .join(',')
          .toUpperCase();
    var valueB = b.name
      ? b.name
      : b.members
          .map((item: any) => item.nickName)
          .join(',')
          .toUpperCase();
    if (valueA < valueB) {
      return -1;
    }
    if (valueA > valueB) {
      return 1;
    }
  }
  return 0;
};

export class MyGroupScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchValue: '',
      hadFetch: false,
      refreshing: false,
    };
  }

  componentWillMount() {
    this.handleFetchList(this.props, true);
  }

  componentWillReceiveProps(nextProps: Props) {
    console.log('componentWillReceiveProps groups');
    this.handleFetchList(nextProps);
  }

  handleFetchList = (props: Props, refresh = false) => {
    const {authToken, groupList} = props;
    const {hadFetch} = this.state;
    if ((!hadFetch && !groupList.length) || refresh) {
      this.setState({hadFetch: true, refreshing: true});
      this.props.fetchGroupList(authToken, false);
    } else {
      this.setState({refreshing: false});
    }
  };

  handleSelectGroup = (groupSelect: any) => {
    const {navigation, authToken} = this.props;
    this.props.selectGroup(groupSelect);
    this.props.getGroupMembers(authToken, groupSelect._id, () =>
      navigation.navigate('EditGroup'),
    );
  };

  handleSearchChange = (value: string) => {
    this.setState({
      searchValue: value,
    });
  };

  _renderItems = (data: any) => {
    const {index, item} = data;
    const {searchValue} = this.state;
    let GroupImag;
    if (item.members.length === 2) {
      GroupImag = (
        <View style={styles.imageStyleWrapper2}>
          {item.members[0].userPic ? (
            <Image
              source={{uri: item.members[0].userPic}}
              style={styles.imageHalfStyle}
            />
          ) : (
            <Image
              source={DIcon.headerImageIcon}
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
              source={DIcon.headerImageIcon}
              style={styles.imageHalfStyle}
            />
          )}
        </View>
      );
    } else if (item.members.length === 3) {
      GroupImag = (
        <View style={styles.imageStyleWrapper2}>
          {item.members[0].userPic ? (
            <Image
              source={{uri: item.members[0].userPic}}
              style={styles.imageHalfStyle}
            />
          ) : (
            <Image
              source={DIcon.headerImageIcon}
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
                source={DIcon.headerImageIcon}
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
                source={DIcon.headerImageIcon}
                style={styles.imageQuiteStyle}
              />
            )}
          </View>
        </View>
      );
    } else if (item.members.length === 1) {
      GroupImag = item.members[0].userPic ? (
        <Image
          source={{uri: item.members[0].userPic}}
          style={styles.imageStyle}
        />
      ) : (
        <Image source={DIcon.headerImageIcon} style={styles.imageStyle} />
      );
    } else {
      GroupImag = (
        <View style={styles.imageStyleWrapper2}>
          <View style={styles.imageHalfStyle}>
            {item.members[0].userPic ? (
              <Image
                source={{uri: item.members[0].userPic}}
                style={styles.imageQuiteStyle}
              />
            ) : (
              <Image
                source={DIcon.headerImageIcon}
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
                source={DIcon.headerImageIcon}
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
                source={DIcon.headerImageIcon}
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
                source={DIcon.headerImageIcon}
                style={styles.imageQuiteStyle}
              />
            )}
          </View>
        </View>
      );
    }

    const groupName = item.name
      ? item.name
      : item.members.map((item: any) => item.nickName).join(',');

    return (
      <TouchableOpacity onPress={() => this.handleSelectGroup(item)}>
        <View style={styles.itemWrapper}>
          {GroupImag}
          <View style={index === 0 ? null : styles.line}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.nicknameStyle}>
              {formatSearchResultText(groupName, searchValue)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderGroup = (data: Array<any>) => {
    return (
      <FlatList
        data={data}
        renderItem={this._renderItems}
        keyExtractor={(item, index) => item._id + '' + index}
        refreshing={this.state.refreshing}
        onRefresh={() => this.handleFetchList(this.props, true)}
      />
    );
  };

  render() {
    let {navigation, groupList, createdGroupList, authPkey} = this.props;
    const {searchValue} = this.state;

    let createdGroups: Array<any> = [],
      joinedGroups: Array<any> = [],
      showGroups: Array<any> = [];
    if (searchValue !== '') {
      showGroups = groupList
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
      let createdGroupsOrderByTime = createdGroupList.filter(
        (item: any) => item.lastActiveTime,
      );
      let createdGroupsOrderByName = createdGroupList
        .filter((item: any) => !item.lastActiveTime)
        .sort(sortGroupsByName);
      createdGroups = [
        ...createdGroupsOrderByTime,
        ...createdGroupsOrderByName,
      ];
      let joinedGroupList = groupList.filter(item => item.owner !== authPkey);
      let joinedGroupsOrderByTime = joinedGroupList.filter(
        (item: any) => item.lastActiveTime,
      );
      let joinedGroupsOrderByName = joinedGroupList
        .filter((item: any) => !item.lastActiveTime)
        .sort(sortGroupsByName);
      joinedGroups = [...joinedGroupsOrderByTime, ...joinedGroupsOrderByName];
    }

    const showGroupListView =
      searchValue !== '' ? (
        this.renderGroup(showGroups)
      ) : (
        <Tabs
          tabs={[{title: 'Created'}, {title: 'Joined'}]}
          tabBarActiveTextColor="#1E9DFC"
          tabBarTextStyle={{
            fontFamily: Page.font_family,
            fontSize: 16,
          }}
          tabBarUnderlineStyle={{
            backgroundColor: '#1E9DFC',
            width: 40,
            marginLeft: (deviceWidth / 2 - 40) / 2,
            // marginBottom: setSizeWithPx(12)
          }}>
          {this.renderGroup(createdGroups)}
          {this.renderGroup(joinedGroups)}
        </Tabs>
      );
    const emptyTip = (
      <View style={styles.emptyWrapper}>
        <Image source={DIcon.emptyGroups} />
        <Text style={{...styles.emptyText, marginTop: 10}}>
          You don’t have a group yet.
        </Text>
        <Text style={styles.emptyText}>Create it.</Text>
      </View>
    );

    return (
      <View style={styles.normal}>
        <TitleBarNew
          title={'Group Chats'}
          navigation={navigation}
          right={<Icon name="usergroup-add" color="#fff"></Icon>}
          pressRight={() => {
            navigation.navigate('CreateGroup', {
              title: 'Create Group Chats',
              type: 'createGroupChats',
            });
          }}
        />
        {groupList.length === 0 && createdGroupList.length === 0 ? (
          <FlatList
            data={[]}
            renderItem={this._renderItems}
            keyExtractor={(item, index) => item + '' + index}
            refreshing={this.state.refreshing}
            onRefresh={() => this.handleFetchList(this.props, true)}
            extraData={this.state}
            ListEmptyComponent={emptyTip}
          />
        ) : (
          <Fragment>
            <View style={styles.searchBarWrapper}>
              <SearchInput
                value={searchValue}
                onChange={this.handleSearchChange}
              />
            </View>
            {showGroupListView}
          </Fragment>
        )}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 17,
    marginRight: 17,
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
    width: 0.8 * deviceWidth,
    fontSize: 16,
    color: '#2E2E2E',
  },
  emptyWrapper: {
    width: '100%',
    flex: 1,
    marginTop: (deviceHeight - statusBarHeight - 48 - 260) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#96D0FC',
  },
});
const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    authPkey: state.loginInfo.currentUserInfo._id,
    groupList: state.group.groupList,
    createdGroupList: state.group.createdGroupList,
    friends: state.friendsList.friends,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    fetchGroupList: (
      authToken: string,
      isCreator: boolean,
      callback?: Function,
    ) => dispatch(fetchGroupList(authToken, isCreator, callback)),
    getGroupMembers: (
      authToken: string,
      groupId: string,
      callback?: Function,
    ) => dispatch(getGroupMembers(authToken, groupId, callback)),
    fetchFriendList: (authToken: string, callback?: Function) =>
      dispatch(fetchFriendList(authToken, callback)),
    selectGroup: (groupSelect: any) => dispatch(selectGroup(groupSelect)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyGroupScreen);
