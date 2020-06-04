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
} from '../../common/utils';
import {ErrorMessage_Network_Offline} from '../../env';

const addImg = require('../../assets/images/template/Add-picture.png');
const deleteImg = require('../../assets/images/template/delete-gray.png');

interface Props {
  maxFiles?: number;
  source: string;
  durationLimit: number;
  handleSelect: any;
  authToken: string;
  isCollectData?: boolean;
}

export const MultipleVideoPicker = (props: Props) => {
  const {maxFiles, source, durationLimit, handleSelect, authToken} = props;
  const [selectVideoSource, setSelectVideoSource] = useState('');
  let loadingToastKey: any = null;
  let sourceArr: any = [];

  useEffect(() => {
    return () => {
      loadingToastKey = null;
      sourceArr = [];
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
            sourceArr.push(...res.data);
            handleSelect(sourceArr.join(','));
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

  function handleDeleteVideo(index: number) {
    sourceArr.splice(index, 1);
    handleSelect(sourceArr.join(','), null);
  }

  sourceArr = !source ? [] : source.split(',');

  return (
    <View style={styles.container}>
      {sourceArr.map((item: any, index: number) => (
        <View style={styles.videoView} key={index}>
          <VideoPlayer
            // source={require("./video.mp4")} // 视频的URL地址，或者本地地址
            source={item}
            width={setSizeWithPx(980)}
            height={setSizeWithPx(560)}
          />
          <TouchableOpacity
            key="newPicker"
            onPress={() => {
              handleDeleteVideo(index);
            }}
            style={styles.deleteBtn}>
            <Image style={styles.deleteIcon} source={deleteImg} />
          </TouchableOpacity>
        </View>
      ))}
      {!maxFiles || sourceArr.length < maxFiles ? (
        <TouchableOpacity
          onPress={selectVideoTapped}
          style={[styles.avatar, styles.avatarContainer]}>
          <Image style={styles.addIcon} source={addImg} />
        </TouchableOpacity>
      ) : null}
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
