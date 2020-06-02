import React from "react";
import { Component } from "react";
import { connect } from "react-redux";
import { Modal } from "@ant-design/react-native";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated
} from "react-native";
import {
  deviceWidth, // 设备宽度
  searchType
} from "../../../common/utils";
import { DColors, DFontSize, FONT_FAMILY } from "../../../common/styles";
import { TitleBarNew } from "../../../common/components";
import {
  selectGroup,
  exitGroup,
  searchUserByEmail,
  deleteUser
} from "../../../store/actions";
const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor
};

interface State {}
interface Props {
  navigation: any;
  currentUserInfo: any;
  authToken: string;
  groupId: string;
  groupName: string;
  authPkey: string;
  groupCreatorPkey: string;
  groupList: Array<any>;
  groupUsers: Array<any>;
  selectGroup: (groupSelect: any) => void;
  exitGroup: (authToken: string, groupId: string, callback?: Function) => void;
  searchUserByEmail: (
    authToken: string,
    email: string,
    callback?: Function
  ) => void;
  deleteUser: (
    authToken: string,
    usersId: Array<string>,
    groupId: string,
    callback?: Function
  ) => void;
}

const Icon = {
  EnterIcon: require("../../images/Me/enterwhite.png"),
  AddIcon: require("../../images/Me/Group_add.png"),
  DeleteIcon: require("../../images/Me/Group_reduce.png"),
  DeleteRedIcon: require("../../images/Me/Delete_friend.png"),
  headerImageIcon: require("../../images/Me/Portrait.png")
};

export class EditGroupScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      fadeAnim: new Animated.Value(0)
    };
  }

  componentDidUpdate() {
    let { groupId, groupList } = this.props;
    this.props.selectGroup(groupList.filter(item => item._id === groupId)[0]);
  }

  handleSelectFriend = (data: any) => {
    // this.props.selectFriend(data);
    let { searchUserByEmail, currentUserInfo, navigation } = this.props;
    let { authToken } = currentUserInfo;
    searchUserByEmail(authToken, data.email, () => {
      navigation.navigate("FriendInfo", {
        type: searchType.FriendEmail
      });
    });
  };

  // 渲染群成员
  renderGroupMember = () => {
    const { navigation, groupUsers, authPkey } = this.props;
    return (
      <View style={styles.contentWrapper}>
        {groupUsers.map(item => (
          <View key={item._id} style={{ marginBottom: 17 }}>
            <TouchableOpacity onPress={() => this.handleSelectFriend(item)}>
              {item.userPic ? (
                <Image
                  style={styles.imageStyle}
                  source={{ uri: item.userPic }}
                />
              ) : (
                <Image
                  style={styles.imageStyle}
                  source={Icon.headerImageIcon}
                />
              )}
            </TouchableOpacity>

            <Text numberOfLines={1} style={styles.nameStyle}>
              {item.nickName}
            </Text>
          </View>
        ))}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("CreateGroup", {
              title: "Choose Friends",
              type: "addFriendsToGroup"
            })
          }
        >
          <Image
            style={{ ...styles.imageStyle, backgroundColor: "#FFFFFF" }}
            source={Icon.AddIcon}
          />
        </TouchableOpacity>
        {groupUsers[0]._id === authPkey ? (
          <TouchableOpacity
            onPress={() => {
              // Vibration.vibrate([0, 500], false);
              navigation.navigate("CreateGroup", {
                title: "Group Members",
                type: "deleteMemberFromGroup"
              });
            }}
          >
            <Image
              style={{ ...styles.imageStyle, backgroundColor: "#FFFFFF" }}
              source={Icon.DeleteIcon}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  // 退出群组
  handleExit = () => {
    const { authToken, groupId, navigation } = this.props;
    Modal.alert("Are you sure to exit the group?", "", [
      {
        text: "Cancel",
        onPress: () => {
          console.log("cancel");
        },
        style: "cancel"
      },
      {
        text: "Sure",
        onPress: () => {
          this.props.exitGroup(authToken, groupId, () => navigation.goBack());
        }
      }
    ]);
  };

  render() {
    const { navigation, groupName } = this.props;
    return (
      <View style={styles.normal}>
        <TitleBarNew title={"Group Edit"} navigation={navigation} />
        <TouchableOpacity
          onPress={() => navigation.navigate("GroupName")}
          style={{ marginTop: 8 }}
        >
          <View style={styles.itemStyle}>
            <View style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>Group name</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.itemTextTwo}
                >
                  {groupName}
                </Text>
                <Image
                  style={{ ...styles.enterStyle, tintColor: "#B3B3B3" }}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {this.renderGroupMember()}
        <TouchableOpacity onPress={this.handleExit} style={{ marginTop: 8 }}>
          <View style={styles.buttonStyle}>
            <Text style={styles.buttonText}>Exit Groups</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: "#F2F2F2"
  },
  itemStyle: {
    flexDirection: "row",
    width: "100%",
    height: 52,
    alignItems: "center",
    backgroundColor: "#FFFFFF"
  },
  itemTextWrapper: {
    height: 52,
    flex: 1,
    flexDirection: "row",
    marginLeft: 14,
    alignItems: "center",
    justifyContent: "space-between"
  },
  itemText: {
    fontSize: 16,
    color: "#2E2E2E"
  },
  itemTextTwo: {
    maxWidth: 0.5 * deviceWidth,
    marginRight: 16,
    fontSize: 16,
    color: "#757575"
  },
  enterStyle: {
    position: "relative",
    width: 7,
    height: 12,
    marginRight: 17
  },
  contentWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#FFFFFF",
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 8,
    paddingBottom: 17,
    marginTop: 8
  },
  imageStyle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDEEF5",
    marginLeft: 9,
    marginRight: 9
  },
  nameStyle: {
    fontFamily: Page.font_family,
    color: "#2E2E2E",
    fontSize: 12,
    width: 48,
    marginLeft: 9,
    marginRight: 9,
    textAlign: "center",
    textAlignVertical: "center"
  },
  buttonStyle: {
    width: deviceWidth,
    height: 52,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: "#ED2F31"
  }
});
const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
    authPkey: state.loginInfo.currentUserInfo._id,
    groupCreatorPkey: state.group.groupSelect.owner,
    groupId: state.group.groupSelect._id,
    groupUsers: state.group.groupSelect.members,
    groupName: state.group.groupSelect.name,
    groupList: state.group.groupList
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    selectGroup: (groupSelect: any) => dispatch(selectGroup(groupSelect)),
    exitGroup: (authToken: string, groupId: string, callback?: Function) =>
      dispatch(exitGroup(authToken, groupId, callback)),
    deleteUser: (
      authToken: string,
      usersId: Array<string>,
      groupId: string,
      callback?: Function
    ) => dispatch(deleteUser(authToken, usersId, groupId, callback)),
    searchUserByEmail: (
      authToken: string,
      email: string,
      callback?: Function
    ) => {
      dispatch(searchUserByEmail(authToken, email, callback));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditGroupScreen);
