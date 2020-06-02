import React from 'react';
import {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SectionList,
  FlatList,
  ImageBackground,
  Modal,
  StatusBar,
  TouchableWithoutFeedback,
  Platform,
  TextInput,
  Keyboard,
} from 'react-native';
import {Icon} from '@ant-design/react-native';

import {
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  titleHeight,
  sortObjectArray,
  statusBarHeight,
} from '../../../common/utils';
import {
  TitleBarNew,
  SearchInput,
  formatSearchResultText,
} from '../../../common/components';
import {searchType, pinying} from '../../../common/utils';
import {
  fetchFriendList,
  selectFriend,
  searchUserByEmail,
} from '../../../store/actions';
import {FONT_FAMILY} from '../../../common/styles';
import {PlatFormAndroid} from '../../../env';
// import Reactotron from "reactotron-react-native";

interface State {
  searchValue: string;
  userScroll: Array<number>;
  addVisible: boolean;
  refreshing: boolean;
  FriendsForSectionList: Array<any>;
  LetterArray: Array<string>;
  hadFetch: boolean;
}
interface Props {
  navigation: any;
  fetchFriendList: (authToken: string, callback?: Function) => void;
  currentUserInfo: any;
  friends: Array<any>;
  selectFriend: (friendSelect: any) => void;
  searchUserByEmail: (
    authToken: string,
    email: string,
    callback?: Function,
  ) => void;
}
const Page = {
  font_family: FONT_FAMILY,
};
let theIndex: number = 0;

const Letter = [
  '!',
  '#',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];
const AddModalImage = require('../../images/Me/bg.png');
const DIcon = {
  SearchIcon: require('../../images/Me/search.png'),
  AddScanIcon: require('../../images/Me/Add_scan.png'),
  AddSearchIcon: require('../../images/Me/Add_search.png'),
  headerImageIcon: require('../../images/Me/Portrait.png'),
  emptyFriends: require('../../images/Me/empty-friends.png'),
};

