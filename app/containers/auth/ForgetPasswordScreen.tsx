"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from "react-native";
import {
  setSize,
  setSizeWithPx,
  regTools,
  getLoginHistory,
  deviceWidth
} from "../../common/utils";
import { regTypeConstants, toastTips } from "../../common/constants";
import { DColors, DFontSize, FONT_FAMILY } from "../../common/styles";
import { getVCode, resetPassword } from "../../store/actions";
import { Toast } from "@ant-design/react-native";
import { TitleBarNew } from "../../common/components";
const Page = {
  font_family: FONT_FAMILY,
  titleColor: DColors.title,
  mainColor: DColors.mainColor
};

const Icon = {
  EyeVisible: require("../images/Index-Login/eyes.png"),
  EyeUnvisible: require("../images/Index-Login/close_eyes.png"),
  Email: require("../images/Index-Login/email.png"),
  Code: require("../images/Index-Login/code.png"),
  Password: require("../images/Index-Login/password.png")
};

interface State {
  Email: string;
  Code: string;
  Password: string;
  EyeVisible: boolean;
  seconds: number;
  sendCodeStatus: boolean;
}
interface Props {
  navigation: any;
  getVCode: (email: string, codeType: number, callback?: Function) => void;
  resetPassword: (
    email: string,
    vcode: string,
    password: string,
    callback?: Function
  ) => void;
}

class ForgetPasswordScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      Email: "",
      Code: "",
      Password: "",
      EyeVisible: false,
      seconds: 60,
      sendCodeStatus: true
    };
  }

  componentWillMount() {}

  componentWillReceiveProps(nextProps: Props) {}

  componentDidMount() {
    let email = "";
    getLoginHistory()
      .then(res => {
        if (res) {
          this.setState({ Email: res[0].email });
        }
      })
      .catch(e => {
        console.log(e);
      });
  }

  handleEmail = (text: string) => {
    this.setState({
      Email: text
    });
  };

  handleCode = (text: string) => {
    this.setState({
      Code: text
    });
  };

  handlePassword = (text: string) => {
    this.setState({
      Password: text
    });
  };

  changePasswordType = () => {
    let { EyeVisible } = this.state;
    this.setState({
      EyeVisible: !EyeVisible
    });
  };

  handleGetVCode = () => {
    // todo
    const { Email } = this.state;
    if (Email === "") {
      Toast.fail("Email" + " is required", 2, undefined, false);
      return;
    }
    if (!regTools(Email, regTypeConstants.EMAIL)) {
      Toast.fail(toastTips.MailError, 2, undefined, false);
      return;
    }
    this.props.getVCode(Email, 1, () => {
      this.sendCodeCB();
    });
  };

  sendCodeCB = () => {
    let siv = setInterval(() => {
      this.setState(
        {
          sendCodeStatus: false,
          seconds: this.state.seconds - 1
        },
        () => {
          if (this.state.seconds == 0) {
            clearInterval(siv);
            this.setState({
              sendCodeStatus: true,
              seconds: 60
            });
          }
        }
      );
    }, 1000);
  };

  handleConfirm = () => {
    const { Email, Code, Password } = this.state;
    if (Email === "") {
      Toast.fail("Email" + " is required", 2, undefined, false);
      return;
    }
    if (!regTools(Email, regTypeConstants.EMAIL)) {
      Toast.fail(toastTips.MailError, 2, undefined, false);
      return;
    }
    if (Code === "") {
      Toast.fail("Code" + " is required", 2, undefined, false);
      return;
    }
    if (Password === "") {
      Toast.fail("Password" + " is required", 2, undefined, false);
      return;
    }
    if (Password.indexOf(" ") > -1) {
      Toast.fail("Passwords cannot contain spaces", 2, undefined, false);
      return;
    }
    if (Password.length < 6 || Password.length > 18) {
      Toast.fail(toastTips.FailedPassword, 2, undefined, false);
      return;
    }
    this.props.resetPassword(Email, Code, Password, () => {
      console.log("Login again after reset password");
      this.props.navigation.navigate("Login", { email: Email });
    });
  };

  render() {
    const {
      Email,
      Code,
      Password,
      EyeVisible,
      seconds,
      sendCodeStatus
    } = this.state;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <View style={styles.container}>
            <TitleBarNew
              title={"Forget password"}
              navigation={this.props.navigation}
            />
            <View style={styles.inputWrapper}>
              <View style={styles.itemRow}>
                <View style={styles.imageWrapper}>
                  <Image style={styles.userImageStyle} source={Icon.Email} />
                </View>
                <TextInput
                  value={Email}
                  style={styles.inputStyle}
                  placeholder="Email"
                  onChangeText={this.handleEmail}
                />
              </View>
              <View style={styles.line} />
              <View style={styles.itemRow}>
                <View style={styles.imageWrapper}>
                  <Image style={styles.codeImageStyle} source={Icon.Code} />
                </View>
                <TextInput
                  value={Code}
                  style={styles.inputStyle}
                  placeholder="Verification Code"
                  onChangeText={this.handleCode}
                />
                {sendCodeStatus ? (
                  <TouchableOpacity onPress={this.handleGetVCode}>
                    <Text style={styles.getCodeStyle}>Get Code</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.getCodeStyle}>{seconds + "s"}</Text>
                )}
              </View>
              <View style={styles.line} />
              <View style={styles.itemRow}>
                <View style={styles.imageWrapper}>
                  <Image
                    style={styles.passwordImageStyle}
                    source={Icon.Password}
                  />
                </View>
                <TextInput
                  value={Password}
                  style={styles.inputStyle}
                  placeholder="Password"
                  textContentType={"password"}
                  secureTextEntry={!EyeVisible}
                  onChangeText={this.handlePassword}
                />
                <TouchableOpacity
                  onPress={this.changePasswordType}
                  style={styles.eyeWrapper}
                >
                  <Image
                    source={EyeVisible ? Icon.EyeVisible : Icon.EyeUnvisible}
                    style={styles.eyeStyle}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={this.handleConfirm}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#f2f2f2",
    alignItems: "center"
  },
  inputWrapper: {
    width: deviceWidth - 66,
    height: 140,
    marginTop: 47,
    backgroundColor: "#ffffff",
    paddingLeft: 17,
    paddingRight: 17
  },
  itemRow: {
    flexDirection: "row",
    flex: 1,
    height: 46,
    alignItems: "center"
  },
  line: {
    width: "100%",
    height: 1,
    backgroundColor: "#CBCBCB"
  },
  imageWrapper: {
    width: 27,
    height: 20,
    borderRightColor: "#CDCDCD",
    borderRightWidth: 1,
    justifyContent: "center"
  },
  userImageStyle: {
    width: 15,
    height: 16
  },
  codeImageStyle: {
    width: 14,
    height: 14
  },
  passwordImageStyle: {
    width: 13,
    height: 15
  },
  inputStyle: {
    padding: 0,
    flex: 1,
    marginLeft: 10,
    fontSize: 16
  },
  getCodeStyle: {
    fontSize: 16,
    color: Page.mainColor,
    marginLeft: 2,
    marginRight: 3
  },
  eyeWrapper: {
    width: 20,
    height: "100%",
    marginLeft: 2,
    marginRight: 0,
    justifyContent: "center"
  },
  eyeStyle: {
    width: 16,
    height: 12
  },
  confirmButton: {
    width: deviceWidth - 66,
    height: 40,
    marginTop: 78,
    borderRadius: 20,
    backgroundColor: Page.mainColor,
    alignItems: "center",
    justifyContent: "center"
  },
  confirmText: {
    fontSize: 18,
    color: "#FFFFFF"
  }
});

const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    resetPassword: (
      email: string,
      vcode: string,
      password: string,
      callback?: Function
    ) => {
      dispatch(resetPassword(email, vcode, password, callback));
    },
    getVCode: (email: string, codeType: number, callback?: Function) => {
      dispatch(getVCode(email, codeType, callback));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ForgetPasswordScreen);
