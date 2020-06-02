import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, StyleSheet, Text, Image} from 'react-native';
import {TitleBarNew} from '../../../common/components';
import {deviceWidth} from '../../../common/utils';
import QRCode from 'react-native-qrcode-svg';
import {FONT_FAMILY} from '../../../common/styles';

interface State {}
interface Props {
  navigation: any;
  companyInfo: any;
  currentUserInfo: any;
}
const Page = {
  font_family: FONT_FAMILY,
};

const headerImageIcon = require('../../images/Me/Portrait.png');
const companyImageIcon = require('../../images/Me/Portrait_company.png');
export class QRCodeScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const {navigation, companyInfo, currentUserInfo} = this.props;
    return (
      <View style={styles.normal}>
        <TitleBarNew
          title={
            navigation.getParam('type') === 'Organization'
              ? 'Organization'
              : 'My QR code'
          }
          navigation={navigation}
        />
        <View style={styles.codeWrapper}>
          <View style={styles.topContainer}>
            <Image
              style={styles.Avatar}
              source={
                navigation.getParam('type') === 'Organization'
                  ? companyInfo.logo
                    ? {uri: companyInfo.logo}
                    : companyImageIcon
                  : currentUserInfo.userPic
                  ? {uri: currentUserInfo.userPic}
                  : headerImageIcon
              }
            />
            <View style={styles.userInfo}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.usernameStyle}>
                {navigation.getParam('type') === 'Organization'
                  ? companyInfo.name
                  : currentUserInfo.nickName}
              </Text>
              <Text style={styles.infoTextStyle} numberOfLines={2}>
                {navigation.getParam('type') === 'Organization'
                  ? companyInfo.address
                  : currentUserInfo.companyName
                  ? currentUserInfo.companyName
                  : ''}
              </Text>
            </View>
          </View>
          <View style={styles.QRCodeStyle}>
            <QRCode
              size={220}
              logo={
                navigation.getParam('type') === 'Organization'
                  ? companyInfo.logo
                    ? {uri: companyInfo.logo}
                    : companyImageIcon
                  : currentUserInfo.userPic
                  ? {uri: currentUserInfo.userPic}
                  : headerImageIcon
              }
              value={
                navigation.getParam('type') === 'Organization'
                  ? JSON.stringify({
                      type: 'organization',
                      Pkey: companyInfo._id,
                    })
                  : JSON.stringify({
                      type: 'person',
                      email: currentUserInfo.email,
                      pKey: currentUserInfo._id,
                    })
              }
              color="#1EABFC"
              logoSize={40}
            />
          </View>
          <Text style={styles.remarkText}>
            {navigation.getParam('type') === 'Organization'
              ? 'Scan the QR code above to join the company'
              : 'Scan the QR code above and add me as a friend'}
          </Text>
        </View>
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
  codeWrapper: {
    width: deviceWidth - 32,
    height: 400,
    marginTop: 50,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    alignItems: 'center',
  },
  topContainer: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 22,
  },
  Avatar: {
    width: 54,
    height: 54,
    // backgroundColor: "#F38900",
    borderRadius: 27,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  userInfo: {
    width: deviceWidth - 145,
  },
  usernameStyle: {
    fontFamily: Page.font_family,
    marginTop: 5,
    fontSize: 18,
    lineHeight: 20,
    color: '#2E2E2E',
  },
  infoTextStyle: {
    fontSize: 12,
    marginTop: 5,
    color: '#2E2E2E',
  },
  QRCodeStyle: {
    width: 220,
    height: 220,
    marginTop: 28,
  },
  remarkText: {
    color: '#757575',
    fontSize: 14,
    marginTop: 20,
  },
});
const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo,
    companyInfo: state.company.companyInfo,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(QRCodeScreen);
