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
import { deviceWidth, requestApiV2, API_v2 } from "../../../common/utils";
interface State {
  countries: Array<any>;
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

export class RegionState extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      countries: []
    };
  }

  componentWillMount() {
    const { authToken } = this.props;
    requestApiV2(API_v2.getCountry, null, authToken)
      .then(res => {
        if (Array.isArray(res.data)) {
          this.setState({
            countries: res.data.sort(function(a: any, b: any) {
              var countryA = a.country.toUpperCase();
              var countryB = b.country.toUpperCase();
              if (countryA < countryB) {
                return -1;
              }
              if (countryA > countryB) {
                return 1;
              }
              return 0;
            })
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  handleSelectState = (valueObj: string) => {
    const { navigation } = this.props;
    navigation.navigate("RegionProvince", {
      regionStateData: valueObj,
      regionProvData: {},
      regionCityData: {}
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
          <Text style={styles.textStyle}>{item.country}</Text>
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
    const { countries } = this.state;
    return (
      <View style={styles.normal}>
        <TitleBarNew title={"Region"} navigation={navigation} />
        <FlatList
          data={countries}
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
)(RegionState);
