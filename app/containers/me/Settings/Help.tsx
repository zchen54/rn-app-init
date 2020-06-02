import React, { Component } from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import { TitleBarNew } from "../../../common/components";
import { deviceWidth } from "../../../common/utils";
import { FONT_FAMILY } from "../../../common/styles";

interface State {}
interface Props {
  navigation: any;
}

// interface option {
//   text: string;
//   onPress: Function;
// }

const Items: Array<string> = [
  "How to create templates",
  "How to edit my own templates",
  "How to fill in the data",
  "How to edit your own data",
  "How to create an organizational structure"
];

const Icon = {
  EnterIcon: require("../../images/Me/enterwhite.png")
};

export class Help extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    let { navigation } = this.props;
    return (
      <View style={styles.normal}>
        <TitleBarNew title={"Help"} navigation={navigation} />
        <View style={styles.titleWrapper}>
          <Text style={styles.titleStyle}>Main problems</Text>
        </View>
        {Items.map((item: string, index: number) => (
          <TouchableOpacity
            key={item}
            onPress={() =>
              navigation.navigate("HelpDetail", {
                title: item
              })
            }
          >
            <View style={styles.itemStyle}>
              <View
                style={
                  index !== 4
                    ? styles.itemTextWrapper
                    : { ...styles.itemTextWrapper, borderBottomWidth: 0 }
                }
              >
                <Text style={styles.itemText}>{item}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image style={styles.enterStyle} source={Icon.EnterIcon} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  titleWrapper: {
    width: deviceWidth,
    height: 40,
    paddingLeft: 18,
    justifyContent: "center"
  },
  titleStyle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    color: "#757575"
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
    marginLeft: 18,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#D9D9D9",
    borderBottomWidth: 1
  },
  itemText: {
    fontSize: 16,
    color: "#2E2E2E"
  },
  enterStyle: {
    position: "relative",
    width: 7,
    height: 12,
    marginRight: 17,
    tintColor: "#B3B3B3"
  }
});

export default Help;
