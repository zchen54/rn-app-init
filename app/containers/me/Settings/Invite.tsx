import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { View, StyleSheet, Text, Platform } from "react-native";
import { PlatFormAndroid } from "../../../env";
import { TitleBarNew } from "../../../common/components";
import { FONT_FAMILY } from "../../../common/styles";
import {
  requestApiV2,
  API_v2,
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
  statusBarHeight,
  searchType,
  deviceHeight,
  isIphoneX,
  isIphoneXsMax,
  getIsFirstBubble,
  setIsFirstBubble
} from "../../../common/utils";
import QRCode from "react-native-qrcode-svg";
import { Modal } from "@ant-design/react-native";

interface State {
  androidDownloadURL: string;
  iOSDownloadURL: string;
}
interface Props {
  authToken: string;
  navigation: any;
}

const logoImag = require("../../images/Me/about.png");

export class SettingInvite extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      androidDownloadURL: "",
      iOSDownloadURL: ""
    };
  }

  componentWillMount() {
    const { authToken } = this.props;
    let data = {
      os: ""
    };
    if (Platform.OS === PlatFormAndroid) {
      data.os = "android";
    } else {
      data.os = "ios";
    }
    requestApiV2(API_v2.getSystemConfig, null, authToken)
      .then(res => {
        if (res.result === "Success") {
          this.setState({
            androidDownloadURL: res.data.androidLink,
            iOSDownloadURL: res.data.iosLink
          });
        } else if (res.error) {
          Modal.alert("Request error !", res.error, [
            { text: "OK", onPress: () => {} }
          ]);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  render() {
    const { navigation } = this.props;
    const { androidDownloadURL, iOSDownloadURL } = this.state;
    return (
      <View style={styles.normal}>
        <TitleBarNew title={"Invite Friends"} navigation={navigation} />
        <View style={styles.QRCodeStyle}>
          {iOSDownloadURL !== "" && (
            <QRCode
              size={180}
              value={iOSDownloadURL}
              logo={logoImag}
              logoSize={40}
            />
          )}
        </View>
        <Text style={styles.textStyle}>Scan code to download ios app</Text>
        <View style={styles.QRCodeStyle}>
          {androidDownloadURL !== "" && (
            <QRCode
              size={180}
              value={androidDownloadURL}
              logo={logoImag}
              logoSize={40}
            />
          )}
        </View>
        <Text style={styles.textStyle}>Scan code to download android app</Text>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    alignItems: "center"
  },
  QRCodeStyle: {
    width: 200,
    height: 200,
    marginTop: 52,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  textStyle: {
    color: "#757575",
    fontSize: 16,
    marginTop: 20
  }
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingInvite);
