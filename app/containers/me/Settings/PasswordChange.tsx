import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from "react-native";
import { TitleBarNew } from "../../../common/components";
import { deviceWidth, clearUserInfo } from "../../../common/utils";
import { changePassword } from "../../../store/actions/loginAction";
import { FONT_FAMILY } from "../../../common/styles";
import { Toast } from "@ant-design/react-native";
import { toastTips } from "../../../common/constants";
import NavigationService from "../../../common/utils/navigationService";

interface State {
  OldPassword: string;
  NewPassword: string;
  ConfirmPassword: string;
}
interface Props {
  navigation: any;
  currentUserInfo: any;
  changePassword: (
    authToken: string,
    oldPassword: string,
    password: string,
    callback?: Function
  ) => void;
}
const Page = {
  font_family: FONT_FAMILY
};
const clearIcon = require("../../images/Me/close.png");
export class NickName extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      OldPassword: "",
      NewPassword: "",
      ConfirmPassword: ""
    };
  }

  handleOldPassword = (text: string) => {
    this.setState({
      OldPassword: text
    });
  };

  handleNewPassword = (text: string) => {
    this.setState({
      NewPassword: text
    });
  };

  handleConfirmPassword = (text: string) => {
    this.setState({
      ConfirmPassword: text
    });
  };

  handleConfirm = () => {
    // todo;
    const { currentUserInfo, changePassword, navigation } = this.props;
    const { OldPassword, NewPassword, ConfirmPassword } = this.state;
    let { authToken } = currentUserInfo;
    if (OldPassword === "") {
      Toast.fail("Old password is required", 2, undefined, false);
      return;
    }
    if (NewPassword === "") {
      Toast.fail("New password is required", 2, undefined, false);
      return;
    }
    if (ConfirmPassword === "") {
      Toast.fail("Confirm password is required", 2, undefined, false);
      return;
    }
    if (NewPassword.indexOf(" ") > -1) {
      Toast.fail("Passwords cannot contain spaces", 2, undefined, false);
      return;
    }
    if (NewPassword.length < 6 || NewPassword.length > 18) {
      Toast.fail(toastTips.FailedPassword, 2, undefined, false);
      return;
    }
    if (NewPassword !== ConfirmPassword) {
      Toast.fail(
        "New password and Confirm password should be the same",
        2,
        undefined,
        false
      );
      return;
    }
    changePassword(authToken, OldPassword, NewPassword, () => {
      clearUserInfo();
      console.log("Login again after change password");
      NavigationService.navigate("Login", {
        action: "Authentication expired"
      });
    });
  };

  render() {
    let { navigation } = this.props;
    const { OldPassword, NewPassword, ConfirmPassword } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <TitleBarNew title={"Change the password"} navigation={navigation} />
        <ScrollView style={styles.normal}>
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <View style={styles.container}>
              <View style={styles.itemWrapper}>
                <Text style={styles.title}>Old password</Text>
                <TextInput
                  value={OldPassword}
                  style={styles.input}
                  placeholder="Please enter the old password"
                  onChangeText={this.handleOldPassword}
                />
                <Text style={styles.title}>New password</Text>
                <TextInput
                  value={NewPassword}
                  style={styles.input}
                  placeholder="Please enter the new password"
                  onChangeText={this.handleNewPassword}
                  textContentType={"password"}
                  secureTextEntry={true}
                />
                <Text style={styles.title}>Confirm password</Text>
                <TextInput
                  value={ConfirmPassword}
                  style={styles.input}
                  textContentType={"password"}
                  secureTextEntry={true}
                  placeholder="Please enter the new password again"
                  onChangeText={this.handleConfirmPassword}
                />
              </View>
              <TouchableOpacity
                style={{ marginTop: 65 }}
                onPress={this.handleConfirm}
              >
                <View style={styles.confirmStyle}>
                  <Text style={styles.confirmText}>Confirm</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: "#F2F2F2"
  },
  container: {
    flex: 1,
    alignItems: "center"
  },
  itemWrapper: {
    width: deviceWidth - 34
  },
  title: {
    fontSize: 16,
    color: "#2E2E2E",
    marginTop: 12
  },
  input: {
    width: "100%",
    height: 47,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    marginTop: 12,
    justifyContent: "center",
    paddingLeft: 18,
    paddingRight: 18
  },
  confirmStyle: {
    width: deviceWidth - 34,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E9DFC",
    alignItems: "center",
    justifyContent: "center"
  },
  confirmText: {
    fontSize: 16,
    color: "#FFFEFE"
  }
});
const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    changePassword: (
      authToken: string,
      oldPassword: string,
      password: string,
      callback?: Function
    ) => {
      dispatch(changePassword(authToken, oldPassword, password, callback));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NickName);
