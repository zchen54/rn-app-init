import React from "react";
import { connect } from "react-redux";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { TitleBarNew } from "../../../common/components";
import { FONT_FAMILY } from "../../../common/styles";

const Page = {
  font_family: FONT_FAMILY
};

interface Props {
  navigation: any;
}

interface State {}

class Maps extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    let region = this.props.navigation.getParam("region");
    let source = {
      uri:
        "https://www.google.com/maps/search/?api=1&query=" +
        region[1] +
        "," +
        region[0]
    };

    return (
      <View style={styles.container}>
        <TitleBarNew title={"Map"} navigation={this.props.navigation} />
        <WebView
          originWhitelist={["*"]}
          source={source}
          onLoad={() => console.log("load")}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#f2f2f2"
  },
  textStyle: {
    fontSize: 14,
    fontFamily: Page.font_family
  },
  titleStyle: {
    fontSize: 16,
    fontFamily: Page.font_family
  }
});

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Maps);
