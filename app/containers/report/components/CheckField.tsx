import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image
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
  checkOption: Array<string>;
}
interface Props {
  navigation: any;
  editingReportObj: ModelType & ReportType;
  editingTemplate: ModelType & TemplateType;
}

const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  titleColor: DColors.title
};

const DIcon = {
  rightIcon: require("../../images/template/Right.png")
};
export class RadioField extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      checkOption: []
    };
  }

  componentWillMount() {
    let field = this.props.navigation.getParam("field");
    let FieldValue = field.FieldValue;
    let valueArr;
    if (FieldValue === "") {
      valueArr = [];
    } else {
      valueArr = FieldValue.split(",");
    }
    this.setState({
      checkOption: valueArr
    });
  }
  componentWillReceiveProps(nextProps: Props) {
    let field = nextProps.navigation.getParam("field");
    let FieldValue = field.FieldValue;
    let valueArr;
    if (FieldValue === "") {
      valueArr = [];
    } else {
      valueArr = FieldValue.split(",");
    }
    this.setState({
      checkOption: valueArr
    });
  }

  handlePress = (value: string) => {
    let { checkOption } = this.state;
    if (checkOption.some(item => item === value)) {
      checkOption = checkOption.filter(item => item !== value);
    } else {
      checkOption.push(value);
    }
    this.setState({
      checkOption
    });
  };

  render() {
    let { navigation, editingTemplate } = this.props;
    let field = navigation.getParam("field");
    let onCheckBox = navigation.getParam("onCheckBox");
    let options = navigation.getParam("options");
    console.log("options", options);

    const _renderItem = (data: any) => {
      const { index, item } = data;
      return (
        <TouchableOpacity onPress={() => this.handlePress(item)}>
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
              {this.state.checkOption.some(value => value === item) ? (
                <View
                  style={{
                    ...styles.unCheckCircle,
                    borderColor: DColors.mainColor,
                    backgroundColor: DColors.mainColor
                  }}
                >
                  <Image
                    style={{ width: 15, height: 10, tintColor: "#FFFFFF" }}
                    source={DIcon.rightIcon}
                  />
                </View>
              ) : (
                <View style={styles.unCheckCircle} />
              )}
              <Text style={{ ...styles.itemText, width: "90%" }}>{item}</Text>
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
              onCheckBox(this.state.checkOption);
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
    alignItems: "center"
    // justifyContent: "space-between"
  },
  itemText: {
    fontFamily: Page.font_family,
    color: Page.titleColor,
    fontSize: 16
  },
  unCheckCircle: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#999999",
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 8
  }
});

const mapStateToProps = (state: any) => {
  return {
    editingTemplate: state.template.editingTemplate,
    editingReport: state.report.editingReport,
    currentUserInfo: state.loginInfo.currentUserInfo
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(RadioField);
