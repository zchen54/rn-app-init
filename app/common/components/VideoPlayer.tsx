import React, {Component, Fragment, useRef, useState, useEffect} from 'react';
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
  NativeModules,
} from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import {Toast, Icon, Modal} from '@ant-design/react-native';
import {DColors, DFontSize, FONT_FAMILY} from '../styles';
import {deviceWidth, deviceHeight, isIphoneX, isIphoneXsMax} from '../utils';
import {PlatFormAndroid, PlatFormIOS} from '../../env';

interface Props {
  source: any;
  width?: number;
  height?: number;
}

const initVideoInfo: any = {};
const initOrientation: any = null;

export const VideoPlayer = (props: Props) => {
  const {source, width, height} = props;
  const playerRef: any = useRef(null);
  const videoPreviewRef: any = useRef(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [slideValue, setSlideValue] = useState(0.0);
  const [currentTime, setCurrentTime] = useState(0.0);
  const [duration, setDuration] = useState(0.0);
  const [paused, setPaused] = useState(false);
  const [playIcon, setPlayIcon] = useState('pause');
  const [isTouchedScreen, setIsTouchedScreen] = useState(true);
  const [loadingVisible, setLoadingVisible] = useState(true);
  const [videoInfo, setVideoInfo] = useState(initVideoInfo);
  const [orientation, setOrientation] = useState(initOrientation);
  const [specificOrientation, setSpecificOrientation] = useState(
    initOrientation,
  );

  useEffect(() => {
    const init = Orientation.getInitialOrientation();
    setOrientation(init);
    setSpecificOrientation(init);
    handleInitialState();
    Orientation.addOrientationListener(_updateOrientation);
    Orientation.addSpecificOrientationListener(_updateSpecificOrientation);
    return () => {
      Orientation.removeOrientationListener(_updateOrientation);
      Orientation.removeSpecificOrientationListener(_updateSpecificOrientation);
    };
  }, []);

  function handleInitialState() {
    setVideoInfo({
      url: source,
      title: source,
    });
  }

  function _updateOrientation(orientationRes: any) {
    setOrientation(orientationRes);
  }
  function _updateSpecificOrientation(specificOrientationRes: any) {
    setSpecificOrientation(specificOrientationRes);
  }

  function loadStart() {
    console.log('loadStart');
  }

  function updateDuration(durationRes: any) {
    setDuration(durationRes.duration);
  }

  function setTime(data: any) {
    let newSliderValue = parseInt(currentTime + '');
    setSlideValue(newSliderValue);
    setCurrentTime(data.currentTime);
    setLoadingVisible(currentTime === data.currentTime);
  }

  function onEnd() {
    if (playerRef && playerRef.current) {
      playerRef.current.seek(0);
    }
    setSlideValue(0.0);
    setCurrentTime(0.0);
    setPlayIcon(paused ? 'pause' : 'caret-right');
    setPaused(!paused);
  }

  function videoError(error: any) {
    Toast.fail('VideoPlayer error !');
    setLoadingVisible(false);
  }

  function onBuffer() {
    console.log('onBuffer');
  }

  function onTimedMetadata() {
    console.log('onTimedMetadata');
  }

  function formatMediaTime(duration: any) {
    let min: any = Math.floor(duration / 60);
    let second: any = duration - min * 60;
    min = min >= 10 ? min : '0' + min;
    second = second >= 10 ? second : '0' + second;
    return min + ':' + second;
  }

  function play() {
    setPlayIcon(paused ? 'pause' : 'caret-right');
    setPaused(!paused);
  }

  function handleShowVideoModal(visible: boolean) {
    setVideoModalVisible(visible);
    if (visible) {
      if (Platform.OS === PlatFormAndroid) {
        StatusBar.setBackgroundColor('rgba(0,0,0,1)', true);
        StatusBar.setBarStyle('light-content', true);
      }
      setLoadingVisible(true);
      if (paused) {
        play();
      }
    } else {
      if (Platform.OS === PlatFormAndroid) {
        StatusBar.setBackgroundColor('rgba(0,0,0,0)', true);
        StatusBar.setBarStyle('light-content', true);
      }
      onEnd();
    }
  }

  const renderVideoPlayer = () => {
    const {url, title} = videoInfo;
    let mainHeight = deviceHeight;
    const playIconName: any = playIcon;
    if (Platform.OS === PlatFormAndroid) {
      mainHeight =
        orientation === 'PORTRAIT'
          ? deviceHeight - NativeModules.StatusBarManager.HEIGHT
          : deviceWidth - NativeModules.StatusBarManager.HEIGHT;
    } else {
      mainHeight = orientation === 'PORTRAIT' ? deviceHeight : deviceWidth;
    }
    return (
      <Modal
        popup
        transparent={false}
        visible={videoModalVisible}
        animationType="slide-up"
        onClose={() => {}}>
        <TouchableOpacity
          style={[
            vStyles.videoContainer,
            {
              height: mainHeight,
            },
          ]}
          onPress={() => setIsTouchedScreen(!isTouchedScreen)}>
          <Video
            // source={{
            //   uri:
            //     "https://vd2.bdstatic.com/mda-jfff1srbcqxqkxeh/sc/mda-jfff1srbcqxqkxeh.mp4?auth_key=1562902805-0-0-789c96ab6e46ed0f5efd1beb6e9ccc46&bcevod_channel=searchbox_feed&pd=bjh&abtest=all"
            // }}
            source={{uri: url}}
            ref={playerRef}
            rate={paused ? 0 : rate} // 控制暂停/播放，0 代表暂停paused, 1代表播放normal.
            volume={1.0} // 声音的放声音的放大倍数大倍数，0 为静音  ，1 为正常音量 ，更大的数字表示放大的倍数
            muted={false} // true代表静音，默认为false.
            paused={paused} // true代表暂停，默认为false
            resizeMode="contain" // 视频的自适应伸缩铺放行为，contain、stretch、cover
            repeat={false} // 是否重复播放
            playInBackground={false} // 当app转到后台运行的时候，播放是否暂停
            playWhenInactive={false} // [iOS] Video continues to play when control or notification center are shown. 仅适用于IOS
            ignoreSilentSwitch={'ignore'}
            progressUpdateInterval={250.0}
            onLoadStart={loadStart} // 当视频开始加载时的回调函数
            onLoad={data => updateDuration(data)} // 当视频加载完毕时的回调函数
            onProgress={data => setTime(data)} // 进度控制，每250ms调用一次，以获取视频播放的进度
            onEnd={() => {
              onEnd();
            }} // 当视频播放完毕后的回调函数
            onError={data => videoError(data)} // 当视频不能加载，或出错后的回调函数
            onBuffer={onBuffer}
            onTimedMetadata={onTimedMetadata}
            style={[vStyles.videoPlayer]}
          />

          {isTouchedScreen && (
            <TouchableOpacity
              style={
                Platform.OS === PlatFormIOS
                  ? {...vStyles.closeButton, top: 50}
                  : vStyles.closeButton
              }
              onPress={() => {
                Orientation.lockToPortrait();
                handleShowVideoModal(false);
              }}>
              <Icon name="close" size={18} color="#fff" />
            </TouchableOpacity>
          )}

          {loadingVisible ? (
            <View style={vStyles.indicator}>
              <ActivityIndicator
                animating={true}
                color={DColors.mainColor}
                size="large"
              />
            </View>
          ) : null}

          {isTouchedScreen && (
            <View
              style={[
                vStyles.toolBarStyle,
                {
                  bottom:
                    Platform.OS === 'ios' && (isIphoneX() || isIphoneXsMax())
                      ? 40
                      : orientation !== 'PORTRAIT'
                      ? 0
                      : 0,
                },
              ]}>
              <TouchableOpacity onPress={() => play()}>
                <Icon name={playIconName} size={18} color="#fff" />
              </TouchableOpacity>
              <View style={vStyles.progressStyle}>
                <Text style={vStyles.timeStyle}>
                  {formatMediaTime(Math.floor(currentTime))}
                </Text>
                <Slider
                  style={vStyles.slider}
                  value={slideValue}
                  maximumValue={duration}
                  minimumTrackTintColor={DColors.mainColor}
                  maximumTrackTintColor={DColors.auxiliaryGray}
                  step={1}
                  onValueChange={value => setCurrentTime(value)}
                  onSlidingComplete={value => {
                    playerRef.current.seek(value);
                  }}
                />
                <Text style={vStyles.timeStyle}>
                  {formatMediaTime(Math.floor(duration))}
                </Text>
              </View>
              {orientation === 'PORTRAIT' ? (
                <TouchableOpacity onPress={Orientation.lockToLandscapeLeft}>
                  <Icon name={'arrows-alt'} size={18} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={Orientation.lockToPortrait}>
                  <Icon name={'shrink'} size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    );
  };

  const {url, title} = videoInfo;
  console.log('render video', url);
  const videoWidth = width || '100%',
    videoHeight = height ? height : 180;
  return (
    <View
      style={{
        ...vStyles.mainContainer,
        width: videoWidth,
        height: videoHeight,
      }}>
      {url && url !== '' ? (
        <Fragment>
          <TouchableOpacity
            onPress={() => {
              handleShowVideoModal(true);
            }}
            style={{
              width: '100%',
              height: '100%',
            }}>
            <Video
              // source={{
              //   uri:
              //     "https://vd2.bdstatic.com/mda-jfff1srbcqxqkxeh/sc/mda-jfff1srbcqxqkxeh.mp4?auth_key=1562902805-0-0-789c96ab6e46ed0f5efd1beb6e9ccc46&bcevod_channel=searchbox_feed&pd=bjh&abtest=all"
              // }}
              source={{uri: url}}
              ref={videoPreviewRef}
              paused={true}
              resizeMode="contain" // 视频的自适应伸缩铺放行为，contain、stretch、cover
              onLoad={data => videoPreviewRef.current.seek(1)}
              style={{
                width: videoWidth,
                height: videoHeight,
              }}
            />
            <View
              style={{
                width: '100%',
                position: 'absolute',
                top: videoHeight / 2 - 20,
                left: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon name={'play-circle'} size={40} color="#ddd" />
            </View>
          </TouchableOpacity>
          {renderVideoPlayer()}
        </Fragment>
      ) : (
        <Text style={{color: '#ccc'}}>Video not found</Text>
      )}
    </View>
  );
};

const vStyles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
  },
  videoPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  navContentStyle: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#000',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(43,43,43,0.7)',
    position: 'absolute',
    top: 20,
    left: 20,
  },
  toolBarStyle: {
    width: '100%',
    height: 30,
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 10,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  timeStyle: {
    minWidth: 40,
    color: '#fff',
    fontSize: 12,
  },
  slider: {
    flex: 1,
    marginHorizontal: 5,
    height: 20,
  },
  progressStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 10,
  },
  indicator: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navToolBar: {
    backgroundColor: 'transparent',
    marginHorizontal: 5,
  },
});
