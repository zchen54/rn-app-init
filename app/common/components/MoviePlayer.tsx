import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Slider,
  ActivityIndicator,
  Modal,
  Platform,
  Dimensions,
  StyleSheet
} from "react-native";
import Video from "react-native-video";
import Orientation from "react-native-orientation";
import { Toast, Icon } from "@ant-design/react-native";
import { DColors, DFontSize, FONT_FAMILY } from "../../common/styles";

const deviceInfo = {
  deviceWidth: Dimensions.get("window").width,
  deviceHeight:
    Platform.OS === "ios"
      ? Dimensions.get("window").height
      : Dimensions.get("window").height - 24
};

const header = {
  Accept: "application/json",
  "Content-Type": "application/json"
};

const movieDetailUrl =
  "https://ticket-api-m.mtime.cn/movie/detail.api?locationId=290&movieId=125805";

const playerHeight = 250;

const navContentHeight = Platform.OS === "ios" ? 0 : 12;

interface State {
  rate: number;
  slideValue: number;
  currentTime: number;
  duration: number;
  paused: boolean;
  playIcon: any;
  isTouchedScreen: boolean;
  modalVisible: boolean;
  isLock: boolean;
  movieInfo: any;
  orientation: any;
  specificOrientation: any;
}
interface Props {
  source: any;
}

export default class MoviePlayer extends Component<Props, State> {
  player: any;
  constructor(props: Props) {
    super(props);
    this.player = null;
    this.state = {
      rate: 1,
      slideValue: 0.0,
      currentTime: 0.0,
      duration: 0.0,
      paused: false,
      playIcon: "pause",
      isTouchedScreen: true,
      modalVisible: true,
      isLock: false,
      movieInfo: {},
      orientation: null,
      specificOrientation: null
    };
  }

  componentWillMount() {
    const init = Orientation.getInitialOrientation();
    this.setState({
      orientation: init,
      specificOrientation: init
    });
  }

  componentDidMount() {
    console.log("fetch---");

    fetch(movieDetailUrl, {
      method: "GET",
      headers: header
    })
      .then(response => response.json())
      .then(responseData => {
        console.log("responseData", responseData);
        this.setState({ movieInfo: responseData.data.basic.video });
      })
      .catch(error => {
        console.log(error);
      });

    Orientation.addOrientationListener(this._updateOrientation);
    Orientation.addSpecificOrientationListener(this._updateSpecificOrientation);
  }

  componentWillUnmount() {
    Orientation.removeOrientationListener(this._updateOrientation);
    Orientation.removeSpecificOrientationListener(
      this._updateSpecificOrientation
    );
  }

  _updateOrientation = (orientation: any) => this.setState({ orientation });
  _updateSpecificOrientation = (specificOrientation: any) =>
    this.setState({ specificOrientation });

  loadStart(data: any) {
    console.log("loadStart", data);
  }

  setDuration(duration: any) {
    this.setState({ duration: duration.duration });
  }

  setTime(data: any) {
    let sliderValue = parseInt(this.state.currentTime + "");
    this.setState({
      slideValue: sliderValue,
      currentTime: data.currentTime,
      modalVisible: false
    });
  }

  onEnd() {
    this.player.seek(0);
  }

  videoError(error: any) {
    Toast.fail("Video player error !");
    this.setState({
      modalVisible: false
    });
  }

  onBuffer() {
    console.log("onBuffer");
  }

  onTimedMetadata(data: any) {
    console.log("onTimedMetadata", data);
  }

  formatMediaTime(duration: any) {
    let min: any = Math.floor(duration / 60);
    let second: any = duration - min * 60;
    min = min >= 10 ? min : "0" + min;
    second = second >= 10 ? second : "0" + second;
    return min + ":" + second;
  }

  play() {
    this.setState({
      paused: !this.state.paused,
      playIcon: this.state.paused ? "pause" : "caret-right"
    });
  }

