import React, {Component} from 'react';
import ImagePicker from 'react-native-image-picker';
import {StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import {Modal, Toast, Portal} from '@ant-design/react-native';
import Video from 'react-native-video';
import {DMoviePlayer} from './DMoviePlayer';
import {
  setSizeWithPx, // 设置字体 px 转 dp
  uploadVideo,
  API_v2,
  isNetworkConnected,
} from '../../common/utils';
import {ErrorMessage_Network_Offline} from '../../env';

const addImg = require('../../containers/images/template/Add-picture.png');
const deleteImg = require('../../containers/images/template/delete-gray.png');

interface State {
  selectVideoSource: string;
  uploadOrLocal: boolean;
}
interface Props {
  maxFiles?: number;
  source: string;
  durationLimit: number;
  handleSelect: any;
  authToken: string;
  isCollectData?: boolean;
}

export class MultipleVideoPicker extends Component<Props, State> {
  sourceArr: any = [];
  loadingToastKey: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      selectVideoSource: '',
      uploadOrLocal: false,
    };
    this.loadingToastKey = null;
  }

  componentWillUnmount() {
    Portal.remove(this.loadingToastKey);
    this.loadingToastKey = null;
  }

  //选择视频
  selectVideoTapped = () => {
    const {isCollectData} = this.props;
    isNetworkConnected()
      .then(isConnected => {
        if (isConnected) {
          this.handleSelectVideo(true);
        } else if (isCollectData) {
          this.handleSelectVideo(false);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  handleSelectVideo = (uploadOrLocal: boolean) => {
    const {durationLimit} = this.props;
    const options = {
      title: 'Choose Video',
      cancelButtonTitle: 'Cancel',
      takePhotoButtonTitle: 'Record video',
      chooseFromLibraryButtonTitle: 'Choose from Gallery',
      mediaType: 'video',
      durationLimit: durationLimit,
      videoQuality: 'low',
      storageOptions: {
        skipBackup: true,
        path: 'LcpVideos',
        cameraRoll: true,
        waitUntilSaved: true,
      },
    };

    ImagePicker.showImagePicker(options, (response: any) => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled video picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        this.setState({
          uploadOrLocal,
          selectVideoSource: response.uri,
        });
        this.loadingToastKey = Toast.loading('Loading...', 0);
      }
    });
  };

  onLoad = (data: any) => {
    const {authToken, durationLimit} = this.props;
    const {uploadOrLocal, selectVideoSource} = this.state;
    Portal.remove(this.loadingToastKey);
    console.log('load video success', data);
    // data.duration有几十毫秒的误差
    if (parseInt(data.duration) > durationLimit) {
      Modal.alert(
        'Select video failed',
        'The duration limit of the video is ' + durationLimit + 's',
        [
          {
            text: 'OK',
            onPress: () => {
              this.setState({
                selectVideoSource: '',
                uploadOrLocal: false,
              });
            },
          },
        ],
      );
    } else {
      if (uploadOrLocal) {
        uploadVideo(API_v2.uploadFile, [selectVideoSource], authToken).then(
          (res: any) => {
            console.log('Response =---- ', res);
            if (res.result === 'Success') {
              this.sourceArr.push(...res.data);
              this.props.handleSelect(this.sourceArr.join(','));
              this.setState({
                selectVideoSource: '',
                uploadOrLocal: false,
              });
            }
          },
        );
      } else {
        console.log('Response =---- ', selectVideoSource);
        this.sourceArr.push(selectVideoSource);
        this.props.handleSelect(this.sourceArr.join(','));
        this.setState({
          selectVideoSource: '',
          uploadOrLocal: false,
        });
      }
    }
  };

  onError = (data: any) => {
    Portal.remove(this.loadingToastKey);
    this.setState({
      selectVideoSource: '',
      uploadOrLocal: false,
    });
    Toast.fail('Select video error', 1);
    console.log('Select video error', data);
  };

  handleDeleteVideo = (index: number) => {
    this.sourceArr.splice(index, 1);
    this.props.handleSelect(this.sourceArr.join(','), null);
  };

  render() {
    const {source, maxFiles} = this.props;
    const {selectVideoSource} = this.state;

    this.sourceArr = !source ? [] : source.split(',');

    return (
      <View style={styles.container}>
        {this.sourceArr.map((item: any, index: number) => (
          <View style={styles.videoView} key={index}>
            <DMoviePlayer
              // source={require("./video.mp4")} // 视频的URL地址，或者本地地址
              source={item}
              width={setSizeWithPx(980)}
              height={setSizeWithPx(560)}
            />
            <TouchableOpacity
              key="newPicker"
              onPress={() => {
                this.handleDeleteVideo(index);
              }}
              style={styles.deleteBtn}>
              <Image style={styles.deleteIcon} source={deleteImg} />
            </TouchableOpacity>
          </View>
        ))}
        {!maxFiles || this.sourceArr.length < maxFiles ? (
          <TouchableOpacity
            onPress={this.selectVideoTapped.bind(this)}
            style={[styles.avatar, styles.avatarContainer]}>
            <Image style={styles.addIcon} source={addImg} />
          </TouchableOpacity>
        ) : null}
        {selectVideoSource !== '' ? (
          <Video
            source={{uri: selectVideoSource}}
            rate={0}
            paused={true}
            onLoad={this.onLoad}
            onError={this.onError}
          />
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // justifyContent: "center",
    // alignItems: "center",
  },
  avatarContainer: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
  },
  videoView: {
    width: setSizeWithPx(980),
    height: setSizeWithPx(560),
    marginBottom: 12,
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  avatar: {
    width: 64,
    height: 64,
  },
  addIcon: {
    width: setSizeWithPx(60),
    height: setSizeWithPx(60),
  },
  deleteBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  deleteIcon: {
    width: setSizeWithPx(60),
    height: setSizeWithPx(60),
  },
});
