import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import {Modal as AntdModal} from '@ant-design/react-native';
import {TitleBarNew} from '../../../common/components';
import {DColors} from '../../../common/styles';
import {setAutoSubmitDraft, getAutoSubmitDraft} from '../../../common/utils';
import {logout} from '../../../store/actions';
import {FONT_FAMILY} from '../../../common/styles';
import ClearCache from 'react-native-clear-cache';
import {PlatFormAndroid} from '../../../env';
import {isStaffInCompany} from '../../template/judgement';

interface State {
  cacheSize: string;
  autuSubmitDraft: boolean;
}
interface Props {
  navigation: any;
  logout: (authToken: string, callback?: Function) => void;
  currentUserInfo: any;
}

const Icon = {
  QRCodeIcon: require('../../images/Me/QR.png'),
  EnterIcon: require('../../images/Me/enterwhite.png'),
};

export class SettingsScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      cacheSize: '',
      autuSubmitDraft: false,
    };
  }

  componentWillMount() {
    ClearCache.getAppCacheSize((value: string, unit: string) => {
      this.setState({
        cacheSize: value + unit,
      });
    });
    // get system setting
    getAutoSubmitDraft()
      .then(res => {
        this.setState({
          autuSubmitDraft: res,
        });
      })
      .catch(e => {
        console.log(e.message);
        this.setState({
          autuSubmitDraft: false,
        });
      });
  }

  handleSetAutoSubmitDraft = (autuSubmitDraft: boolean) => {
    setAutoSubmitDraft(autuSubmitDraft);
    this.setState({
      autuSubmitDraft: autuSubmitDraft,
    });
  };

  handleClearAppCache = () => {
    AntdModal.alert('Are you sure to clear the cache?', '', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Sure',
        onPress: () => {
          ClearCache.clearAppCache(() => {
            ClearCache.getAppCacheSize((value: string, unit: string) => {
              this.setState({
                cacheSize: value + unit,
              });
            });
          });
        },
      },
    ]);
  };

  handleLogout = () => {
    const {navigation, currentUserInfo} = this.props;
    console.log('Login again after logout');
    this.props.logout(currentUserInfo.authToken, () => {
      navigation.navigate('Login');
    });
  };

  renderItems = () => {
    const {currentUserInfo, navigation} = this.props;
    const {cacheSize, autuSubmitDraft} = this.state;
    return (
      <View style={styles.itemsWrapper}>
        {isStaffInCompany(currentUserInfo) ? (
          <View style={{marginBottom: 8}}>
            <View style={styles.itemStyle}>
              <View style={styles.itemTextWrapper}>
                <Text style={styles.itemText}>Auto submit data</Text>
                <Switch
                  value={autuSubmitDraft}
                  trackColor={{false: '#ccc', true: DColors.mainColor}}
                  ios_backgroundColor="#ccc"
                  thumbColor="#fff"
                  onValueChange={this.handleSetAutoSubmitDraft}
                  style={{marginRight: 17}}
                />
              </View>
            </View>
          </View>
        ) : null}
        <TouchableOpacity
          style={{marginBottom: 8}}
          onPress={() => navigation.navigate('PasswordChange')}>
          <View style={styles.itemStyle}>
            <View style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>Change password</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Feedback')}>
          <View style={styles.itemStyle}>
            <View style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>Feedback</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={() => navigation.navigate("Invite")}>
          <View style={styles.itemStyle}>
            <View
              style={{
                ...styles.itemTextWrapper,
                borderTopColor: "#D9D9D9",
                borderTopWidth: 1
              }}
            >
              <Text style={styles.itemText}>Invite Friends</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  style={{ ...styles.enterStyle, tintColor: "#B3B3B3" }}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity> */}
        <TouchableOpacity onPress={() => navigation.navigate('Help')}>
          <View style={styles.itemStyle}>
            <View
              style={{
                ...styles.itemTextWrapper,
                borderTopColor: '#D9D9D9',
                borderTopWidth: 1,
              }}>
              <Text style={styles.itemText}>Help</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('About')}>
          <View style={styles.itemStyle}>
            <View
              style={{
                ...styles.itemTextWrapper,
                borderTopColor: '#D9D9D9',
                borderTopWidth: 1,
              }}>
              <Text style={styles.itemText}>About Data2Go</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.handleClearAppCache}>
          <View style={styles.itemStyle}>
            <View
              style={{
                ...styles.itemTextWrapper,
                borderTopColor: '#D9D9D9',
                borderTopWidth: 1,
              }}>
              <Text style={styles.itemText}>Clear the cache</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.itemTextTwo}>{cacheSize}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    let {navigation} = this.props;
    return (
      <View style={styles.normal}>
        <TitleBarNew title={'Settings'} navigation={navigation} />
        {this.renderItems()}
        <TouchableOpacity style={{marginTop: 8}} onPress={this.handleLogout}>
          <View style={styles.itemStyle}>
            <View style={styles.logOutStyle}>
              <Text style={styles.itemTextTwo}>Log Out</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  Avatar: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    marginRight: 16,
    // backgroundColor: '#F38900',
  },
  QR: {
    width: 17,
    height: 16,
    marginRight: 16,
  },
  enterStyle: {
    position: 'relative',
    width: 7,
    height: 12,
    marginRight: 17,
  },
  itemsWrapper: {
    marginTop: 8,
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
  itemText: {
    fontSize: 16,
    color: '#2E2E2E',
  },
  itemTextTwo: {
    marginRight: 16,
    fontSize: 16,
    color: '#1E9DFC',
  },
  logOutStyle: {
    height: 52,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    logout: (authToken: string, callback?: Function) => {
      dispatch(logout(authToken, callback));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsScreen);
