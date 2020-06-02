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
  Keyboard,
} from 'react-native';
import {Toast, Modal, Portal} from '@ant-design/react-native';
import {filterIndustryById} from '../createOrg/commonData';
import {
  requestApiV2,
  API_v2,
  deviceWidth,
  deviceHeight,
  statusBarHeight,
  getSearchOrganizationHistory,
  setSearchOrganizationHistory,
  clearSearchOrganizationHistory,
} from '../../../common/utils';
import {FONT_FAMILY} from '../../../common/styles';
import {joinCompany} from '../../../store/actions';
import {toastTips} from '../../../common/constants';

interface State {
  hasSearchResult: boolean;
  searchResultList: Array<any>;
  searchValue: string;
  history: Array<string>;
}
interface Props {
  authToken: string;
  currentUserInfo: any;
  navigation: any;
  joinCompany: (
    authToken: string,
    companyPkey: string,
    callback?: Function,
  ) => void;
}
const Page = {
  font_family: FONT_FAMILY,
};

const Icon = {
  SearchIcon: require('../../images/Me/search.png'),
  CloseIcon: require('../../images/Me/close.png'),
  HistoryIcon: require('../../images/Me/history.png'),
  companyImageIcon: require('../../images/Me/Portrait_company.png'),
};

export class SearchOrganization extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasSearchResult: false,
      searchResultList: [],
      searchValue: '',
      history: [],
    };
  }

  componentDidMount() {
    this.initState(this.props);
  }

  componentWillUnmount() {
    let {history} = this.state;
    setSearchOrganizationHistory(history);
  }

  initState = (props: Props) => {
    let history = [];
    getSearchOrganizationHistory()
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
  };

  onCancel = () => {
    this.props.navigation.goBack();
  };

  handleChange = (text: string) => {
    this.setState({
      searchValue: text,
    });
  };

  handleEnter = ({nativeEvent}: any) => {
    let {text} = nativeEvent;
    if (text === '') {
      return;
    }
    this.handleSearch(text);
  };

  handleDeleteHistory = (text: string) => {
    let {history} = this.state;
    let newHistory = history.filter(item => item !== text).splice(0, 10);
    this.setState({
      history: newHistory,
    });
    setSearchOrganizationHistory(newHistory);
  };

  handleClearHistory = () => {
    this.setState({
      history: [],
    });
    clearSearchOrganizationHistory();
  };

  handleSearch = (text?: string) => {
    Keyboard.dismiss();
    const {authToken, navigation} = this.props;
    const {history} = this.state;
    let searchValue = text || this.state.searchValue;
    const toastKey = Toast.loading('Searching...', 0);
    requestApiV2(API_v2.getCompany, {name: searchValue}, authToken)
      .then(res => {
        // set history
        let newHistory = history.filter((item: string) => item !== searchValue);
        this.setState({
          history: [searchValue, ...newHistory].splice(0, 10),
        });
        setSearchOrganizationHistory(
          [searchValue, ...newHistory].splice(0, 10),
        );
        Portal.remove(toastKey);
        if (res.result === 'Success') {
          console.log('===', res);
          if (Array.isArray(res.data) && res.data.length) {
            this.setState({
              hasSearchResult: true,
              searchResultList: res.data,
            });
          } else {
            Toast.fail(toastTips.FailedSearchOrg, 2);
          }
        } else if (res.error) {
          Modal.alert('Search company failed !', res.error, [
            {text: 'OK', onPress: () => {}},
          ]);
        }
      })
      .catch(error => {
        Portal.remove(toastKey);
        console.error(error);
      });
  };

  handleJoinCompany = (companyId: string) => {
    const {authToken, navigation} = this.props;
    this.props.joinCompany(authToken, companyId, () => {
      navigation.navigate('PersonalGuide');
    });
  };

  render() {
    const {
      searchValue,
      history,
      hasSearchResult,
      searchResultList,
    } = this.state;
    const {currentUserInfo} = this.props;
    let companypKey = currentUserInfo.company || '';
    StatusBar.setBarStyle('dark-content', true);

    const _renderSearch = () => {
      return (
        <View style={styles.searchWrapper}>
          <View style={styles.container}>
            <View style={styles.inputWrapper}>
              <Image style={styles.serachIconStyle} source={Icon.SearchIcon} />
              <TextInput
                placeholder="Search"
                // autoFocus={true}
                onFocus={() => {
                  this.setState({
                    hasSearchResult: false,
                  });
                }}
                value={searchValue}
                style={styles.inputStyle}
                onChangeText={this.handleChange}
                onSubmitEditing={this.handleEnter}
                returnKeyType={'search'}
              />
            </View>
            <Text style={styles.cancelStyle} onPress={this.onCancel}>
              Cancel
            </Text>
          </View>
        </View>
      );
    };

    const _renderSearchWrap = () => {
      const _renderHistoryItem = (data: any) => {
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

      return (
        <View>
          {searchValue ? (
            <TouchableOpacity
              onPress={() => {
                this.handleSearch();
              }}>
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
                renderItem={data => _renderHistoryItem(data)}
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
    };

    const _renderSearchResultList = () => {
      const _renderCompanyItem = (data: any) => {
        const {index, item} = data;
        return (
          <View style={styles.companyItem}>
            <View style={styles.companyMainInfo}>
              {item.logo ? (
                <Image
                  style={styles.Avatar}
                  source={{
                    uri: item.logo,
                  }}
                />
              ) : (
                <Image style={styles.Avatar} source={Icon.companyImageIcon} />
              )}
              <View style={styles.mainInfo}>
                <Text numberOfLines={2} style={styles.companyName}>
                  {item.name}
                </Text>
                <Text style={styles.adminName}>
                  Administrator: {item.admin}
                </Text>
              </View>
            </View>
            <View style={styles.companyDetail}>
              <View style={{...styles.detailItem, borderBottomWidth: 1}}>
                <Text style={styles.detailLabel}>Industry</Text>
                <Text style={styles.detailValue}>
                  {filterIndustryById(item.industryId)}
                </Text>
              </View>
              <View style={{...styles.detailItem, borderBottomWidth: 1}}>
                <Text style={styles.detailLabel}>Scale</Text>
                <Text style={styles.detailValue}>{item.scale}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Region</Text>
                <Text style={styles.detailValue}>{item.address}</Text>
              </View>
            </View>
            {item._id !== companypKey && (
              <TouchableOpacity
                onPress={() => {
                  this.handleJoinCompany(item._id);
                }}
                style={styles.companyHandler}>
                <Text style={styles.handlerText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      };
      return (
        <View style={{flex: 1}}>
          <FlatList
            data={searchResultList}
            renderItem={data => _renderCompanyItem(data)}
            keyExtractor={(item, index) => index + ''}
          />
        </View>
      );
    };

    return (
      <View style={styles.normal}>
        {_renderSearch()}
        {hasSearchResult ? _renderSearchResultList() : _renderSearchWrap()}
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
    fontFamily: Page.font_family,
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
  companyItem: {marginBottom: 20},
  companyMainInfo: {
    height: 100,
    flexDirection: 'row',
    paddingHorizontal: 25,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  Avatar: {
    width: 64,
    height: 64,
    // backgroundColor: "#F38900",
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  mainInfo: {
    marginLeft: 12,
    paddingTop: 2,
  },
  companyName: {
    width: deviceWidth - 120,
    fontSize: 20,
    color: '#2E2E2E',
  },
  adminName: {fontSize: 14, color: '#757575', marginTop: 6},
  companyDetail: {
    marginTop: 8,
    paddingLeft: 17,
    backgroundColor: '#fff',
  },
  detailItem: {
    height: 52,
    paddingRight: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#F2F2F2',
  },
  detailLabel: {fontSize: 16, color: '#2E2E2E'},
  detailValue: {fontSize: 16, color: '#757575'},
  companyHandler: {
    height: 52,
    marginTop: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  handlerText: {fontSize: 16, color: '#1E9DFC'},
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    joinCompany: (
      authToken: string,
      companyPkey: string,
      callback?: Function,
    ) => {
      dispatch(joinCompany(authToken, companyPkey, callback));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchOrganization);
