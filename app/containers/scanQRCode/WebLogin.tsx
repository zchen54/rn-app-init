import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from "react-native";
import { TitleBarNew } from "../../common/components";
import {
  deviceWidth,
  deviceHeight,
  httpRequest,
  API_v2,
} from "../../common/utils";
import { FONT_FAMILY, DColors } from "../../common/styles";
import { Toast, Modal, Portal } from "@ant-design/react-native";
// import Reactotron from "reactotron-react-native";

interface State {}
interface Props {
  navigation: any;
  currentUserInfo: any;
}
const Page = {
  font_family: FONT_FAMILY,
};

const Icon = {
  computer: require("../images/Index-Login/computer.png"),
};

export class WebLogin extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    const data = this.props.navigation.getParam("data");
    // Reactotron.log("scan data", data);
  }

  handleCancel = () => {
    this.props.navigation.navigate("Me");
  };

  handleLoginWeb = () => {
    const { authToken } = this.props.currentUserInfo;
    const scanData = this.props.navigation.getParam("data");
    const toastKey = Toast.loading("Submitting...", 0);
    httpRequest(
      API_v2.loginWeb.method,
      API_v2.loginWeb.url + "?" + scanData,
      null,
      authToken
    )
      .then(res => {
        Portal.remove(toastKey);
        if (res.result === "Success") {
          this.props.navigation.navigate("Me");
        } else if (res.error) {
          Modal.alert("Login failed !", res.error, [
            { text: "OK", onPress: () => {} },
          ]);
        }
      })
      .catch(error => {
        Portal.remove(toastKey);
        console.error(error);
      });
  };

  render() {
    StatusBar.setBarStyle("dark-content", true);
    return (
      <View style={styles.normal}>
        <View>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={this.handleCancel}
          >
            <Text style={styles.commonText}>Close</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            marginTop: 60,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image style={{ width: 146, height: 120 }} source={Icon.computer} />
        </View>
        <View
          style={{
            marginTop: 22,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={styles.commonText}>Computer Confirm Login</Text>
        </View>
        <View
          style={{
            marginTop: 200,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={styles.LoginButton}
            onPress={this.handleLoginWeb}
          >
            <Text style={styles.confirmText}>Login</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            marginTop: 30,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={this.handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  preview: {
    width: deviceWidth,
    height: deviceHeight,
  },
  normal: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  goBackButton: {
    marginTop: 50,
    marginHorizontal: 17,
    width: 50,
    height: 40,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  commonText: {
    fontSize: 16,
    color: DColors.title,
  },
  LoginButton: {
    width: 212,
    height: 44,
    borderRadius: 5,
    backgroundColor: "#BCE1FC",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: 18,
    color: DColors.mainColor,
  },
  cancelText: {
    fontSize: 18,
    color: "#ccc",
  },
});

const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo,
  };
};

export default connect(mapStateToProps)(WebLogin);
