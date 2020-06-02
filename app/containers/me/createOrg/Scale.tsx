import React from "react";
import { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { TitleBarNew } from "../../../common/components";
import { FONT_FAMILY } from "../../../common/styles";
import { deviceWidth } from "../../../common/utils";
interface State {}
interface Props {
  navigation: any;
}
const Page = {
  font_family: FONT_FAMILY
};

const Icon: any = {
  social: require("../../images/industry/Personnel.png")
};
const numberArray = [
  {
    key: 0,
    number: "1-9"
  },
  {
    key: 1,
    number: "10-20"
  },
  {
    key: 2,
    number: "21-50"
  },
  {
    key: 3,
    number: "51-100"
  },
  {
    key: 4,
    number: "101-200"
  },
  {
    key: 5,
    number: "201-500"
  },
  {
    key: 6,
    number: "501-2000"
  },
  {
    key: 7,
    number: ">2000"
  }
];
export class Scale extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  handleSelectScale = (value: string) => {
    let { navigation } = this.props;
    navigation.navigate("CreateOrganization", { scale: value });
  };

  render() {
    let { navigation } = this.props;
    return (
      <View style={styles.normal}>
        <TitleBarNew title={"Scale"} navigation={navigation} />
        <View style={styles.topWrapper}>
          <View style={styles.iconWrapper}>
            <Image source={Icon.social} style={styles.iconStyle} />
          </View>
          <Text style={styles.topText}>Select the company scale</Text>
        </View>
        {numberArray.map(item => (
          <TouchableOpacity
            key={item.key}
            onPress={() => {
              this.handleSelectScale(item.number);
            }}
            style={{ marginTop: 1 }}
          >
            <View style={styles.itemWrapper}>
              <Text style={styles.textStyle}>{item.number}</Text>
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
    backgroundColor: "#F2F2F2"
  },
  topWrapper: {
    flexDirection: "row",
    width: deviceWidth,
    height: 64,
    paddingLeft: 17,
    alignItems: "center",
    backgroundColor: "#FFFFFF"
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E9DFC",
    justifyContent: "center",
    alignItems: "center"
  },
  iconStyle: {
    width: 31,
    height: 27,
    tintColor: "#FFFFFF"
  },
  topText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: "#2E2E2E",
    marginLeft: 24
  },
  itemWrapper: {
    width: deviceWidth,
    height: 48,
    paddingLeft: 18,
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  textStyle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: "#2E2E2E"
  }
});
export default Scale;
