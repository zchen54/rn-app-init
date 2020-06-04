import React, {Component, useState, useEffect} from 'react';
import ImagePicker from 'react-native-image-picker';
import {StyleSheet, View, TouchableOpacity, Image, Text} from 'react-native';
import {Modal, Toast} from '@ant-design/react-native';
import {ImagePreview} from './ImagePreview';
import {
  setSizeWithPx,
  uploadImage,
  API_v2,
  setSize, // 设置宽高
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  isNetworkConnected,
  isFullScreen,
} from '../utils';
import {toastTips} from '../constants';
import {ErrorMessage_Network_Offline} from '../../env';
import ImageResizer from 'react-native-image-resizer';
import ImageViewer from 'react-native-image-zoom-viewer';
import {DColors, DFontSize, FONT_FAMILY} from '../styles';
import {store} from '../../store';
import {openImagePreview} from '../../store/actions';

const addImg = require('../../assets/images/template/Add-picture.png');
const deleteImg = require('../../assets/images/template/delete-gray.png');
const rightIcon = require('../../assets/images/template/right_choose.png');

interface Props {
  source: string;
  pickerStyle: any;
  handleSelect: (value: string) => void;
  authToken?: string;
}

export const SingleImagePicker = (props: Props) => {
  const {source, pickerStyle, handleSelect, authToken} = props;

  const [imageUri, setImageUri] = useState('');
  const [imageSize, setImageSize] = useState(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectFullImage, setSelectFullImage] = useState(false);
  let sourceArr: any = [];

  //选择图片
  function selectPhotoTapped(index: any) {
    isNetworkConnected()
      .then(isConnected => {
        if (isConnected) {
          handleSelectImage();
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  function handleSelectImage() {
    const options: any = {
      title: 'Choose Image',
      cancelButtonTitle: 'Cancel',
      takePhotoButtonTitle: 'Take Photo',
      chooseFromLibraryButtonTitle: 'Choose from Gallery',
      cameraType: 'back',
      mediaType: 'photo',
      // maxWidth: 300,
      // maxHeight: 300,
      quality: 1,
      // angle: 0,
      allowsEditing: false,
      noData: true,
      storageOptions: {
        skipBackup: true,
        path: 'LCPImages',
      },
    };
    ImagePicker.showImagePicker(options, (response: any) => {
      console.log('Image Picker Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        setImageUri(response.uri);
        setImageSize(response.fileSize);
        setConfirmVisible(true);
      }
    });
  }

  function handleConfirm() {
    const confirmFunction = (uri: string) => {
      if (authToken) {
        uploadImage(API_v2.uploadFile, [uri], authToken).then((res: any) => {
          console.log('Server res ---> ', res);
          if (res.result === 'Success') {
            sourceArr.push(res.data[0]);
          }
          handleSelect(sourceArr.join(','));
          handleClosePreviewWhenSelect();
        });
      } else {
        sourceArr.push(uri);
        handleSelect(sourceArr.join(','));
        handleClosePreviewWhenSelect();
      }
    };

    if (selectFullImage) {
      confirmFunction(imageUri);
    } else {
      ImageResizer.createResizedImage(imageUri, 3000, 3000, 'JPEG', 40)
        .then(response => {
          // response.uri is the URI of the new image that can now be displayed, uploaded...
          // response.path is the path of the new image
          // response.name is the name of the new image with the extension
          // response.size is the size of the new image
          console.log('ImageResizer---res---', response);
          confirmFunction(response.uri);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  function handleFullImage() {
    if (!selectFullImage && imageSize / 1024 / 1024 > 10) {
      Toast.fail('Images cannot be larger than 10M', 2, undefined, false);
    } else {
      setSelectFullImage(!selectFullImage);
    }
  }

  function handleClosePreviewWhenSelect() {
    setImageUri('');
    setImageSize(0);
    setConfirmVisible(false);
    setSelectFullImage(false);
  }

  function handleDeleteImage(index: number) {
    Modal.alert('Delete picture ' + (index + 1) + ' ?', '', [
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
          sourceArr.splice(index, 1);
          handleSelect(sourceArr.join(','), null);
        },
      },
    ]);
  }

  function handlePreviewImage(index: number) {
    const imageUrls = sourceArr.map((item: string) => ({url: item}));
    store.dispatch(openImagePreview(index, imageUrls));
  }

  sourceArr = !source ? [] : source.split(',');
  let containerStyle: any = [styles.avatarContainer, styles.avatar];
  if (pickerStyle) {
    containerStyle.push(pickerStyle);
  }
  let formatSize =
    Math.ceil(imageSize / 1024) > 1024
      ? Math.ceil((imageSize / 1024 / 1024) * 100) / 100 + 'M'
      : Math.ceil(imageSize / 1024) + 'K';

  return (
    <View style={styles.imagePickerList}>
      {sourceArr.map((item: any, index: number) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            handlePreviewImage(index);
          }}
          style={containerStyle}>
          {!item ? (
            <Image style={styles.addIcon} source={addImg} />
          ) : (
            <Image style={styles.avatar} source={{uri: item}} />
          )}
          <TouchableOpacity
            key="newPicker"
            onPress={() => {
              handleDeleteImage(index);
            }}
            style={styles.deleteBtn}>
            <Image style={styles.deleteIcon} source={deleteImg} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        key="newPicker"
        onPress={() => {
          selectPhotoTapped(-1);
        }}
        style={containerStyle}>
        <Image style={styles.addIcon} source={addImg} />
      </TouchableOpacity>
      <Modal
        popup
        visible={confirmVisible}
        transparent={false}
        animationType="slide-up"
        onClose={handleClosePreviewWhenSelect}>
        <View
          style={{
            width: deviceWidth,
            height: deviceHeight,
            backgroundColor: '#000',
          }}>
          <View style={styles.previewView}>
            {imageUri !== '' ? (
              <ImageViewer
                imageUrls={[{url: imageUri}]}
                saveToLocalByLongPress={false}
              />
            ) : null}
          </View>
          <View style={styles.controller}>
            <TouchableOpacity
              key="cancel"
              onPress={handleClosePreviewWhenSelect}
              style={styles.cancelBtn}>
              <Text style={{fontSize: 14, color: '#fff'}}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              key="fullImage"
              onPress={handleFullImage}
              style={styles.fullImageBtn}>
              {selectFullImage ? (
                <Image
                  style={{...styles.fullImageBtnCircle, borderWidth: 0}}
                  source={rightIcon}
                />
              ) : (
                <View style={styles.fullImageBtnCircle} />
              )}
              <Text style={{fontSize: 14, color: '#fff'}}>
                {selectFullImage
                  ? 'Full image (' + formatSize + ')'
                  : 'Full image'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              key="confirm"
              onPress={handleConfirm}
              style={styles.confirmBtn}>
              <Text style={{fontSize: 14, color: '#fff'}}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  imagePickerList: {
    // borderWidth: 1,
    // borderColor: DColors.mainColor,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: setSizeWithPx(-40),
  },
  avatarContainer: {
    borderRadius: 5,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: setSizeWithPx(42),
    marginTop: setSizeWithPx(42),
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
  previewView: {
    width: deviceWidth,
    height: isFullScreen() ? deviceHeight - 80 : deviceHeight - 50,
  },
  controller: {
    width: deviceWidth,
    height: 50,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0d0f10',
  },
  cancelBtn: {},
  fullImageBtn: {
    height: 28,
    paddingHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageBtnCircle: {
    width: 16,
    height: 16,
    marginRight: 6,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
  },
  confirmBtn: {
    height: 30,
    paddingHorizontal: 6,
    backgroundColor: DColors.mainColor,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
