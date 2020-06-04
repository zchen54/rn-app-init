import React, {Component, useState, useEffect} from 'react';
import ImagePicker from 'react-native-image-picker';
import {StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import {Modal, Toast, Portal} from '@ant-design/react-native';
import Video from 'react-native-video';
import {VideoPlayer} from './VideoPlayer';
import {
  setSizeWithPx, // 设置字体 px 转 dp
  uploadVideo,
  API_v2,
  isNetworkConnected,
} from '../utils';
import {ErrorMessage_Network_Offline} from '../../env';

const addImg = require('../../assets/images/template/Add-picture.png');
const deleteImg = require('../../assets/images/template/delete-gray.png');

interface Props {
  source: string;
  durationLimit: number;
  handleSelect: any;
  authToken: string;
}

export const VideoPicker = (props: Props) => {
  const {source, durationLimit, handleSelect, authToken} = props;
  const [selectVideoSource, setSelectVideoSource] = useState('');
  let loadingToastKey: any = null;

  useEffect(() => {
    return () => {
      loadingToastKey = null;
    };
  }, []);

  //选择视频
  function selectVideoTapped() {
    isNetworkConnected()
      .then(isConnected => {
        if (isConnected) {
          handleSelectVideo();
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  function handleSelectVideo() {
    const options: any = {
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
        setSelectVideoSource(response.uri);
        loadingToastKey = Toast.loading('Loading...', 0);
      }
    });
  }

  function onLoad(data: any) {
    Portal.remove(loadingToastKey);
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
              setSelectVideoSource('');
            },
          },
        ],
      );
    } else {
      uploadVideo(API_v2.uploadFile, [selectVideoSource], authToken).then(
        (res: any) => {
          console.log('Response =---- ', res);
          if (res.result === 'Success') {
            handleSelect(res.data[0]);
            setSelectVideoSource('');
          }
        },
      );
    }
  }

  function onError(data: any) {
    Portal.remove(loadingToastKey);
    setSelectVideoSource('');
    Toast.fail('Select video error', 1);
    console.log('Select video error', data);
  }

  function handleDeleteVideo() {
    Modal.alert('Delete video ?', '', [
      {
        text: 'Cancel',
        onPress: () => {
          console.log('cancel');
        },
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          handleSelect('', null);
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {source === '' ? (
        <TouchableOpacity
          onPress={selectVideoTapped}
          style={[styles.avatar, styles.avatarContainer]}>
          <Image style={styles.addIcon} source={addImg} />
        </TouchableOpacity>
      ) : (
        <View style={styles.videoView}>
          <VideoPlayer
            // source={require("./video.mp4")} // 视频的URL地址，或者本地地址
            source={source}
            width={setSizeWithPx(980)}
            height={setSizeWithPx(560)}
          />
          <TouchableOpacity
            key="newPicker"
            onPress={handleDeleteVideo}
            style={styles.deleteBtn}>
            <Image style={styles.deleteIcon} source={deleteImg} />
          </TouchableOpacity>
        </View>
      )}
      {selectVideoSource !== '' ? (
        <Video
          source={{uri: selectVideoSource}}
          rate={0}
          paused={true}
          onLoad={onLoad}
          onError={onError}
        />
      ) : null}
    </View>
  );
};

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
