import React from "react";
import { connect } from "react-redux";
import { View, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { TitleBarNew } from "../../common/components";
import { FONT_FAMILY } from "../../common/styles";

const Page = {
  font_family: FONT_FAMILY
};

interface Props {
  navigation: any;
}

interface State {}

class Agreement extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    let title = this.props.navigation.getParam("title");
    let source =
      Platform.OS == "ios"
        ? title === "PRIVACY POLICY"
          ? require("./PRIVACYPOLICY.html")
          : require("./TERMSOFUSE.html")
        : title === "PRIVACY POLICY"
        ? { uri: "file:///android_asset/pages/PRIVACYPOLICY.html" }
        : { uri: "file:///android_asset/pages/TERMSOFUSE.html" };
    if (title === "Map") {
      let region = this.props.navigation.getParam("region");
      source = {
        uri:
          "https://www.google.com/maps/search/?api=1&query=" +
          region[1] +
          "," +
          region[0]
      };
    }
    return (
      <View style={styles.container}>
        <TitleBarNew title={title} navigation={this.props.navigation} />
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
)(Agreement);
