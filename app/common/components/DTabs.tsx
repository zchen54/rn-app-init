import React, { Component } from "react";
import ImagePicker from "react-native-image-picker";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PixelRatio,
  ScrollView,
  TouchableOpacity,
  Image
} from "react-native";
import { Button, Toast, Icon } from "@ant-design/react-native";
import { DColors, DFontSize, FONT_FAMILY } from "../../common/styles";
import {
  setSize, // 设置宽高
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  setSizeWithPx // 设置字体 px 转 dp
} from "../../common/utils";

interface State {
  activeTab: number;
}
interface Props {
  tabs: Array<any>;
  renderTabView: any;
  tabsContainerStyle: any;
}

export class DTabs extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      activeTab: 0
    };
  }

  render() {
    console.log("render DTabs", this.props);
    const { activeTab } = this.state;
    const { tabs, renderTabView, tabsContainerStyle } = this.props;
    const renderTabBar = tabs.map((item: any, index: number) => (
      <TouchableOpacity key={index}>
        <View style={styles.tabBarItem}>
          <Text style={styles.tabBarText}>{item.title}</Text>
          {index === activeTab && <View style={styles.activeTabLine} />}
        </View>
      </TouchableOpacity>
    ));
    return (
      <View style={tabsContainerStyle}>
        <View style={styles.tabBar}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {renderTabBar}
          </ScrollView>
        </View>
        <View>
          <Text>content</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tabBar: {
    width: deviceWidth,
    height: setSizeWithPx(100),
    justifyContent: "center",
    alignItems: "center",
    paddingTop: setSizeWithPx(12),
    paddingBottom: setSizeWithPx(12),
    backgroundColor: "#fff"
  },
  tabBarItem: {
    width: setSizeWithPx(238),
    height: setSizeWithPx(66),
    paddingTop: setSizeWithPx(10),
    paddingBottom: setSizeWithPx(10),
    justifyContent: "center",
    alignItems: "center"
  },
  tabBarText: {
    fontSize: setSizeWithPx(42)
  },
  activeTabLine: {
    width: setSizeWithPx(70),
    height: setSizeWithPx(8),
    borderRadius: setSizeWithPx(2),
    backgroundColor: DColors.mainColor
  }
});
