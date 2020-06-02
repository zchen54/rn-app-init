import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
  NativeModules
} from "react-native";
import { Modal, Toast, Portal } from "@ant-design/react-native";
import { DMoviePlayer } from "./DMoviePlayer";
import { DImagePicker } from "./DImagePicker";
import { deviceWidth } from "./../utils/screenUtils";

interface State {
  versionName: string;
  versionCode: number;
  updateModalVisible: boolean;
  newVersion: any;
}
interface Props {
  navigation: any;
  screenProps: any;
}

export default class TestComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      versionName: "",
      versionCode: 0,
      updateModalVisible: false,
      newVersion: {}
    };
  }

  componentWillMount() {}

  render() {
    const { navigation } = this.props;
    const {
      versionName,
      versionCode,
      updateModalVisible,
      newVersion
    } = this.state;
    // console.log("render about", this.props, this.state);

    return (
      <View style={styles.normal}>
        <View style={styles.videoWrap}>
          {/* <DMoviePlayer
            source={require("./video-v.mp4")} // 视频的URL地址，或者本地地址
            width={deviceWidth}
            height={280}
          ></DMoviePlayer> */}
          <DImagePicker
            pickerStyle={{ width: 64, height: 64 }}
            source={null}
            handleSelect={(urls: any) => {
              console.log(urls);
            }}
            authToken={""}
            isCollectData={true}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center"
  },
  videoWrap: {
    width: deviceWidth,
    height: (deviceWidth / 16) * 16,
    backgroundColor: "#fff"
  }
});