class FriendsScreen extends Component<Props, State> {
  sectionList: any;
  viewDidAppear: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      searchValue: '',
      userScroll: [],
      addVisible: false,
      refreshing: false,
      FriendsForSectionList: [],
      LetterArray: [],
      hadFetch: false,
    };
  }

  // 刷新 获取friend
  handleRefresh = (props: any, refresh = false) => {
    const {hadFetch} = this.state;
    const {fetchFriendList, currentUserInfo, friends} = props;
    const {authToken} = currentUserInfo;
    if ((!hadFetch && !friends.length) || refresh) {
      this.setState({hadFetch: true, refreshing: true});
      fetchFriendList(authToken);
    } else {
      this.setState({refreshing: false});
    }
    this.handleFriendsSection(props);
  };

  componentWillMount() {
    this.handleRefresh(this.props, true);
  }

  componentDidMount() {
    this.viewDidAppear = this.props.navigation.addListener(
      'willFocus',
      (navigationProps: any) => {
        // console.log("页面将要显示", navigationProps);
        StatusBar.setBarStyle('light-content', true);
      },
    );
  }

  componentWillReceiveProps(nextProps: Props) {
    this.handleRefresh(nextProps);
  }

  componentWillUnmount() {
    this.viewDidAppear.remove();
  }

  handleSearchChange = (value: string) => {
    this.setState({
      searchValue: value,
    });
    this.handleFriendsSection(this.props, value);
  };

  // 字母侧边栏滑动函数
  scrollList = (e: any) => {
    const Letter_Bar_Height = deviceHeight - 150;
    const pageY = e.nativeEvent.pageY;
    let localY = pageY - titleHeight - 70;
    let Index = Math.floor((localY / Letter_Bar_Height) * 28);
    // let theIndex: number = 0;
    this.state.LetterArray.forEach((item, index) => {
      if (item === Letter[Index]) {
        theIndex = index;
      }
    });
    console.log('s====', Index, Letter[Index], theIndex);

    if (theIndex < this.state.FriendsForSectionList.length) {
      this.sectionList.scrollToLocation({
        sectionIndex: theIndex,
        itemIndex: -1,
        animated: false,
      });
    }
  };

  // 字母侧边栏颜色变换
  scrollChangeLetterColor = (event: any) => {
    const {userScroll} = this.state;
    let offsetY = event.nativeEvent.contentOffset.y;
    let Index = userScroll.findIndex(item => item > offsetY);
    let letter = this.state.LetterArray[Index];
    Letter.forEach(item => {
      if (item === letter) {
        this.refs[item].setNativeProps({
          style: {
            color: '#1E9DFC',
            tintColor: '#1E9DFC',
          },
        });
      } else {
        this.refs[item].setNativeProps({
          style: {
            color: '#2E2E2E',
            tintColor: '#2E2E2E',
          },
        });
      }
    });
  };

  // 点击好友
  handleSelectFriend = (data: any) => {
    // this.props.selectFriend(data);
    let {searchUserByEmail, currentUserInfo, navigation} = this.props;
    let {authToken} = currentUserInfo;
    searchUserByEmail(authToken, data.email, () => {
      navigation.navigate('FriendInfo', {
        type: searchType.FriendEmail,
      });
    });
  };

  // 打开扫码
  handleScanQRCode = () => {
    this.props.navigation.navigate('ScanQRCode');
    this.setState({
      addVisible: false,
    });
  };

  _renderItems = (data: any) => {
    const {index, item} = data;
    const {searchValue} = this.state;
    return (
      <TouchableOpacity onPress={() => this.handleSelectFriend(item)}>
        <View style={styles.itemWrapper}>
          {item.userPic ? (
            <Image style={styles.imageStyle} source={{uri: item.userPic}} />
          ) : (
            <Image style={styles.imageStyle} source={DIcon.headerImageIcon} />
          )}

          <View style={index === 0 ? null : styles.line}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.nicknameStyle}>
              {formatSearchResultText(item.nickName, searchValue)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  _renderTitle = (Section: any) => {
    let {title, data} = Section.section;
    const {searchValue, FriendsForSectionList} = this.state;
    let Content;
    Content = (
      <View style={styles.headerWrapper}>
        <Text style={styles.headerTitleStyle}>{title}</Text>
      </View>
    );
    return title === '!' ? (
      <Fragment>
        <View style={styles.searchBarWrapper}>
          <SearchInput value={searchValue} onChange={this.handleSearchChange} />
        </View>
        {FriendsForSectionList.length === 1 ? (
          <View style={{marginHorizontal: 20, marginVertical: 10}}>
            <Text style={{color: '#aaa'}}>No search results</Text>
          </View>
        ) : null}
      </Fragment>
    ) : (
      Content
    );
  };

  _renderLetter = (letter: string) => {
    return letter === '!' ? (
      <Image
        ref={letter}
        key={letter}
        style={{width: 9, height: 9, tintColor: '#1E9DFC'}}
        source={DIcon.SearchIcon}
      />
    ) : (
      <Text ref={letter} key={letter} style={styles.letterStyle}>
        {letter}
      </Text>
    );
  };

  handleSearchEmail = () => {
    this.setState({addVisible: false});
    this.props.navigation.navigate('AccurateSearch', {
      type: searchType.FriendEmail,
    });
  };

  // 汉字转换字母
  handleFriendsLetter = (nickName: string) => {
    let FirstChar = nickName.substr(0, 1);
    FirstChar = pinying
      .getSpell(
        FirstChar,
        function(charactor: any, spell: any) {
          return spell[1];
        },
        null,
      )
      .substr(0, 1);
    return FirstChar.toUpperCase();
  };

  // 好友列表按字母顺序格式整理
  // 计算每个section的高度;监听sectionList滚动距离--->比较section高度--->改变侧边字母颜色
  handleFriendsSection = (props: Props, searchValue: string = '') => {
    let {friends} = props;
    let FriendsForSectionList: any = [];
    let Letter: Array<string> = ['!'];
    let showFriends =
      searchValue === ''
        ? friends
        : friends.filter(
            (item: any) =>
              item.nickName.toUpperCase().indexOf(searchValue.toUpperCase()) >
              -1,
          );
    showFriends.forEach(friend => {
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
      if (letter === '!') {
        FriendsForSectionList.push({
          title: letter,
          data: [],
        });
      } else if (letter === '#') {
        const pattern = new RegExp('[\u4E00-\u9FA5]+');
        const pattern2 = new RegExp('[A-Za-z]+');
        let data: Array<any> = [];
        showFriends.forEach(friend => {
          if (
            !pattern.test(this.handleFriendsLetter(friend.nickName)) &&
            !pattern2.test(this.handleFriendsLetter(friend.nickName))
          ) {
            data.push(friend);
          }
        });
        FriendsForSectionList.push({
          title: letter,
          data: sortObjectArray(data, 'nickName'),
        });
      } else {
        let data: Array<any> = [];
        showFriends.forEach(friend => {
          if (letter === this.handleFriendsLetter(friend.nickName)) {
            data.push(friend);
          }
        });
        FriendsForSectionList.push({
          title: letter,
          data: sortObjectArray(data, 'nickName'),
        });
      }
    });
    let friendList = sortObjectArray(FriendsForSectionList, 'title');

    let userScroll: Array<number> = [];
    let Height = 0,
      headerHeight = 20,
      itemHeight = 52;
    friendList.forEach((section: any, index: number) => {
      if (section.title === '!') {
        headerHeight = 41;
      } else {
        headerHeight = 20;
      }
      Height = Height + headerHeight + section.data.length * itemHeight;
      userScroll.push(Height);
    });
    this.setState({
      FriendsForSectionList: friendList,
      userScroll,
      LetterArray: Letter.sort(),
    });
  };

  render() {
    let {navigation} = this.props;
    const {FriendsForSectionList, searchValue} = this.state;
    console.log('FriendsForSectionList ===', FriendsForSectionList);
    const emptyTip = (
      <View style={styles.emptyWrapper}>
        <Image source={DIcon.emptyFriends} />
        <Text style={{...styles.emptyText, marginTop: 10}}>
          You don’t have a friend yet.
        </Text>
        <Text style={styles.emptyText}>Add one.</Text>
      </View>
    );
    return (
      <View style={styles.normal}>
        <TitleBarNew
          title={'Friends'}
          navigation={navigation}
          right={<Icon name="user-add" color="#fff" />}
          pressRight={() => {
            this.setState({addVisible: true});
          }}
        />
        {/* <FlatList
          data={[]}
          renderItem={item => this._renderItems(item)}
          keyExtractor={(item, index) => item + "" + index}
          refreshing={this.state.refreshing}
          onRefresh={() => this.handleRefresh(this.props, true)}
          extraData={this.state}
          ListEmptyComponent={emptyTip}
        /> */}
        <SectionList
          ref={ref => (this.sectionList = ref)}
          removeClippedSubviews={false}
          keyboardShouldPersistTaps="handled"
          sections={FriendsForSectionList}
          renderItem={data => this._renderItems(data)}
          keyExtractor={(item, index) => '' + index}
          renderSectionHeader={data => this._renderTitle(data)}
          getItemLayout={(data, index) => ({
            index,
            offset: 20 + 52 * index,
            length: 52,
          })}
          stickySectionHeadersEnabled={true}
          onScroll={event => this.scrollChangeLetterColor(event)}
          refreshing={this.state.refreshing}
          onRefresh={() => this.handleRefresh(this.props, true)}
        />
        {searchValue === '' && (
          <View
            style={styles.letterBarStyle}
            onResponderMove={event => this.scrollList(event)}
            onResponderGrant={event => this.scrollList(event)}
            onMoveShouldSetResponder={event => true}>
            {Letter.map(item => this._renderLetter(item))}
          </View>
        )}
        <Modal visible={this.state.addVisible} transparent={true}>
          <TouchableWithoutFeedback
            onPress={() => {
              this.setState({addVisible: false});
            }}>
            <View
              style={{
                width: deviceWidth,
                height: deviceHeight,
              }}>
              <ImageBackground source={AddModalImage} style={styles.addWrapper}>
                <TouchableOpacity onPress={this.handleScanQRCode}>
                  <View style={styles.addItemWrapper}>
                    <Image style={styles.addIcon} source={DIcon.AddScanIcon} />
                    <Text style={styles.addText}>Scan QR Code</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.handleSearchEmail}>
                  <View style={styles.addItemWrapper}>
                    <Image
                      style={styles.addIcon}
                      source={DIcon.AddSearchIcon}
                    />
                    <Text style={styles.addText}>Search Email</Text>
                  </View>
                </TouchableOpacity>
              </ImageBackground>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    // paddingBottom: deviceHeight - 200,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
  },
  addWrapper: {
    width: 160,
    height: 110,
    paddingTop: 5,
    top: Platform.OS === PlatFormAndroid ? 38 : 38 + statusBarHeight,
    left: deviceWidth - 15 - 160,
  },
  addItemWrapper: {
    flexDirection: 'row',
    height: 52,
    alignItems: 'center',
  },
  addIcon: {
    width: 15,
    height: 15,
    marginLeft: 16,
  },
  addText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  itemWrapper: {
    flexDirection: 'row',
    width: deviceWidth,
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
    marginRight: 17,
    // backgroundColor: '#F38900',
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
  letterBarStyle: {
    flex: 1,
    position: 'absolute',
    height: deviceHeight - 150,
    top: titleHeight + 70,
    width: 42,
    right: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  letterStyle: {
    fontFamily: Page.font_family,
    color: '#2E2E2E',
    fontSize: 10,
  },
  searchBarWrapper: {
    marginTop: 8,
    marginHorizontal: 17,
    width: deviceWidth - 34,
  },
  emptyWrapper: {
    width: '100%',
    flex: 1,
    marginTop: (deviceHeight - statusBarHeight - 48 - 240) / 2,
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
    currentUserInfo: state.loginInfo.currentUserInfo,
    friends: state.friendsList.friends,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    fetchFriendList: (authToken: string, callback?: Function) => {
      dispatch(fetchFriendList(authToken, callback));
    },
    selectFriend: (friendSelect: any) => {
      dispatch(selectFriend(friendSelect));
    },
    searchUserByEmail: (
      authToken: string,
      email: string,
      callback?: Function,
    ) => {
      dispatch(searchUserByEmail(authToken, email, callback));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FriendsScreen);
