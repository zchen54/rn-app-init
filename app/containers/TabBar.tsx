import React, { Component } from "react";
import {
  Image,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform
} from "react-native";
import { connect } from "react-redux";
import { Modal } from "@ant-design/react-native";
import { AddScreen } from "./add/AddScreen";
import { deviceWidth } from "../common/utils/screenUtils";
import { DColors } from "../common/styles";

interface State {
  addControllerVisible: boolean;
}
interface Props {
  navigation: any;
  newMessageCount: number;
  jumpTo: any;
  activeTintColor: any;
  inactiveTintColor: any;
  renderIcon: any;
  getLabelText: any;
}

export class TabBar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      addControllerVisible: false
    };
  }

  // 打开操作弹窗
  openControllerModal = () => {
    this.setState({
      addControllerVisible: true
    });
  };

  // 关闭操作弹窗
  closeControllerModal = () => {
    this.setState({
      addControllerVisible: false
    });
  };

  renderItem = (route: any, index: any) => {
    const {
      navigation,
      jumpTo,
      activeTintColor,
      inactiveTintColor,
      newMessageCount
    } = this.props;

    const focused = index === navigation.state.index;
    const color = focused ? activeTintColor : inactiveTintColor;
    const TabScene = {
      focused,
      route,
      color
    };

    if (index === 2) {
      // Work
      return (
        <TouchableOpacity
          key={route.key}
          activeOpacity={0.9}
          onPress={this.openControllerModal}
        >
          <View style={styles.tabItem}>
            {this.props.renderIcon(TabScene)}
            <Text style={{ color, fontSize: 10, marginTop: 20 }}>
              {this.props.getLabelText(TabScene)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    } else if (index === 4) {
      // Me
      return (
        <TouchableOpacity
          key={route.key}
          activeOpacity={0.9}
          onPress={() => jumpTo(route.key)}
        >
          <View style={styles.tabItem}>
            {newMessageCount > 0 ? (
              <View style={styles.messageCountView}>
                <Text style={styles.messageCount}>{newMessageCount}</Text>
              </View>
            ) : null}
            {this.props.renderIcon(TabScene)}
            <Text style={{ color, fontSize: 10 }}>
              {this.props.getLabelText(TabScene)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          key={route.key}
          activeOpacity={0.9}
          onPress={() => jumpTo(route.key)}
        >
          <View style={styles.tabItem}>
            {this.props.renderIcon(TabScene)}
            <Text style={{ color, fontSize: 10 }}>
              {this.props.getLabelText(TabScene)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  render() {
    const {
      navigation: {
        state: { routes }
      }
    } = this.props;
    const { navigation } = this.props;
    return (
      <View style={styles.tab}>
        {routes.map(this.renderItem)}
        <Modal
          popup
          visible={this.state.addControllerVisible}
          animationType="slide-up"
          style={styles.modalWrap}
          maskClosable={true}
          onClose={this.closeControllerModal}
        >
          <AddScreen
            navigation={navigation}
            onClose={this.closeControllerModal}
          />
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopColor: "rgba(0,0,0,0.3)",
    // borderTopWidth: 0.5,
    paddingBottom: 0
  },
  tabLine: {
    height: 0.5,
    backgroundColor: "rgba(100,100,100,0.3)"
  },
  tabItem: {
    height: 49,
    width: deviceWidth / 5,
    // borderColor: "rgba(0,0,0,0.3)",
    // borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  modalWrap: {},
  messageCountView: {
    position: "absolute",
    width: 18,
    height: 18,
    top: 2,
    right: 6,
    borderRadius: 9,
    backgroundColor: DColors.auxiliaryRed,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  messageCount: {
    color: "#fff",
    fontSize: 12
  }
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
    newMessageCount: state.message.newMessageCount
  };
};

export default connect(mapStateToProps)(TabBar);
