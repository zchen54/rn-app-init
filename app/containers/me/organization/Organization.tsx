import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {Modal, Toast, Portal} from '@ant-design/react-native';
import {fetchCompanyInfo, quitCompany} from '../../../store/actions';
import {TitleBarNew} from '../../../common/components';
import {deviceWidth, getIn} from '../../../common/utils';
import {FONT_FAMILY} from '../../../common/styles';
import {
  setPressOrgCountForDev,
  getPressOrgCountForDev,
} from '../../../common/utils';
import {releaseMode} from '../../../env';

interface State {
  pressOrgCountForDev: number;
}
interface Props {
  navigation: any;
  currentUserInfo: any;
  companyInfo: any;
  fetchCompanyInfo: (
    authToken: string,
    companyPkey: string,
    callback?: Function,
  ) => void;
  quitCompany: (authToken: string, callback?: Function) => void;
}
const Page = {
  font_family: FONT_FAMILY,
};

const Icon = {
  MessageIcon: require('../../images/Me/message.png'),
  EnterIcon: require('../../images/Me/enterwhite.png'),
  FriendsIcon: require('../../images/Me/friend.png'),
  GroupIcon: require('../../images/Me/Group.png'),
  OrganizationIcon: require('../../images/Me/Organization.png'),
  SettingIcon: require('../../images/Me/setting.png'),
  QRCodeIcon: require('../../images/Me/QR.png'),
  companyImageIcon: require('../../images/Me/Portrait_company.png'),
};

