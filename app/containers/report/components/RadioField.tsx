import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput
} from "react-native";
import { Icon } from "@ant-design/react-native";
import { TitleBarNew } from "../../../common/components";
import { connect } from "react-redux";
import {
  ReportType,
  TemplateType,
  ModelType
} from "../../../common/constants/ModeTypes";
import { deviceWidth } from "../../../common/utils";
import { FONT_FAMILY, DColors } from "../../../common/styles";
import { Toast } from "@ant-design/react-native";
interface State {
  checkOption: string;
  customOption: string;
}
interface Props {
  navigation: any;
  editingReportObj: ModelType & ReportType;
}

const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  titleColor: DColors.title
};

const DIcon = {
  rightIcon: require("../../images/template/Right.png")
};
export class CheckField extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      checkOption: "",
      customOption: ""
    };
  }

  componentWillMount() {
    let field = this.props.navigation.getParam("field");
    let options = this.props.navigation.getParam("options");
    let customOption = "";
    if (field.FieldValue && options.indexOf(field.FieldValue) < 0) {
      customOption = field.FieldValue;
    }
    this.setState({
      checkOption: field.FieldValue,
      customOption
    });
  }

  render() {
    const { navigation } = this.props;
    const { checkOption, customOption } = this.state;
    let field = navigation.getParam("field");
    let onRadioBox = navigation.getParam("onRadioBox");
    let options = navigation.getParam("options");
    console.log("options", options);

    const _renderItem = (data: any) => {
      const { index, item } = data;
      return item ? (
        <TouchableOpacity
          onPress={() => {
            this.setState({
              checkOption: item
            });
          }}
        >
          <View style={styles.itemWrapper}>
            <View
              style={
                index === 0
                  ? styles.itemStyle
                  : {
                      ...styles.itemStyle,
                      borderTopWidth: 1,
                      borderTopColor: "#D9D9D9"
                    }
              }
            >
              <Text style={{ ...styles.itemText, width: "90%" }}>{item}</Text>
              {checkOption === item ? (
                <Image
                  style={{ width: 15, height: 10 }}
                  source={DIcon.rightIcon}
                />
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => {
            this.setState({
              checkOption: customOption
            });
          }}
        >
          <View style={styles.itemWrapper}>
            <View
              style={
                index === 0
                  ? styles.itemStyle
                  : {
                      ...styles.itemStyle,
                      borderTopWidth: 1,
                      borderTopColor: "#D9D9D9"
                    }
              }
            >
              <TextInput
                placeholder="Input option content"
                numberOfLines={1}
                value={customOption}
                style={{ ...styles.itemText, width: "70%" }}
                onChangeText={(value: string) => {
                  this.setState({
                    customOption: value,
                    checkOption: value
                  });
                }}
              />
              {checkOption !== "" && checkOption === customOption ? (
                <Image
                  style={{ width: 15, height: 10 }}
                  source={DIcon.rightIcon}
                />
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <View style={styles.nomal}>
        <TitleBarNew
          navigation={navigation}
          title={field.FieldName}
          middleStyle={{ maxWidth: deviceWidth - 160 }}
          right={<Icon name="check" color="#fff"></Icon>}
          pressRight={() => {
            if (this.state.checkOption.length > 0) {
              onRadioBox(this.state.checkOption);
              navigation.goBack();
            } else {
              Toast.fail("Please select data", 1, undefined, false);
              return;
            }
          }}
        />
        <View style={{ height: 8 }} />
        <View style={styles.itemWrapper}>
          <View
            style={{
              ...styles.itemStyle,
              borderBottomWidth: 1,
              borderBottomColor: "#D9D9D9"
            }}
          >
            <Text
              numberOfLines={2}
              style={{ ...styles.itemText, fontWeight: "bold" }}
            >
              {field.FieldName}
              <Text style={{ fontSize: 14, color: "#aaa" }}>
                {field.Remark ? "   " + field.Remark : ""}
              </Text>
            </Text>
          </View>
        </View>
        <FlatList
          data={options}
          keyExtractor={(item: any, index: number) => item + "" + index}
          renderItem={item => _renderItem(item)}
          extraData={this.state}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  nomal: {
    flex: 1,
    backgroundColor: "#F2F2F2"
  },
  itemWrapper: {
    width: deviceWidth,
    height: 52,
    paddingLeft: 17,
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  itemStyle: {
    flexDirection: "row",
    flex: 1,
    paddingRight: 17,
    height: 52,
    alignItems: "center",
    justifyContent: "space-between"
  },
  itemText: {
    fontFamily: Page.font_family,
    color: Page.titleColor,
    fontSize: 16
  }
});

const mapStateToProps = (state: any) => {
  return {
    editingReport: state.report.editingReport,
    currentUserInfo: state.loginInfo.currentUserInfo
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(CheckField);