  renderModal() {
    return (
      <Modal
        animationType={"none"}
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => alert("Modal has been closed.")}
      >
        <View style={vStyles.indicator}>
          <ActivityIndicator
            animating={true}
            style={[{ height: 80 }]}
            color={DColors.mainColor}
            size="large"
          />
        </View>
      </Modal>
    );
  }

  render() {
    const { orientation, isLock } = this.state;
    const url = this.state.movieInfo.url;
    const title = this.state.movieInfo.title;
    return url ? (
      <TouchableOpacity
        style={[
          vStyles.movieContainer,
          {
            height:
              orientation === "PORTRAIT"
                ? playerHeight
                : deviceInfo.deviceWidth,
            marginTop:
              orientation === "PORTRAIT" ? (Platform.OS === "ios" ? 20 : 0) : 0
          }
        ]}
        onPress={() =>
          this.setState({ isTouchedScreen: !this.state.isTouchedScreen })
        }
      >
        <Video
          source={{ uri: url }}
          ref={ref => (this.player = ref)}
          rate={this.state.rate}
          volume={1.0}
          muted={false}
          paused={this.state.paused}
          resizeMode="cover"
          repeat={true}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch={"ignore"}
          progressUpdateInterval={250.0}
          onLoadStart={data => this.loadStart(data)}
          onLoad={data => this.setDuration(data)}
          onProgress={data => this.setTime(data)}
          onEnd={this.onEnd}
          onError={data => this.videoError(data)}
          onBuffer={this.onBuffer}
          onTimedMetadata={data => this.onTimedMetadata(data)}
          style={[vStyles.videoPlayer]}
        />
        {this.state.isTouchedScreen && !isLock ? (
          <View style={vStyles.navContentStyle}>
            {/* video header button group */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1
              }}
            >
              {orientation !== "PORTRAIT" && (
                <TouchableOpacity
                  style={{ backgroundColor: "transparent" }}
                  onPress={
                    orientation === "PORTRAIT"
                      ? () => alert("pop")
                      : Orientation.lockToPortrait
                  }
                >
                  <Icon name="left" size={18} color="#fff" />
                </TouchableOpacity>
              )}
              <Text
                style={{
                  backgroundColor: "transparent",
                  color: "#fff",
                  marginLeft: 10
                }}
              >
                {title}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              {/* {orientation !== "PORTRAIT" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center"
                  }}
                >
                  <TouchableOpacity
                    style={vStyles.navToolBar}
                    onPress={() => alert("share")}
                  >
                    <Icon
                      name="share-alt"
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={vStyles.navToolBar}
                    onPress={() => alert("download")}
                  >
                    <Icon name="download" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={vStyles.navToolBar}
                    onPress={() => alert("setting")}
                  >
                    <Icon
                      name="small-dash"
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              ) : null} */}
            </View>
            {/* video header button group -end- */}
          </View>
        ) : (
          <View
            style={{
              height: navContentHeight,
              backgroundColor: "#000"
            }}
          />
        )}
        {orientation !== "PORTRAIT" ? (
          <TouchableOpacity
            style={{
              marginHorizontal: 10,
              backgroundColor: "transparent",
              width: 30,
              height: 30,
              alignItems: "center",
              justifyContent: "center"
            }}
            onPress={() => this.setState({ isLock: !this.state.isLock })}
          >
            <Icon
              name={this.state.isLock ? "lock" : "unlock"}
              size={20}
              color={"#fff"}
            />
          </TouchableOpacity>
        ) : null}
        {this.state.isTouchedScreen && !isLock ? (
          <View
            style={[
              vStyles.toolBarStyle,
              {
                marginBottom:
                  Platform.OS === "ios"
                    ? 0
                    : orientation !== "PORTRAIT"
                    ? 25
                    : 0
              }
            ]}
          >
            <TouchableOpacity onPress={() => this.play()}>
              <Icon name={this.state.playIcon} size={18} color="#fff" />
            </TouchableOpacity>
            <View style={vStyles.progressStyle}>
              <Text style={vStyles.timeStyle}>
                {this.formatMediaTime(Math.floor(this.state.currentTime))}
              </Text>
              <Slider
                style={vStyles.slider}
                value={this.state.slideValue}
                maximumValue={this.state.duration}
                minimumTrackTintColor={DColors.mainColor}
                maximumTrackTintColor={DColors.auxiliaryGray}
                step={1}
                onValueChange={value => this.setState({ currentTime: value })}
                onSlidingComplete={value => this.player.seek(value)}
              />
              <Text style={vStyles.timeStyle}>
                {this.formatMediaTime(Math.floor(this.state.duration))}
              </Text>
            </View>
            {orientation === "PORTRAIT" ? (
              <TouchableOpacity onPress={Orientation.lockToLandscapeLeft}>
                <Icon name={"arrows-alt"} size={18} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={Orientation.lockToPortrait}>
                <Icon name={"shrink"} size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={{ height: 40 }} />
        )}
        {this.renderModal()}
      </TouchableOpacity>
    ) : (
      <View />
    );
  }
}

const vStyles = StyleSheet.create({
  movieContainer: {
    justifyContent: "space-between"
  },
  videoPlayer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  navContentStyle: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    backgroundColor: "#000"
  },
  toolBarStyle: {
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    justifyContent: "space-around",
    marginTop: 10,
    height: 30
  },
  timeStyle: {
    minWidth: 40,
    color: "#fff",
    fontSize: 12
  },
  slider: {
    flex: 1,
    marginHorizontal: 5,
    height: 20
  },
  progressStyle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginHorizontal: 10
  },
  indicator: {
    height: playerHeight,
    width: deviceInfo.deviceWidth,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  navToolBar: {
    backgroundColor: "transparent",
    marginHorizontal: 5
  }
});