export class Organization extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pressOrgCountForDev: 0,
    };
  }

  componentWillMount() {
    const {currentUserInfo} = this.props;
    this.props.fetchCompanyInfo(
      currentUserInfo.authToken,
      currentUserInfo.company,
    );

    if (!releaseMode) {
      getPressOrgCountForDev()
        .then(res => {
          this.setState({
            pressOrgCountForDev: res,
          });
        })
        .catch(e => {
          console.log(e.message);
          this.setState({
            pressOrgCountForDev: 0,
          });
        });
    }
  }

  handleQuitCompany = () => {
    let {navigation, currentUserInfo, companyInfo} = this.props;
    Modal.alert('Are you sure to exit the organization ?', '', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Sure',
        onPress: () => {
          this.props.quitCompany(currentUserInfo.authToken, () => {
            if (currentUserInfo._id === companyInfo.owner) {
              Toast.success('Successfully exited', 2);
            } else {
              Toast.success('The request was sent successfully', 2);
            }
            navigation.navigate('Me');
          });
        },
      },
    ]);
  };

  handleOnPressCompany = () => {
    const {pressOrgCountForDev} = this.state;
    let newCount = pressOrgCountForDev + 1;
    setPressOrgCountForDev(newCount);
    this.setState({
      pressOrgCountForDev: newCount,
    });
    if (newCount === 8) {
      Toast.info('Test environment', 1);
    }
  };

  render() {
    let {navigation, currentUserInfo, companyInfo} = this.props;
    const {pressOrgCountForDev} = this.state;
    console.log(
      'render my organization---------',
      currentUserInfo,
      companyInfo,
    );

    const numberOfStaffsLimit = getIn(companyInfo, ['plan', 'numberOf'], null),
      staffs = Array.isArray(getIn(companyInfo, ['staffs'], []))
        ? getIn(companyInfo, ['staffs'], [])
        : [],
      currentStaffsCount = staffs.length;

    let adminInfo: any = {},
      myInfo: any = {};
    if (companyInfo && currentUserInfo && Array.isArray(companyInfo.staffs)) {
      companyInfo.staffs.forEach((item: any) => {
        if (item.user && item.user._id && item.user._id === companyInfo.owner) {
          adminInfo = item;
        }
        if (
          item.user &&
          item.user._id &&
          item.user._id === currentUserInfo._id
        ) {
          myInfo = item;
        }
      });
    }

    const adminNameText = adminInfo.staffName
      ? adminInfo.staffName
      : adminInfo.user && adminInfo.user.nickName
      ? adminInfo.user.nickName
      : 'undefined';

    const renderTop = () => {
      return (
        <View style={styles.topWrapper}>
          <View style={styles.topContainer}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: deviceWidth,
                alignItems: 'center',
              }}>
              <View style={{flexDirection: 'row'}}>
                {companyInfo && companyInfo.logo ? (
                  <Image
                    style={styles.Avatar}
                    source={{
                      uri: companyInfo.logo,
                    }}
                  />
                ) : (
                  <Image style={styles.Avatar} source={Icon.companyImageIcon} />
                )}
                <TouchableWithoutFeedback
                  onPress={() => {
                    if (!releaseMode && pressOrgCountForDev < 10) {
                      this.handleOnPressCompany();
                    }
                  }}>
                  <View style={styles.userInfo}>
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={styles.usernameStyle}>
                      {companyInfo && companyInfo.name ? companyInfo.name : ''}
                    </Text>
                    <Text style={styles.infoTextStyle}>
                      {'Administrator: ' + adminNameText}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
              <TouchableOpacity
                style={{
                  width: 62,
                  paddingRight: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  this.props.navigation.navigate('QRCode', {
                    type: 'Organization',
                  });
                }}>
                <Image style={styles.QRStyle} source={Icon.QRCodeIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    };

    const renderController = () => {
      return companyInfo ? (
        <View style={styles.controllerWrapper}>
          {currentUserInfo && currentUserInfo._id === companyInfo.owner && (
            <TouchableOpacity
              onPress={() => {
                if (currentStaffsCount <= numberOfStaffsLimit) {
                  navigation.navigate('InviteOrganization', {
                    companyPkey: companyInfo.Pkey,
                  });
                } else {
                  Modal.alert(
                    'Respond to company failed !',
                    'The number of staff exceeds the limit',
                    [
                      {
                        text: 'OK',
                        onPress: () => {},
                      },
                    ],
                  );
                }
              }}
              style={styles.itemStyle}>
              <View
                style={{
                  ...styles.itemTextWrapper,
                  borderBottomColor: '#F2F2F2',
                  borderTopColor: '#F2F2F2',
                  borderBottomWidth: 1,
                  borderTopWidth: 1,
                }}>
                <Text style={styles.itemText}>Add members to the team</Text>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('OrganizationStructure');
            }}
            style={styles.itemStyle}>
            <View style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>Organizational structure</Text>
              <Image
                style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                source={Icon.EnterIcon}
              />
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View />
      );
    };

    const renderInformation = () => {
      return (
        <View style={styles.informationWrapper}>
          <View
            style={{
              backgroundColor: '#FFF',
            }}>
            <View
              style={{
                height: 40,
                justifyContent: 'center',
                marginLeft: 14,
                borderBottomColor: '#D9D9D9',
                borderBottomWidth: 1,
              }}>
              <Text style={{fontSize: 16, color: '#757575'}}>
                My Information
              </Text>
            </View>
          </View>
          <View style={styles.itemStyle}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('NameChange', {
                  myInfo: myInfo,
                });
              }}
              style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>Name</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  numberOfLines={1}
                  style={{...styles.itemText, maxWidth: deviceWidth - 100}}>
                  {myInfo.staffName}
                </Text>
                <Image
                  style={{
                    ...styles.enterStyle,
                    tintColor: '#B3B3B3',
                    marginLeft: 10,
                  }}
                  source={Icon.EnterIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.itemStyle}>
            <View
              style={{
                ...styles.itemTextWrapper,
                borderBottomColor: '#F2F2F2',
                borderTopColor: '#F2F2F2',
                borderBottomWidth: 1,
                borderTopWidth: 1,
              }}>
              <Text style={styles.itemText}>Email</Text>
              <Text style={styles.itemText}>{currentUserInfo.email}</Text>
            </View>
          </View>
          <View style={styles.itemStyle}>
            <View
              style={{
                ...styles.itemTextWrapper,
                borderBottomColor: '#F2F2F2',
                borderBottomWidth: 1,
              }}>
              <Text style={{...styles.itemText, width: 115}}>Department</Text>
              <Text style={{...styles.itemText, flex: 1, textAlign: 'right'}}>
                {getIn(myInfo, ['department', 'name'], '') || 'undefined'}
              </Text>
            </View>
          </View>
          <View style={styles.itemStyle}>
            <View style={styles.itemTextWrapper}>
              <Text style={{...styles.itemText, width: 115}}>Address</Text>
              <View style={{flex: 1}}>
                <Text
                  style={{
                    ...styles.itemText,
                    flex: 1,
                    textAlign: 'right',
                  }}>
                  {getIn(companyInfo, ['address'], '')}
                </Text>
                <Text
                  style={{
                    ...styles.itemText,
                    flex: 1,
                    textAlign: 'right',
                  }}>
                  {getIn(companyInfo, ['fullAddress'], '')}
                </Text>
              </View>
            </View>
          </View>
          {!releaseMode && pressOrgCountForDev >= 8 ? (
            <TouchableOpacity
              onPress={this.handleQuitCompany}
              style={{marginTop: 7}}>
              <View
                style={{
                  height: 52,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FFFFFF',
                }}>
                <Text style={{fontSize: 16, color: '#1E9DFC'}}>Quit Team</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    };

    return (
      <View style={styles.normal}>
        <TitleBarNew title={'My Organization'} navigation={navigation} />
        {renderTop()}
        <ScrollView>
          {renderController()}
          {renderInformation()}
        </ScrollView>
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
    // backgroundColor: "#F38900",
    borderRadius: 26.5,
    marginLeft: 17,
  },
  userInfo: {
    height: 53,
    marginLeft: 14,
  },
  usernameStyle: {
    fontFamily: Page.font_family,
    maxWidth: 0.6 * deviceWidth,
    fontSize: 20,
    color: '#FFFFFF',
  },
  infoTextStyle: {
    fontFamily: Page.font_family,
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 5,
  },
  enterStyle: {
    position: 'relative',
    width: 7,
    height: 12,
    marginRight: 4,
  },
  controllerWrapper: {
    marginTop: 8,
    backgroundColor: '#fff',
  },
  informationWrapper: {
    marginTop: 8,
  },
  itemStyle: {
    flexDirection: 'row',
    width: '100%',
    minHeight: 52,
    alignItems: 'center',
    backgroundColor: '#fff',
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
    minHeight: 52,
    flex: 1,
    flexDirection: 'row',
    marginLeft: 14,
    paddingRight: 14,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#2E2E2E',
  },
  QRStyle: {
    width: 25,
    height: 25,
    tintColor: '#FFFFFF',
  },
});
const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo || {},
    companyInfo: state.company.companyInfo,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    fetchCompanyInfo: (
      authToken: string,
      companyPkey: string,
      callback?: Function,
    ) => {
      dispatch(fetchCompanyInfo(authToken, companyPkey, callback));
    },
    quitCompany: (authToken: string, callback?: Function) => {
      dispatch(quitCompany(authToken, callback));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Organization);
