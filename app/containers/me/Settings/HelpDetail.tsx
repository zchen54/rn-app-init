import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { TitleBarNew } from "../../../common/components";
import { deviceWidth } from "../../../common/utils";
import { FONT_FAMILY } from "../../../common/styles";

interface State {}
interface Props {
  navigation: any;
}
interface Icon {
  [key: string]: any;
}
const Icon: Icon = {
  "1_1": require("../../images/help/1_1.png"),
  "1_2": require("../../images/help/1_2.png"),
  "2_1": require("../../images/help/2_1.png"),
  "2_2": require("../../images/help/2_2.png"),
  "2_3": require("../../images/help/2_3.png"),
  "3_1": require("../../images/help/3_1.png"),
  "3_2": require("../../images/help/3_2.png"),
  "3_4": require("../../images/help/3_4.png"),
  "3_3": require("../../images/help/3_3.png"),
  "4_1": require("../../images/help/4_1.png"),
  "4_2": require("../../images/help/4_2.png"),
  "4_3": require("../../images/help/4_3.png"),
  "4_4": require("../../images/help/4_4.png"),
  "4_5": require("../../images/help/4_5.png"),
  "4_6": require("../../images/help/4_6.png"),
  "4_7": require("../../images/help/4_7.png"),
  "5_1": require("../../images/help/5_1.png"),
  "5_2": require("../../images/help/5_2.png"),
  "5_3": require("../../images/help/5_3.png"),
  "5_4": require("../../images/help/5_4.png")
};
const step = [
  {
    title: "How to create templates",
    steps: [
      {
        title: "",
        content: [
          "First step:Open the home page of Data2Go and Click on the “Work”;",
          "Second step:Click the “New Template” to Create a blank template."
        ]
      }
    ]
  },
  {
    title: "How to edit my own templates",
    steps: [
      {
        title: "",
        content: [
          "First step:Open the home page of Data2Go and Choose the template you want to fill in;",
          "Second step:Click the icon in the upper right corner.",
          "Second step:Click the “edit” icon to edit the template."
        ]
      }
    ]
  },
  {
    title: "How to fill in the data",
    steps: [
      {
        title: "The first way:",
        content: [
          "Open the home page of Data2Go and Choose the template you want to fill in."
        ]
      },
      {
        title: "The second way:",
        content: [
          "First step:Open the home page of Data2Go and Click on the “Work”;",
          "Second step:Click the ”Collect Data”to Select the local existing template;",
          "Third step:Select the template you want to fill in."
        ]
      }
    ]
  },
  {
    title: "How to edit your own data",
    steps: [
      {
        title: "The first way:",
        content: [
          "First step:Open the home page of Data2Go and Click on the “Data”;",
          "Second step:Select the data you want to edit;",
          "Third step:Click the icon in the upper right corner;",
          "Fourth step:Click the “edit” icon to fill in the data."
        ]
      },
      {
        title: "The second way:",
        content: [
          "First step:Open the home page of Data2Go and Click on the “Work”;",
          "Second step:Click the”Edit Data” to Select the local existing data;",
          "Third step:Select the data you want to fill in."
        ]
      }
    ]
  },
  {
    title: "How to create an organizational structure",
    steps: [
      {
        title: "",
        content: [
          "First step:Open the home page of Data2Go and Click on the “Me”;",
          "Second step:Click the“Create Organization” to fill in the company information; ",
          "Third step:In organizational management background editor: in PC browser's address bar enter https://www.data2template.com/login, login and then click the “Manage Company”;",
          "Fourth step:Click the “Information” to set it."
        ]
      }
    ]
  }
];
const DIcon = {
  more: require("../../images/Index-Login/more-operation.png")
};
export class HelpDetail extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    let { navigation } = this.props;
    let title = navigation.getParam("title");
    let stepIndex = step.findIndex(item => item.title === title);
    let contentIndex = 0;
    return (
      <View style={styles.normal}>
        <TitleBarNew
          title={title}
          navigation={navigation}
          middleStyle={{ maxWidth: deviceWidth - 160 }}
        />
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.contentWrapper}>
            <View style={styles.titleWrapper}>
              <Text style={styles.titleStyle}>{title}</Text>
            </View>
            {step
              .filter(item => item.title === title)[0]
              .steps.map((step: any) => (
                <View key={"item.title"}>
                  <Text style={styles.textStyle}>{step.title}</Text>
                  {step.content.map((text: string) => {
                    let a: string = stepIndex + 1 + "_" + (contentIndex + 1);
                    contentIndex++;
                    return (
                      <View key={text}>
                        <Text style={styles.textStyle}>{text}</Text>
                        <Image
                          source={Icon[a]}
                          style={{
                            width: "100%",
                            resizeMode: "contain",
                            height: a === "5_3" || a === "5_4" ? 160 : 580
                          }}
                        />
                      </View>
                    );
                  })}
                </View>
              ))}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center"
  },
  contentWrapper: {
    width: deviceWidth,
    paddingLeft: 18,
    paddingRight: 15,
    marginBottom: 30
  },
  titleWrapper: {
    minHeight: 51,
    width: "100%",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E6"
  },
  titleStyle: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E2E2E"
  },
  textStyle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    color: "#2E2E2E"
  }
});

export default HelpDetail;
