import React, { Component, Fragment } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Slider,
  ActivityIndicator,
  Platform,
  Dimensions,
  StatusBar,
  StyleSheet,
  NativeModules
} from "react-native";
import Video from "react-native-video";
import Orientation from "react-native-orientation";
import { Toast, Icon, Modal } from "@ant-design/react-native";
import { DColors, DFontSize, FONT_FAMILY } from "../styles";
import { deviceWidth, deviceHeight, isIphoneX, isIphoneXsMax } from "../utils";
import { PlatFormAndroid, PlatFormIOS } from "../../env";

interface State {
  videoModalVisible: boolean;
  rate: number;
  slideValue: number;
  currentTime: number;
  duration: number;
  paused: boolean;
  playIcon: any;
  isTouchedScreen: boolean;
  loadingVisible: boolean;
  movieInfo: any;
  orientation: any;
  specificOrientation: any;
}
interface Props {
  source: any;
  width?: number;
  height?: number;
}

export class DMoviePlayer extends Component<Props, State> {
  player: any;
  videoPreview: any;
  constructor(props: Props) {
    super(props);
    this.player = null;
    this.videoPreview = null;
    this.state = {
      videoModalVisible: false,
      rate: 1.0,
      slideValue: 0.0,
      currentTime: 0.0,
      duration: 0.0,
      paused: false,
      playIcon: "pause",
      isTouchedScreen: true,
      loadingVisible: true,
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
    this.handleInitialState(this.props);
    Orientation.addOrientationListener(this._updateOrientation);
    Orientation.addSpecificOrientationListener(this._updateSpecificOrientation);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.handleInitialState(nextProps);
  }

  componentWillUnmount() {
    Orientation.removeOrientationListener(this._updateOrientation);
    Orientation.removeSpecificOrientationListener(
      this._updateSpecificOrientation
    );
  }

  handleInitialState = (props: Props) => {
    const { source, height } = props;
    this.setState({
      movieInfo: {
        url: source,
        title: source
      }
    });
  };

  _updateOrientation = (orientation: any) => this.setState({ orientation });
  _updateSpecificOrientation = (specificOrientation: any) =>
    this.setState({ specificOrientation });

  loadStart() {
    console.log("loadStart");
  }

  setDuration(duration: any) {
    this.setState({ duration: duration.duration });
  }

  setTime(data: any) {
    let sliderValue = parseInt(this.state.currentTime + "");
    const { currentTime } = this.state;
    this.setState({
      slideValue: sliderValue,
      currentTime: data.currentTime,
      loadingVisible: currentTime === data.currentTime
    });
  }

  onEnd() {
    console.log("onEnd");
    if (this.player) {
      this.player.seek(0);
    }
    this.setState(prevState => ({
      slideValue: 0.0,
      currentTime: 0.0,
      paused: !prevState.paused,
      playIcon: prevState.paused ? "pause" : "caret-right"
    }));
  }

  videoError(error: any) {
    Toast.fail("Video player error !");
    this.setState({
      loadingVisible: false
    });
  }

  onBuffer() {
    console.log("onBuffer");
  }

  onTimedMetadata() {
    console.log("onTimedMetadata");
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

  handleShowVideoModal = (visible: boolean) => {
    const { paused } = this.state;
    this.setState({
      videoModalVisible: visible
    });
    if (visible) {
      if (Platform.OS === PlatFormAndroid) {
        StatusBar.setBackgroundColor("rgba(0,0,0,1)", true);
        StatusBar.setBarStyle("light-content", true);
      }
      this.setState({
        loadingVisible: true
      });
      if (paused) {
        this.play();
      }
    } else {
      if (Platform.OS === PlatFormAndroid) {
        StatusBar.setBackgroundColor("rgba(0,0,0,0)", true);
        StatusBar.setBarStyle("light-content", true);
      }
      this.onEnd();
    }
  };

  renderVideoPlayer = () => {
    const {
      rate,
      orientation,
      movieInfo,
      videoModalVisible,
      slideValue,
      currentTime,
      paused,
      playIcon
    } = this.state;
    const { url, title } = movieInfo;
    let mainHeight = deviceHeight;
    if (Platform.OS === PlatFormAndroid) {
      mainHeight =
        orientation === "PORTRAIT"
          ? deviceHeight - NativeModules.StatusBarManager.HEIGHT
          : deviceWidth - NativeModules.StatusBarManager.HEIGHT;
    } else {
      mainHeight = orientation === "PORTRAIT" ? deviceHeight : deviceWidth;
    }
    return (
      <Modal
        popup
        transparent={false}
        visible={videoModalVisible}
        animationType="slide-up"
        onClose={() => {}}
      >
        <TouchableOpacity
          style={[
            vStyles.videoContainer,
            {
              height: mainHeight
            }
          ]}
          onPress={() =>
            this.setState({ isTouchedScreen: !this.state.isTouchedScreen })
          }
        >
          <Video
            // source={{
            //   uri:
            //     "https://vd2.bdstatic.com/mda-jfff1srbcqxqkxeh/sc/mda-jfff1srbcqxqkxeh.mp4?auth_key=1562902805-0-0-789c96ab6e46ed0f5efd1beb6e9ccc46&bcevod_channel=searchbox_feed&pd=bjh&abtest=all"
            // }}
            source={{ uri: url }}
            ref={ref => (this.player = ref)}
            rate={paused ? 0 : rate} // 控制暂停/播放，0 代表暂停paused, 1代表播放normal.
            volume={1.0} // 声音的放声音的放大倍数大倍数，0 为静音  ，1 为正常音量 ，更大的数字表示放大的倍数
            muted={false} // true代表静音，默认为false.
            paused={paused} // true代表暂停，默认为false
            resizeMode="contain" // 视频的自适应伸缩铺放行为，contain、stretch、cover
            repeat={false} // 是否重复播放
            playInBackground={false} // 当app转到后台运行的时候，播放是否暂停
            playWhenInactive={false} // [iOS] Video continues to play when control or notification center are shown. 仅适用于IOS
            ignoreSilentSwitch={"ignore"}
            progressUpdateInterval={250.0}
            onLoadStart={this.loadStart} // 当视频开始加载时的回调函数
            onLoad={data => this.setDuration(data)} // 当视频加载完毕时的回调函数
            onProgress={data => this.setTime(data)} // 进度控制，每250ms调用一次，以获取视频播放的进度
            onEnd={() => {
              this.onEnd();
            }} // 当视频播放完毕后的回调函数
            onError={data => this.videoError(data)} // 当视频不能加载，或出错后的回调函数
            onBuffer={this.onBuffer}
            onTimedMetadata={this.onTimedMetadata}
            style={[vStyles.videoPlayer]}
          />

          {this.state.isTouchedScreen && (
            <TouchableOpacity
              style={
                Platform.OS === PlatFormIOS
                  ? { ...vStyles.closeButton, top: 50 }
                  : vStyles.closeButton
              }
              onPress={() => {
                Orientation.lockToPortrait();
                this.handleShowVideoModal(false);
              }}
            >
              <Icon name="close" size={18} color="#fff" />
            </TouchableOpacity>
          )}

          {this.state.loadingVisible ? (
            <View style={vStyles.indicator}>
              <ActivityIndicator
                animating={true}
                color={DColors.mainColor}
                size="large"
              />
            </View>
          ) : null}

          {this.state.isTouchedScreen && (
            <View
              style={[
                vStyles.toolBarStyle,
                {
                  bottom:
                    Platform.OS === "ios" && (isIphoneX() || isIphoneXsMax())
                      ? 40
                      : orientation !== "PORTRAIT"
                      ? 0
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
                  onSlidingComplete={value => {
                    this.player.seek(value);
                  }}
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
          )}
        </TouchableOpacity>
      </Modal>
    );
  };

  render() {
    const { width, height } = this.props;
    const { orientation, movieInfo, videoModalVisible } = this.state;
    const { url, title } = movieInfo;
    console.log("render video", url);
    const videoWidth = width || "100%",
      videoHeight = height ? height : 180;
    return (
      <View
        style={{
          ...vStyles.mainContainer,
          width: videoWidth,
          height: videoHeight
        }}
      >
        {url && url !== "" ? (
          <Fragment>
            <TouchableOpacity
              onPress={() => {
                this.handleShowVideoModal(true);
              }}
              style={{
                width: "100%",
                height: "100%"
              }}
            >
              <Video
                // source={{
                //   uri:
                //     "https://vd2.bdstatic.com/mda-jfff1srbcqxqkxeh/sc/mda-jfff1srbcqxqkxeh.mp4?auth_key=1562902805-0-0-789c96ab6e46ed0f5efd1beb6e9ccc46&bcevod_channel=searchbox_feed&pd=bjh&abtest=all"
                // }}
                source={{ uri: url }}
                ref={ref => (this.videoPreview = ref)}
                paused={true}
                resizeMode="contain" // 视频的自适应伸缩铺放行为，contain、stretch、cover
                onLoad={data => this.videoPreview.seek(1)}
                style={{
                  width: videoWidth,
                  height: videoHeight
                }}
              />
              <View
                style={{
                  width: "100%",
                  position: "absolute",
                  top: videoHeight / 2 - 20,
                  left: 0,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Icon name={"play-circle"} size={40} color="#ddd" />
              </View>
            </TouchableOpacity>
            {this.renderVideoPlayer()}
          </Fragment>
        ) : (
          <Text style={{ color: "#ccc" }}>Video not found</Text>
        )}
      </View>
    );
  }
}

const vStyles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center"
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
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
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(43,43,43,0.7)",
    position: "absolute",
    top: 20,
    left: 20
  },
  toolBarStyle: {
    width: "100%",
    height: 30,
    position: "absolute",
    bottom: 0,
    paddingHorizontal: 10,
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around"
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
    position: "absolute",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  navToolBar: {
    backgroundColor: "transparent",
    marginHorizontal: 5
  }
});
