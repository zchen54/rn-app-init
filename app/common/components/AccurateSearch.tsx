import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  FlatList,
} from 'react-native';
import {
  statusBarHeight,
  deviceHeight,
  searchType,
  getSearchEmailHistory,
  setSearchEmailHistory,
  clearSearchEmailHistory,
  deviceWidth,
} from '../utils';
import {searchUserByEmail} from '../../store/actions';
import {FONT_FAMILY} from '../styles';

interface State {
  searchValue: string;
  history: Array<string>;
}

interface Props {
  navigation: any;
  currentUserInfo: any;
  searchUserByEmail: Function;
  // friends: any;
}

const Page = {
  font_family: FONT_FAMILY,
};

const Icon = {
  SearchIcon: require('../../assets/images/Me/search.png'),
  CloseIcon: require('../../assets/images/Me/close.png'),
  HistoryIcon: require('../../assets/images/Me/history.png'),
};

export class AccurateSearch extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchValue: '',
      history: [],
    };
  }

  componentDidMount() {
    this.initState(this.props);
  }

  componentWillUnmount() {
    let {history} = this.state;
    let type = this.props.navigation.getParam('type');
    if (
      type === searchType.FriendEmail ||
      type === searchType.InviteEmployeesByEmail
    ) {
      setSearchEmailHistory(history);
    }
  }

  initState = (props: Props) => {
    let history = [];
    let type = this.props.navigation.getParam('type');
    if (
      type === searchType.FriendEmail ||
      type === searchType.InviteEmployeesByEmail
    ) {
      getSearchEmailHistory()
        .then(res => {
          if (res) {
            console.log('res', res);
            history = res;
            this.setState({
              history,
            });
          }
        })
        .catch(e => {
          console.log(e);
        });
    }
  };

  onCancel = () => {
    this.props.navigation.goBack();
  };

  handleChange = (text: string) => {
    this.setState({
      searchValue: text,
    });
  };

  handleEnter = () => {
    let {history, searchValue} = this.state;
    let type = this.props.navigation.getParam('type');
    if (searchValue === '') {
      return;
    }
    let newHistory = history.filter(item => item !== searchValue);
    this.setState({
      history: [searchValue, ...newHistory].splice(0, 10),
    });
    if (
      type === searchType.FriendEmail ||
      type === searchType.InviteEmployeesByEmail
    ) {
      setSearchEmailHistory([searchValue, ...newHistory].splice(0, 10));
    }
  };

  handleDeleteHistory = (text: string) => {
    let {history} = this.state;
    let type = this.props.navigation.getParam('type');
    let newHistory = history.filter(item => item !== text);
    this.setState({
      history: newHistory.splice(0, 10),
    });
    if (
      type === searchType.FriendEmail ||
      type === searchType.InviteEmployeesByEmail
    ) {
      setSearchEmailHistory(newHistory.splice(0, 10));
    }
  };

  handleClearHistory = () => {
    let type = this.props.navigation.getParam('type');
    this.setState({
      history: [],
    });
    if (
      type === searchType.FriendEmail ||
      type === searchType.InviteEmployeesByEmail
    ) {
      clearSearchEmailHistory();
    }
  };

  handleSearch = () => {
    let {currentUserInfo, navigation} = this.props;
    let {authToken} = currentUserInfo;
    let {searchValue, history} = this.state;
    let newHistory = history.filter(item => item !== searchValue);
    this.setState({
      history: [searchValue, ...newHistory].splice(0, 10),
    });
    setSearchEmailHistory([searchValue, ...newHistory].splice(0, 10));
    this.props.searchUserByEmail(authToken, searchValue, () => {
      navigation.navigate('FriendInfo', {
        type: navigation.getParam('type'),
      });
    });
  };

  _renderItem = (data: any) => {
    const {index, item} = data;
    return (
      <TouchableOpacity
        onPress={() =>
          this.setState({
            searchValue: item,
          })
        }>
        <View style={styles.itemWrapper}>
          <Image style={styles.imageStyle} source={Icon.HistoryIcon} />
          <View style={index === 0 ? null : styles.line}>
            <Text style={styles.searchValueStyle}>{item}</Text>
          </View>
          <TouchableOpacity
            style={styles.closeImageStyle}
            onPress={() => this.handleDeleteHistory(item)}>
            <Image source={Icon.CloseIcon} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const {searchValue, history} = this.state;
    StatusBar.setBarStyle('dark-content', true);
    return (
      <View style={styles.normal}>
        <View style={styles.searchWrapper}>
          <View style={styles.container}>
            <View style={styles.inputWrapper}>
              <Image style={styles.serachIconStyle} source={Icon.SearchIcon} />
              <TextInput
                keyboardType="email-address"
                placeholder="Search"
                value={searchValue}
                style={styles.inputStyle}
                onChangeText={this.handleChange}
                onBlur={this.handleEnter}
                returnKeyType={'search'}
              />
            </View>
            <Text style={styles.cancelStyle} onPress={this.onCancel}>
              Cancel
            </Text>
          </View>
        </View>
        {searchValue ? (
          <TouchableOpacity onPress={this.handleSearch}>
            <View style={styles.emailWrapper}>
              <View style={styles.SearchIconWrapper}>
                <Image
                  source={Icon.SearchIcon}
                  style={{...styles.serachIconStyle, tintColor: '#FFFFFF'}}
                />
              </View>
              <Text style={styles.searchValueStyle}>Search: </Text>
              <Text style={styles.searchStyle}>{searchValue}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{maxHeight: deviceHeight - statusBarHeight - 53}}>
            <FlatList
              data={history}
              renderItem={data => this._renderItem(data)}
              keyExtractor={(item, index) => item + index}
            />
            {history.length > 0 ? (
              <TouchableOpacity
                style={{marginTop: 8}}
                onPress={this.handleClearHistory}>
                <View style={styles.clearButton}>
                  <Text style={styles.clearTextStyle}>
                    Clear search records
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
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
  searchWrapper: {
    width: '100%',
    height: 53 + statusBarHeight,
    flexDirection: 'row',
    paddingLeft: 17,
    paddingRight: 17,
    paddingTop: statusBarHeight,
    backgroundColor: '#F2F2F2',
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    height: 53,
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    width: deviceWidth - 100,
    height: 33,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 3,
  },
  serachIconStyle: {
    width: 15,
    height: 15,
  },
  inputStyle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    padding: 0,
    flex: 1,
    paddingLeft: 6,
  },
  cancelStyle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#1E9DFC',
    width: 80,
    paddingLeft: 17,
  },
  itemWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: 48,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  imageStyle: {
    width: 15,
    height: 15,
    marginLeft: 17,
    marginRight: 17,
  },
  line: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    height: 48,
    justifyContent: 'center',
  },
  searchValueStyle: {
    fontSize: 16,
    color: '#2E2E2E',
  },
  closeImageStyle: {
    position: 'absolute',
    right: 0,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearTextStyle: {
    fontFamily: Page.font_family,
    fontSize: 14,
    color: '#757575',
  },
  emailWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: 52,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  SearchIconWrapper: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    marginLeft: 17,
    marginRight: 14,
    backgroundColor: '#1E9DFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchStyle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#1E9DFC',
  },
});

const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo,
    // friends: state.friendsList.friends
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    searchUserByEmail: (
      authToken: string,
      email: string,
      callback?: Function,
    ) => dispatch(searchUserByEmail(authToken, email, callback)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AccurateSearch);
