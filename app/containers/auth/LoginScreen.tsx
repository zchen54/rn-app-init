'use strict';

import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  StatusBar,
  ScrollView,
  Text,
  Image,
  Platform,
  TextInput,
} from 'react-native';
import {NavigationActions} from 'react-navigation';
import {PlatFormAndroid, releaseMode, serverURL} from '../../env';
import {login} from '../../store/actions';
import {
  deviceWidth,
  getLoginHistory,
  setLoginHistory,
  requestApiV2,
  API_v2,
} from '../../common/utils';
import {DColors, DFontSize, FONT_FAMILY} from '../../common/styles';
import {Modal, Portal, Toast} from '@ant-design/react-native';
import moment from 'moment';
import {WebView} from 'react-native-webview';

const Icon = {
  EyeVisible: require('../images/Index-Login/eyes.png'),
  EyeUnvisible: require('../images/Index-Login/close_eyes.png'),
  AdmineIcon: require('../images/Index-Login/email.png'),
  PasswordIcon: require('../images/Index-Login/password.png'),
  captchaIcon: require('../images/Index-Login/captcha.png'),
  DropDown: require('../images/Me/drop.png'),
  deleteQuestion: require('../images/template/Delete-question.png'),
  headerImageIcon: require('../images/Me/Portrait.png'),
};
const LogoImage = require('../images/Index-Login/bluebg.png');
const LogoIcon = require('../images/Index-Login/logo.png');
const resetAction = NavigationActions.navigate({routeName: 'Template'});

const LoginPage = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
};

interface State {
  EmailOrUsername: string;
  password: string;
  captcha: string;
  captchaSvg: string;
  eyeVisible: boolean;
  userDropdownVisible: boolean;
  loginHistory: Array<any>;
}
interface Props {
  navigation: any;
  loginFailedCount: number;
  errorTimeStamp: string;
  dispatch: Function;
}

class LoginScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      EmailOrUsername: '',
      password: '',
      captcha: '',
      captchaSvg: '',
      eyeVisible: false,
      userDropdownVisible: false,
      loginHistory: [],
    };
  }

  componentWillMount() {
    const {navigation} = this.props;
    let email = '';
    if (navigation.getParam('email')) {
      email = navigation.getParam('email');
      this.setState({EmailOrUsername: email});
    } else {
      getLoginHistory()
        .then(res => {
          if (res) {
            this.setState({loginHistory: res, EmailOrUsername: res[0].email});
          }
        })
        .catch(e => {
          console.log(e);
        });
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.handleGetCaptcha();
    }, 100);
  }

  componentWillReceiveProps(nextProps: Props) {
    let email = '';
    const {navigation, loginFailedCount, errorTimeStamp} = nextProps;
    if (navigation.getParam('email')) {
      email = navigation.getParam('email');
      this.setState({EmailOrUsername: email});
    }

    // 获取验证码
    setTimeout(() => {
      this.handleGetCaptcha();
    }, 100);
  }

  handleGetCaptcha = async () => {
    const {navigation, loginFailedCount, errorTimeStamp} = this.props;
    const {EmailOrUsername} = this.state;
    const duration = errorTimeStamp
      ? moment(errorTimeStamp).diff(moment(), 'hours')
      : 0;
    console.log('duration---', duration, loginFailedCount);
    if (EmailOrUsername && duration < 24 && loginFailedCount >= 3) {
      const url = `${serverURL}${
        API_v2.getCaptcha.url
      }?account=${EmailOrUsername}`;
      console.log(`url ${url}`);
      const captchaRes = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Connection: 'close',
          type: 'getUserData',
        },
      })
        .then(res => {
          return res.text();
        })
        .then(res => {
          return res;
        });
      if (captchaRes) {
        this.setState({captchaSvg: captchaRes});
      }
    }
  };

  handleSelectUserHistory = (userEmail: string) => {
    this.setState({
      EmailOrUsername: userEmail,
      password: '',
      userDropdownVisible: false,
    });
  };

  handleDeleteUserHistory = (item: string, index: number) => {
    Modal.alert('Delete login history ?', item + ' will be deleted', [
      {
        text: 'Cancel',
        onPress: () => {
          console.log('cancel');
        },
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          let {loginHistory, EmailOrUsername} = this.state;
          let tempArr = loginHistory;
          tempArr.splice(index, 1);
          setLoginHistory(tempArr);
          this.setState({
            userDropdownVisible: false,
            EmailOrUsername: EmailOrUsername === item ? '' : EmailOrUsername,
          });
        },
      },
    ]);
  };

  handleEmailOrUsername = (text: string) => {
    this.setState({
      EmailOrUsername: text,
    });
  };

  handlePassword = (text: string) => {
    this.setState({
      password: text,
    });
  };

  handleCaptcha = (text: string) => {
    this.setState({
      captcha: text,
    });
  };

  changePasswordType = () => {
    let {eyeVisible} = this.state;
    this.setState({
      eyeVisible: !eyeVisible,
    });
  };

  handleLogin = () => {
    Keyboard.dismiss();
    const {EmailOrUsername, password, captchaSvg, captcha} = this.state;
    if (EmailOrUsername === '') {
      Toast.fail('Email is required', 1, undefined, false);
      return;
    } else if (password === '') {
      Toast.fail('Password is required', 1, undefined, false);
      return;
    } else if (captchaSvg && captcha === '') {
      Toast.fail('Captcha is required', 1, undefined, false);
      return;
    }
    setTimeout(() => {
      this.props.dispatch(
        login(
          this.state.EmailOrUsername,
          this.state.password,
          this.state.captcha,
          (currentUserInfo: any) => {
            if (currentUserInfo && currentUserInfo.roleType === 4) {
              this.props.navigation.navigate('PersonalUser');
            } else {
              this.props.navigation.dispatch(resetAction);
            }
          },
        ),
      );
    }, 50);
  };

  handleSignUp = () => {
    Keyboard.dismiss();
    this.props.navigation.navigate('SignUp');
  };

  handleForgetPassword = () => {
    Keyboard.dismiss();
    this.props.navigation.navigate('ForgetPassword');
  };

  render() {
    const {
      EmailOrUsername,
      password,
      captcha,
      eyeVisible,
      userDropdownVisible,
      loginHistory,
      captchaSvg,
    } = this.state;
    const {loginFailedCount} = this.props;
    StatusBar.setBarStyle('dark-content', true);
    if (Platform.OS === PlatFormAndroid) {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('rgba(0,0,0,0)', true);
    }
    let userPic = '';
    let isLogined = false;
    loginHistory.forEach(item => {
      if (item.email === EmailOrUsername) {
        isLogined = true;
        userPic = item.userPic;
      }
    });

    return (
      <ScrollView
        style={{flex: 1, backgroundColor: '#f2f2f2'}}
        keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}>
          <View style={styles.container}>
            <View>
              <Image style={styles.logoStyle} source={LogoImage} />
              <Image style={styles.logoIconStyle} source={LogoIcon} />
              {isLogined ? (
                <Image
                  style={styles.userPicStyle}
                  source={
                    userPic
                      ? {
                          uri: userPic,
                        }
                      : Icon.headerImageIcon
                  }
                />
              ) : null}
            </View>
            <View style={styles.inputWrapper}>
              <View style={styles.itemRow}>
                <View style={styles.itemRowLeft}>
                  <View style={styles.imageWrapper}>
                    <Image
                      style={styles.userImageStyle}
                      source={Icon.AdmineIcon}
                    />
                  </View>
                  <TextInput
                    value={EmailOrUsername}
                    style={styles.inputStyle}
                    keyboardType="email-address"
                    placeholder="Email"
                    onChangeText={this.handleEmailOrUsername}
                    onFocus={() => {
                      this.setState({
                        userDropdownVisible: false,
                      });
                    }}
                    onBlur={this.handleGetCaptcha}
                  />
                </View>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 30,
                    height: 30,
                  }}
                  onPress={() => {
                    this.setState({
                      userDropdownVisible: !userDropdownVisible,
                    });
                  }}>
                  <Image
                    source={Icon.DropDown}
                    style={{width: 12, height: 7}}
                  />
                </TouchableOpacity>
              </View>
              {!userDropdownVisible && (
                <Fragment>
                  <View style={styles.line} />
                  <View style={styles.itemRow}>
                    <View style={styles.itemRowLeft}>
                      <View style={styles.imageWrapper}>
                        <Image source={Icon.PasswordIcon} />
                      </View>
                      <TextInput
                        value={password}
                        style={styles.inputStyle}
                        placeholder="Password"
                        secureTextEntry={!eyeVisible}
                        onChangeText={this.handlePassword}
                        onSubmitEditing={
                          captchaSvg ? undefined : this.handleLogin
                        }
                      />
                    </View>
                    <TouchableOpacity
                      onPress={this.changePasswordType}
                      style={styles.eyeWrapper}>
                      <Image
                        source={
                          eyeVisible ? Icon.EyeVisible : Icon.EyeUnvisible
                        }
                        style={styles.eyeStyle}
                      />
                    </TouchableOpacity>
                  </View>
                  {captchaSvg ? (
                    <Fragment>
                      <View style={styles.line} />
                      <View style={styles.itemRow}>
                        <View style={styles.captchaRowLeft}>
                          <View style={styles.imageWrapper}>
                            <Image source={Icon.captchaIcon} />
                          </View>
                          <TextInput
                            value={captcha}
                            style={styles.captchaStyle}
                            keyboardType="email-address"
                            placeholder="Captcha"
                            maxLength={4}
                            onChangeText={this.handleCaptcha}
                            onSubmitEditing={this.handleLogin}
                          />
                        </View>
                        <TouchableOpacity
                          onPress={this.handleGetCaptcha}
                          style={{width: 120, height: 40}}>
                          <WebView
                            originWhitelist={['*']}
                            source={{
                              html: `<!DOCTYPE html>
                            <html>
                              <head>
                                <meta
                                  name="viewport"
                                  content="maximum-scale=1.0,minimum-scale=1.0,user-scalable=0,width=device-width,initial-scale=1.0"
                                />
                                <style>
                                  body { margin: 0; padding: 0; }
                                  svg { width: 100%; height: 100%; }
                                </style>
                              </head>
                            <body>
                            ${captchaSvg}
                            </body>
                            </html>`,
                            }}
                            style={{
                              width: 120,
                              height: 40,
                              borderWidth: 1,
                              borderColor: 'gray',
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    </Fragment>
                  ) : null}
                </Fragment>
              )}
            </View>
            {userDropdownVisible && (
              <Fragment>
                <ScrollView style={styles.userDropdownList}>
                  {loginHistory.length ? (
                    loginHistory.map((item: any, index: number) => (
                      <View
                        style={
                          index !== 0
                            ? [styles.userDropdownItem, {borderTopWidth: 1}]
                            : styles.userDropdownItem
                        }
                        key={index}>
                        <TouchableOpacity
                          onPress={() => {
                            this.handleSelectUserHistory(item.email);
                          }}
                          style={styles.userDropdownTextWrap}>
                          <Text style={styles.userDropdownText}>
                            {item.email}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 30,
                            height: 30,
                          }}
                          onPress={() => {
                            this.handleDeleteUserHistory(item.email, index);
                          }}>
                          <Image
                            source={Icon.deleteQuestion}
                            style={{width: 10, height: 10}}
                          />
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View style={styles.userDropdownItem}>
                      <Text>No history</Text>
                    </View>
                  )}
                </ScrollView>
              </Fragment>
            )}
            {!userDropdownVisible && (
              <Fragment>
                <TouchableOpacity
                  style={
                    releaseMode
                      ? styles.LoginButton
                      : {
                          ...styles.LoginButton,
                          backgroundColor: DColors.auxiliaryOrange,
                        }
                  }
                  onPress={this.handleLogin}>
                  <Text style={styles.confirmText}>
                    {releaseMode ? 'Login' : `Login Beta`}
                  </Text>
                </TouchableOpacity>
                <View style={styles.textRow}>
                  <Text style={styles.signupStyle} onPress={this.handleSignUp}>
                    sign up
                  </Text>
                  <Text
                    style={styles.forgetStyle}
                    onPress={this.handleForgetPassword}>
                    forget password
                  </Text>
                </View>
              </Fragment>
            )}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
  },
  logoStyle: {
    width: deviceWidth,
    height: 305,
  },
  inputWrapper: {
    width: deviceWidth - 66,
    // height: 93,
    marginTop: 12,
    backgroundColor: '#ffffff',
    paddingLeft: 17,
    paddingRight: 17,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    height: 46,
    alignItems: 'center',
  },
  itemRowLeft: {
    width: deviceWidth - 140,
    flexDirection: 'row',
    height: 46,
    alignItems: 'center',
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#CBCBCB',
  },
  imageWrapper: {
    width: 25,
    height: 20,
    borderRightColor: '#CDCDCD',
    borderRightWidth: 1,
    justifyContent: 'center',
  },
  userImageStyle: {
    width: 15,
    height: 16,
  },
  passwordImageStyle: {
    width: 13,
    height: 15,
  },
  inputStyle: {
    width: deviceWidth - 180,
    padding: 0,
    marginLeft: 10,
    fontSize: 16,
  },
  captchaRowLeft: {
    width: deviceWidth - 260,
    flexDirection: 'row',
    height: 46,
    alignItems: 'center',
  },
  captchaStyle: {
    width: deviceWidth - 300,
    padding: 0,
    marginLeft: 10,
    fontSize: 16,
  },
  eyeWrapper: {
    width: 20,
    height: '100%',
    marginLeft: 2,
    marginRight: 0,
    justifyContent: 'center',
  },
  eyeStyle: {
    width: 16,
    height: 12,
  },
  LoginButton: {
    width: deviceWidth - 66,
    height: 40,
    marginTop: 50,
    borderRadius: 20,
    backgroundColor: DColors.mainColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: deviceWidth - 120,
    marginTop: 27,
  },
  signupStyle: {
    fontSize: 16,
    color: LoginPage.mainColor,
  },
  forgetStyle: {
    fontSize: 16,
    color: '#999999',
  },
  userDropdownList: {
    width: deviceWidth - 66,
    maxHeight: 240,
    paddingHorizontal: 17,
    backgroundColor: '#fff',
    marginTop: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  userDropdownItem: {
    flexDirection: 'row',
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopColor: '#ddd',
  },
  userDropdownTextWrap: {
    height: 30,
    justifyContent: 'center',
    paddingLeft: 10,
  },
  userDropdownText: {
    fontSize: 14,
    color: '#333',
  },
  logoIconStyle: {
    position: 'absolute',
    top: 67,
    width: 133,
    height: 133,
    left: (deviceWidth - 133) / 2,
  },
  userPicStyle: {
    position: 'absolute',
    top: 100,
    width: 67,
    height: 67,
    left: (deviceWidth - 67) / 2,
    borderRadius: 67 / 2,
    backgroundColor: '#fff',
  },
});

const mapStateToProps = (state: any) => {
  return {
    loginFailedCount: state.loginInfo.loginFailedCount,
    errorTimeStamp: state.loginInfo.errorTimeStamp,
  };
};

export default connect(mapStateToProps)(LoginScreen);
