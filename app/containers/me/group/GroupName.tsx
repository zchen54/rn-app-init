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
import { deviceWidth, deviceHeight } from "../../../common/utils";
import {
  updateGroup,
  getGroupMembers,
  selectGroup
} from "../../../store/actions";
import { FONT_FAMILY } from "../../../common/styles";

interface State {
  groupName: string;
}
interface Props {
  navigation: any;
  currentUserInfo: any;
  groupName: string;
  updateGroup: (
    authToken: string,
    groupId: string,
    name: string,
    remark: string,
    callback?: Function
  ) => void;
  getGroupMembers: (
    authToken: string,
    groupId: string,
    callback?: Function
  ) => void;
  selectGroup: (groupSelect: any) => void;
  groupId: string;
  groupList: Array<any>;
}
const Page = {
  font_family: FONT_FAMILY
};
const clearIcon = require("../../images/Me/close.png");
export class GroupName extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      groupName: ""
    };
  }

  componentWillMount() {
    const { groupName } = this.props;
    this.setState({
      groupName
    });
  }

  handleNickNameChange = (text: string) => {
    this.setState({
      groupName: text
    });
  };

  handleConfirm = () => {
    // todo
    const {
      currentUserInfo,
      navigation,
      updateGroup,
      groupId,
      groupList
    } = this.props;
    let { groupName } = this.state;
    let { authToken } = currentUserInfo;
    updateGroup(authToken, groupId, groupName, "");
    // this.props.selectGroup(groupList.filter(item => item._id === groupId)[0]);
    this.props.getGroupMembers(authToken, groupId, () => navigation.goBack());
  };

  render() {
    let { navigation } = this.props;
    let { groupName } = this.state;
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={styles.normal}>
          <View>
            <TitleBarNew
              title={"Group Name"}
              navigation={navigation}
              right={<Icon name="check" color="#fff"></Icon>}
              pressRight={this.handleConfirm}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputStyle}
                value={groupName}
                onChangeText={this.handleNickNameChange}
              />
              <TouchableOpacity
                onPress={() => this.setState({ groupName: "" })}
              >
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
  preview: {
    width: deviceWidth,
    height: deviceHeight
  },
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
    currentUserInfo: state.loginInfo.currentUserInfo,
    groupName: state.group.groupSelect.name,
    groupId: state.group.groupSelect._id,
    groupList: state.group.groupList
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateGroup: (
      authToken: string,
      groupId: string,
      name: string,
      remark: string,
      callback?: Function
    ) => dispatch(updateGroup(authToken, groupId, name, remark, callback)),
    getGroupMembers: (
      authToken: string,
      groupId: string,
      callback?: Function
    ) => dispatch(getGroupMembers(authToken, groupId, callback)),
    selectGroup: (groupSelect: any) => dispatch(selectGroup(groupSelect))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupName);
