import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { Icon } from "@ant-design/react-native";
import { TitleBarNew } from "../../../common/components";
import { deviceWidth } from "../../../common/utils";
import { FONT_FAMILY } from "../../../common/styles";
import { updateStaffInfo } from "../../../store/actions";
import { Toast } from "@ant-design/react-native";

interface State {
  realName: string;
}
interface Props {
  authToken: string;
  navigation: any;
  currentUserInfo: any;
  updateStaffInfo: (
    authToken: string,
    options: {
      userPkey: string;
      departmentPkey: string;
      staffName: string;
    },
    callback?: Function
  ) => void;
}
const Page = {
  font_family: FONT_FAMILY
};
const clearIcon = require("../../images/Me/close.png");
export class NameChange extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      realName: ""
    };
  }

  componentWillMount() {
    const { navigation } = this.props;
    let myInfo = navigation.getParam("myInfo");
    if (myInfo && myInfo.staffName) {
      this.setState({
        realName: myInfo.staffName
      });
    }
  }

  handleNickNameChange = (text: string) => {
    this.setState({
      realName: text
    });
  };

  handleConfirm = () => {
    Keyboard.dismiss();
    const { navigation, authToken, currentUserInfo } = this.props;
    let { realName } = this.state;
    let myInfo = navigation.getParam("myInfo");
    if (realName === "") {
      Toast.fail("Name" + " is required", 2, undefined, false);
      return;
    }
    this.props.updateStaffInfo(
      authToken,
      {
        userPkey: myInfo.user ? myInfo.user._id : currentUserInfo._id,
        departmentPkey: myInfo.departmentId,
        staffName: realName
      },
      () => {
        navigation.navigate("Organization");
      }
    );
  };

  render() {
    let { navigation } = this.props;
    let { realName } = this.state;
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={styles.normal}>
          <View>
            <TitleBarNew
              title={"Name"}
              navigation={navigation}
              right={<Icon name="check" color="#fff"></Icon>}
              pressRight={this.handleConfirm}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputStyle}
                value={realName}
                // autoFocus={true}
                onChangeText={this.handleNickNameChange}
              />
              <TouchableOpacity onPress={() => this.setState({ realName: "" })}>
                <Image style={styles.clearStyle} source={clearIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: "#F2F2F2"
  },
  inputContainer: {
    flexDirection: "row",
    height: 52,
    width: "100%",
    backgroundColor: "#ffffff",
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  inputStyle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: "#2E2E2E",
    padding: 0,
    width: deviceWidth - 34
  },
  clearStyle: {
    width: 16,
    height: 16
  }
});
const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateStaffInfo: (
      authToken: string,
      options: {
        userPkey: string;
        departmentPkey: string;
        staffName: string;
      },
      callback?: Function
    ) => {
      dispatch(updateStaffInfo(authToken, options, callback));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NameChange);
