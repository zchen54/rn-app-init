import React, { Component } from "react";
import { connect } from "react-redux";
import { Toast, Modal, Portal } from "@ant-design/react-native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image
} from "react-native";
import { TitleBarNew } from "../../../common/components";
import { FONT_FAMILY } from "../../../common/styles";
import { deviceWidth, requestApiV2, API_v2 } from "../../../common/utils";
interface State {
  resellerList: Array<any>;
}
interface Props {
  authToken: string;
  navigation: any;
}
const Page = {
  font_family: FONT_FAMILY
};

const Icon: any = {
  social: require("../../images/industry/Personnel.png"),
  EnterIcon: require("../../images/Me/enterwhite.png")
};

export class SelectReseller extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      resellerList: []
    };
  }

  componentWillMount() {
    const { authToken } = this.props;
    const toastKey = Toast.loading("Loading...", 0);
    requestApiV2(API_v2.getReseller, null, authToken)
      .then(res => {
        Portal.remove(toastKey);
        if (Array.isArray(res.data)) {
          this.setState({
            resellerList: res.data.map((item: any) => ({
              _id: item._id,
              label: item.nickName
            }))
          });
        } else {
          Modal.alert("Get reseller failed !", res.error, [
            { text: "OK", onPress: () => {} }
          ]);
        }
      })
      .catch(error => {
        Portal.remove(toastKey);
        console.error(error);
      });
  }

  handleSelectState = (reseller: any) => {
    const { navigation } = this.props;
    navigation.navigate("CreateOrganization", {
      reseller: reseller
    });
  };

  renderListItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        key={item._id}
        onPress={() => {
          this.handleSelectState(item);
        }}
        style={{ marginTop: 1 }}
      >
        <View style={styles.itemWrapper}>
          <Text style={styles.textStyle}>{item.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { navigation } = this.props;
    const { resellerList } = this.state;
    return (
      <View style={styles.normal}>
        <TitleBarNew title={"Reseller"} navigation={navigation} />
        <FlatList
          data={resellerList}
          renderItem={this.renderListItem}
          keyExtractor={(item, index) => item._id + index}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: "#F2F2F2"
  },
  itemWrapper: {
    width: deviceWidth,
    height: 48,
    paddingLeft: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF"
  },
  textStyle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: "#2E2E2E"
  },
  enterStyle: {
    position: "relative",
    width: 7,
    height: 12,
    marginRight: 17
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

export default connect(mapStateToProps, mapDispatchToProps)(SelectReseller);
