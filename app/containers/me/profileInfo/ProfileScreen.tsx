import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {PlatFormAndroid, ErrorMessage_Network_Offline} from '../../../env';
import {
  TitleBarNew,
  DImagePreview,
  ActionSheet,
} from '../../../common/components';
import {logout} from '../../../store/actions';
import ImagePicker from 'react-native-image-picker';
import {changeUserInfo} from '../../../store/actions/loginAction';
import {
  getLoginHistory,
  setLoginHistory,
  uploadImage,
  API_v2,
  deviceWidth,
  getIn,
  isNetworkConnected,
  mediaPicker,
} from '../../../common/utils';
import {FONT_FAMILY} from '../../../common/styles';
import {Toast} from '@ant-design/react-native';

interface State {
  previewVisible: boolean;
  visible: boolean;
}
interface Props {
  navigation: any;
  logout: (authToken: string, callback?: Function) => void;
  currentUserInfo: any;
  dispatch: Function;
}

const Icon = {
  QRCodeIcon: require('../../images/Me/QR.png'),
  EnterIcon: require('../../images/Me/enterwhite.png'),
  headerImageIcon: require('../../images/Me/Portrait.png'),
};

export class ProfileScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      previewVisible: false,
      visible: false,
    };
  }

  renderItems = () => {
    const {currentUserInfo} = this.props;
    const isPersonalUser =
      currentUserInfo.company && currentUserInfo.company !== '' ? false : true;
    const departmentName = currentUserInfo.departmentName || 'All Departments';
    const {phone} = currentUserInfo;

    let phoneFormat = phone;
    if (phone) {
      let tempArr = phone.split(' - ');
      if (tempArr.length === 2) {
        phoneFormat = `${tempArr[0]} ${tempArr[1]}`;
      } else if (tempArr.length === 3) {
        phoneFormat = `${tempArr[1]} ${tempArr[2]}`;
      }
    }

    return (
      <View style={styles.itemsWrapper}>
        <TouchableOpacity
          onPress={() => {
            this.setState({visible: true});
          }}>
          <View style={styles.itemStyle}>
            <View style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>Profile Picture</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  onPress={() => {
                    this.handlePreviewVisible(true);
                  }}>
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
                </TouchableOpacity>

                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.handleChangeNickName}>
          <View style={styles.itemStyle}>
            <View
              style={{
                ...styles.itemTextWrapper,
                borderBottomColor: '#D9D9D9',
                borderTopColor: '#D9D9D9',
                borderBottomWidth: 1,
                borderTopWidth: 1,
              }}>
              <Text style={styles.itemText}>Alias</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.itemTextTwo}>
                  {currentUserInfo.nickName}
                </Text>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.handleChangeGender}>
          <View style={styles.itemStyle}>
            <View
              style={{
                ...styles.itemTextWrapper,
                borderBottomColor: '#D9D9D9',
                borderBottomWidth: 1,
              }}>
              <Text style={styles.itemText}>Gender</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.itemTextTwo}>
                  {currentUserInfo.gender === 1
                    ? 'Woman'
                    : currentUserInfo.gender === 0
                    ? 'Man'
                    : currentUserInfo.gender === 3
                    ? 'Other'
                    : ''}
                </Text>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.handleChangePhone}>
          <View style={styles.itemStyle}>
            <View style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>Phone</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.itemTextTwo}>{phoneFormat}</Text>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.handleScanQRCode}>
          <View style={styles.itemStyle}>
            <View
              style={{
                ...styles.itemTextWrapper,
                borderBottomColor: '#D9D9D9',
                borderTopColor: '#D9D9D9',
                borderBottomWidth: 1,
                borderTopWidth: 1,
              }}>
              <Text style={styles.itemText}>My QR Code</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image style={styles.QR} source={Icon.QRCodeIcon} />
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity> */}
        <View style={styles.itemStyle}>
          <View
            style={{
              ...styles.itemTextWrapper,
              borderBottomColor: '#D9D9D9',
              borderBottomWidth: 1,
            }}>
            <Text style={styles.itemText}>Email</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text numberOfLines={1} style={styles.itemTextTwo}>
                {currentUserInfo.email}
              </Text>
              <View style={styles.enterStyle} />
            </View>
          </View>
        </View>
        {/* </TouchableOpacity> */}
        {/* <TouchableOpacity> */}
        {!isPersonalUser && (
          <View style={styles.itemStyle}>
            <View style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>Department</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.itemTextTwo}>{departmentName}</Text>
                <View style={styles.enterStyle} />
              </View>
            </View>
          </View>
        )}
        {/* </TouchableOpacity> */}
      </View>
    );
  };

  handleChangeNickName = () => {
    const {navigation} = this.props;
    navigation.navigate('NickName');
  };

  handleChangeGender = () => {
    const {navigation} = this.props;
    navigation.navigate('Gender');
  };

  handleChangePhone = () => {
    const {navigation} = this.props;
    navigation.navigate('PhoneEdit');
  };

  handleScanQRCode = () => {
    const {navigation} = this.props;
    navigation.navigate('QRCode');
  };

  handleLibrary = () => {
    const {currentUserInfo} = this.props;
    const {authToken} = currentUserInfo;

    isNetworkConnected()
      .then(isConnected => {
        if (isConnected) {
          let reqObj = {
            width: 300,
            height: 300,
            cropping: true,
            cropperCircleOverlay: true,
          };
          mediaPicker({selectType: 'gallery', reqObj}, (res: any) => {
            uploadImage(
              API_v2.uploadFile,
              [res.path],
              currentUserInfo.authToken,
            ).then((res: any) => {
              console.log('Response =---- ', res);
              if (res.result === 'Success') {
                this.props.dispatch(
                  changeUserInfo(
                    authToken,
                    '',
                    res.data[0],
                    undefined,
                    undefined,
                    () => {
                      getLoginHistory()
                        .then(loginHistory => {
                          if (loginHistory) {
                            let history = loginHistory;
                            history.forEach((item: any) => {
                              if (item.email === currentUserInfo.email) {
                                item.userPic = res.data[0];
                                setLoginHistory(history);
                              }
                            });
                          }
                        })
                        .catch(err => {
                          console.log('err', err);
                        });
                    },
                  ),
                );
                this.setState({
                  visible: false,
                });
              }
            });
          });
        } else {
          Toast.offline(ErrorMessage_Network_Offline, 2);
          return {RCode: -1, RMsg: ErrorMessage_Network_Offline};
        }
      })
      .catch(e => {
        console.log(e);

        Toast.offline(ErrorMessage_Network_Offline, 2);
        return {RCode: -1, RMsg: ErrorMessage_Network_Offline};
      });
  };

  handleCamera = () => {
    const {currentUserInfo} = this.props;
    const {authToken} = currentUserInfo;

    isNetworkConnected()
      .then(isConnected => {
        console.log('isConnected', isConnected);

        if (isConnected) {
          let reqObj = {
            width: 300,
            height: 300,
            cropping: true,
            cropperCircleOverlay: true,
          };
          mediaPicker({selectType: 'camera', reqObj}, (res: any) => {
            uploadImage(
              API_v2.uploadFile,
              [res.path],
              currentUserInfo.authToken,
            ).then((res: any) => {
              console.log('Response =---- ', res);
              if (res.result === 'Success') {
                this.props.dispatch(
                  changeUserInfo(
                    authToken,
                    '',
                    res.data[0],
                    undefined,
                    undefined,
                    () => {
                      getLoginHistory()
                        .then(loginHistory => {
                          if (loginHistory) {
                            let history = loginHistory;
                            history.forEach((item: any) => {
                              if (item.email === currentUserInfo.email) {
                                item.userPic = res.data[0];
                                setLoginHistory(history);
                              }
                            });
                          }
                        })
                        .catch(err => {
                          console.log('err', err);
                        });
                    },
                  ),
                );
                this.setState({
                  visible: false,
                });
              }
            });
          });
        } else {
          Toast.offline(ErrorMessage_Network_Offline, 2);
          return {RCode: -1, RMsg: ErrorMessage_Network_Offline};
        }
      })
      .catch(() => {
        Toast.offline(ErrorMessage_Network_Offline, 2);
        return {RCode: -1, RMsg: ErrorMessage_Network_Offline};
      });
  };

  handlePreviewVisible = (visible: boolean) => {
    this.setState({previewVisible: visible});
  };

  render() {
    const {navigation, currentUserInfo} = this.props;
    const {previewVisible} = this.state;
    StatusBar.setBarStyle('light-content', true);
    if (Platform.OS === PlatFormAndroid) {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('rgba(0,0,0,0)', true);
    }
    return (
      <View style={styles.normal}>
        <TitleBarNew title={'My Profile'} navigation={navigation} />
        {this.renderItems()}
        <DImagePreview
          visible={previewVisible}
          imageUrls={[
            currentUserInfo.userPic
              ? {
                  url: currentUserInfo.userPic,
                }
              : {
                  url: '',
                  props: {
                    // Or you can set source directory.
                    source: Icon.headerImageIcon,
                  },
                },
          ]}
          index={0}
          handleClose={() => {
            this.handlePreviewVisible(false);
          }}
        />
        <ActionSheet
          visible={this.state.visible}
          onClose={() => {
            this.setState({
              visible: false,
            });
          }}
          selections={['Take a photo', 'Select from the album']}
          functions={[this.handleCamera, this.handleLibrary]}
        />
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
    // backgroundColor: "#F38900"
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
    marginTop: 7,
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
    maxWidth: 0.5 * deviceWidth,
    marginRight: 16,
    fontSize: 16,
    color: '#757575',
  },
});

const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo,
  };
};

export default connect(mapStateToProps)(ProfileScreen);
