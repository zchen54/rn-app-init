import React from "react";
import { Component } from "react";
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
import { deviceWidth } from "../../../common/utils";
import { IndustryList } from "./commonData";
interface State {
  selected: number;
}
interface Props {
  navigation: any;
}
const Page = {
  font_family: FONT_FAMILY
};

const Icon: any = {
  IT: require("../../images/industry/IT.png"),
  Manufacture: require("../../images/industry/Manufacture.png"),
  Trade: require("../../images/industry/Trade.png"),
  Construction: require("../../images/industry/Construction.png"),
  Finance: require("../../images/industry/Finance.png"),
  Services: require("../../images/industry/Services.png"),
  Education: require("../../images/industry/Education.png"),
  Media: require("../../images/industry/Media.png"),
  Government: require("../../images/industry/Government.png"),
  Organizations: require("../../images/industry/Organizations.png"),
  Mining: require("../../images/industry/Mining.png"),
  "Friends and Relatives": require("../../images/industry/Friends.png")
};
export class Industry extends Component<Props, State> {
  flatList: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      selected: 0
    };
  }

  handleSelectIndustry = (valueObj: any) => {
    let { navigation } = this.props;
    navigation.navigate("CreateOrganization", {
      industry: valueObj.id,
      industryText: valueObj.name
    });
  };

  handleSelect = (Index: number) => {
    this.setState({
      selected: Index
    });
    this.flatList.scrollToIndex({
      animated: true,
      index: Index,
      viewOffset: 0,
      viewPosition: 0
    });
  };

  renderFlatItem = ({ item, index }: any) => {
    let { selected } = this.state;
    return (
      <TouchableOpacity onPress={() => this.handleSelect(index)}>
        <View
          style={
            selected === index
              ? styles.leftItemWrapperSelected
              : styles.leftItemWrapper
          }
        >
          <Image
            style={
              selected === index ? styles.iconStyleSelected : styles.iconStyle
            }
            source={Icon[item.groupName]}
          />
          <Text
            style={
              selected === index
                ? { ...styles.leftText, color: "#1E9DFC" }
                : styles.leftText
            }
          >
            {item.groupName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  renderRightItems = ({ item }: any) => {
    return (
      <View style={styles.rightWrapper}>
        <View style={styles.rightTitleWrapper}>
          <Text style={styles.rightTitle}>{item.groupName}</Text>
        </View>
        {item.sub.map((s: any, index: number) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => {
              this.handleSelectIndustry(s);
            }}
          >
            <View style={styles.blockStyle}>
              <Text numberOfLines={3} style={styles.rightText}>
                {s.name}
              </Text>
              <View style={index % 2 === 0 ? styles.rightTextWrapper : null} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  renderLeft = () => {
    return (
      <FlatList
        data={IndustryList}
        renderItem={this.renderFlatItem}
        keyExtractor={(item, index) => item.groupID + "" + index}
        ItemSeparatorComponent={() => <View style={styles.leftLine} />}
      />
    );
  };

  renderRight = () => {
    return (
      <FlatList
        ref={ref => (this.flatList = ref)}
        data={IndustryList}
        renderItem={this.renderRightItems}
        keyExtractor={(item, index) => item.groupName + "" + index}
      />
    );
  };

  render() {
    let { navigation } = this.props;
    return (
      <View style={styles.normal}>
        <TitleBarNew title={"Industry"} navigation={navigation} />
        <View style={{ flex: 1 }}>
          <View style={styles.container}>
            {this.renderLeft()}
            {this.renderRight()}
          </View>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: "#F2F2F2"
  },
  searchBarWrapper: {
    height: 49,
    justifyContent: "center",
    paddingLeft: 17,
    paddingRight: 17
  },
  container: {
    flexDirection: "row",
    width: deviceWidth,
    height: "100%"
  },
  iconStyle: {
    width: 15,
    height: 15,
    marginRight: 4
  },
  iconStyleSelected: {
    width: 15,
    height: 15,
    marginRight: 4,
    tintColor: "#1E9DFC"
  },
  leftItemWrapper: {
    width: 125,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20
  },
  leftItemWrapperSelected: {
    width: 125,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 2,
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 2,
    borderLeftColor: "#1E9DFC"
  },
  leftText: {
    fontFamily: Page.font_family,
    fontSize: 14,
    color: "#2E2E2E"
  },
  leftLine: {
    width: 125,
    height: 1,
    backgroundColor: "#FFFFFF"
  },
  rightWrapper: {
    width: deviceWidth - 125,
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#FFFFFF"
  },
  blockStyle: {
    flexDirection: "row",
    width: (deviceWidth - 125) / 2,
    height: 40,
    justifyContent: "center",
    alignItems: "center"
  },
  rightTextWrapper: {
    width: 1,
    height: 20,
    backgroundColor: "#F2F2F2"
  },
  rightText: {
    width: (deviceWidth - 125) / 2,
    fontFamily: Page.font_family,
    fontSize: 14,
    color: "#2E2E2E",
    textAlign: "center"
  },
  rightTitleWrapper: {
    width: "100%",
    height: 20,
    backgroundColor: "#F2F2F2",
    justifyContent: "center"
  },
  rightTitle: {
    fontFamily: Page.font_family,
    fontSize: 12,
    color: "#757575"
  },
  rightColLine: {
    width: 1,
    height: 20,
    color: "#F2F2F2"
  }
});

export default Industry;
