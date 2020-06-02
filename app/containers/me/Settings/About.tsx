import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
  NativeModules
} from "react-native";
import { PlatFormAndroid } from "../../../env";
import { TitleBarNew, NewVersionModal } from "../../../common/components";
import {
  deviceWidth,
  requestApiV2,
  API_v2,
  checkNewVersion
} from "../../../common/utils";
import { FONT_FAMILY } from "../../../common/styles";
import { Modal, Toast, Portal } from "@ant-design/react-native";

var iOSToolModule = NativeModules.ToolModule;

interface State {
  versionName: string;
  versionCode: number;
  updateModalVisible: boolean;
  newVersion: any;
}
interface Props {
  navigation: any;
  authToken: string;
  screenProps: any;
}
const Icon = {
  EnterIcon: require("../../images/Me/enterwhite.png")
};
const logoImag = require("../../images/Me/about.png");

class About extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      versionName: "",
      versionCode: 0,
      updateModalVisible: false,
      newVersion: {}
    };
  }

  componentWillMount() {
    this.getVerSion();
  }

  // 获取版本号
  getVerSion = () => {
    if (Platform.OS === PlatFormAndroid) {
      const { initialProperties } = this.props.screenProps;
      const { versionName, versionCode } = initialProperties;
      this.setState({
        versionName,
        versionCode
      });
    } else {
      iOSToolModule.getAppVersion(
        (error: any, versionName: string, versionCode: any) => {
          // console.log("getAppVersion---", error, versionName, versionCode);
          if (error) {
            console.log(error);
          } else {
            this.setState({
              versionName,
              versionCode
            });
          }
        }
      );
    }
  };

  handleCheckNewVersion = () => {
    const { versionName, versionCode } = this.state;
    const toastKey = Toast.loading("Loading...", 0);
    checkNewVersion(versionName, versionCode, true)
      .then((res: any) => {
        Portal.remove(toastKey);
        if (res.result === "Success") {
          if (res.data) {
            if (res.data.versionName && res.data.versionCode > versionCode) {
              this.setState({
                newVersion: res.data,
                updateModalVisible: true
              });
            }
          } else {
            Toast.info("It is the latest version");
          }
        }
      })
      .catch(error => {
        Portal.remove(toastKey);
      });
  };

  // 关闭操作弹窗
  closeControllerModal = () => {
    this.setState({
      updateModalVisible: false
    });
  };

  render() {
    const { navigation } = this.props;
    const {
      versionName,
      versionCode,
      updateModalVisible,
      newVersion
    } = this.state;
    // console.log("render about", this.props, this.state);

    return (
      <View style={styles.normal}>
        <TitleBarNew title={"About Data2Go"} navigation={navigation} />
        <Image source={logoImag} style={styles.logoStyle} />
        <Text style={styles.titleStyle}>Data2Go</Text>
        <Text style={styles.remarkStyle}>{"v" + versionName}</Text>
        <TouchableOpacity
          onPress={this.handleCheckNewVersion}
          style={{ marginTop: 27 }}
        >
          <View style={styles.checkWrapper}>
            <Text style={styles.textStyle}>Check new version</Text>
            <Image
              style={{ ...styles.enterStyle, tintColor: "#B3B3B3" }}
              source={Icon.EnterIcon}
            />
          </View>
        </TouchableOpacity>
        <NewVersionModal
          visible={updateModalVisible}
          newVersion={newVersion}
          handleCloseModal={this.closeControllerModal}
        ></NewVersionModal>
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
  logoStyle: {
    width: 80,
    height: 80,
    marginTop: 33
  },
  titleStyle: {
    color: "#2E2E2E",
    fontSize: 20,
    marginTop: 23
  },
  remarkStyle: {
    color: "#757575",
    fontSize: 16
    // marginTop: 23
  },
  checkWrapper: {
    flexDirection: "row",
    width: deviceWidth,
    height: 52,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingLeft: 17,
    paddingRight: 17
  },
  enterStyle: {
    width: 7,
    height: 12
  },
  textStyle: {
    fontSize: 16,
    color: "#2E2E2E"
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
)(About);
