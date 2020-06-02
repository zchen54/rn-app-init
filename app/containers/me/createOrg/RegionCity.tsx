import React, { Component } from "react";
import { connect } from "react-redux";
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
import { deviceWidth, sortObjectArray } from "../../../common/utils";
interface State {
  cities: Array<any>;
  stateData: any;
  provinceData: any;
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

export class RegionCity extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      cities: [],
      stateData: {},
      provinceData: {}
    };
  }

  componentWillMount() {
    const { navigation } = this.props;
    const state = navigation.getParam("regionStateData");
    const province = navigation.getParam("regionProvData");
    this.setState({
      stateData: state,
      provinceData: province,
      cities: sortObjectArray(province.litleCities, "name")
    });
  }

  handleSelectCity = (valueObj: string) => {
    const { navigation } = this.props;
    const { stateData, provinceData } = this.state;
    navigation.navigate("CreateOrganization", {
      regionStateData: stateData,
      regionProvData: provinceData,
      regionCityData: valueObj
    });
  };

  renderListItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        key={item._id}
        onPress={() => {
          this.handleSelectCity(item);
        }}
        style={{ marginTop: 1 }}
      >
        <View style={styles.itemWrapper}>
          <Text style={styles.textStyle}>{item.name}</Text>
          <Image
            style={{ ...styles.enterStyle, tintColor: "#B3B3B3" }}
            source={Icon.EnterIcon}
          />
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { navigation } = this.props;
    const { cities } = this.state;
    return (
      <View style={styles.normal}>
        <TitleBarNew title={"Region"} navigation={navigation} />
        <FlatList
          data={cities}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RegionCity);
