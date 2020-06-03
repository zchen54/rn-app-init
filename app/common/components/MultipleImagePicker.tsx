import React, {Component, useState, useEffect} from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Platform,
} from 'react-native';
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
} from '../../common/utils';
import {toastTips} from '../constants';
import {ErrorMessage_Network_Offline} from '../../env';
import ImageResizer from 'react-native-image-resizer';
import ImageViewer from 'react-native-image-zoom-viewer';
import {DColors, DFontSize, FONT_FAMILY} from '../styles';
import {ActionSheet} from './ActionSheet';
import {store} from '../../store';
import {openActionSheet, openImagePreview} from '../../store/actions';
import {PlatFormAndroid} from '../../env';

const addImg = require('../../assets/images/template/Add-picture.png');
const deleteImg = require('../../assets/images/template/delete-gray.png');
const rightIcon = require('../../assets/images/template/right_choose.png');

interface SelectedImage {
  path: string;
  size: number;
  uploading: boolean;
}
const initSelectedImages: SelectedImage[] = [];

interface Props {
  source: any;
  pickerStyle: any;
  handleSelect: any;
  multiple?: boolean;
  maxFiles?: number;
  authToken: string;
}

export const MultipleImagePicker = (props: Props) => {
  const {
    source,
    pickerStyle,
    handleSelect,
    multiple,
    maxFiles,
    authToken,
  } = props;

  const [selectedImages, setSelectedImages] = useState(initSelectedImages);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectFullImage, setSelectFullImage] = useState(false);
  let sourceArr: any = [];

  //选择图片
  function selectPhoto(type: 'Camera' | 'Gallery') {
    isNetworkConnected()
      .then(isConnected => {
        if (isConnected) {
          if (type === 'Camera') {
            selectFromCamera();
          } else if (type === 'Gallery') {
            selectFromGallery();
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  function selectFromCamera() {
    ImagePicker.openCamera({
      mediaType: 'photo',
    }).then(image => {
      selectFulfilled(image);
    });
  }

  function selectFromGallery() {
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: multiple ? true : false,
      maxFiles: maxFiles || 1,
    }).then(images => {
      selectFulfilled(images);
    });
  }

  function selectFulfilled(images: any) {
    console.log('selectFulfilled', images);
    const formatImageObj = (image: any) => {
      let imageObj: SelectedImage = {
        path: image.path,
        size: image.size,
        uploading: false,
      };
      return imageObj;
    };

    let newSelectedImages: Array<SelectedImage> = [];
    if (Array.isArray(images)) {
      if (maxFiles && images.length + sourceArr.length > maxFiles) {
        Modal.alert(
          'Select picture failed',
          `A maximum of ${maxFiles} pictures can be uploaded`,
          [
            {
              text: 'OK',
              onPress: () => {},
            },
          ],
        );
        return;
      }
      newSelectedImages = images.map((item: any) => formatImageObj(item));
    } else {
      newSelectedImages.push(formatImageObj(images));
    }
    setSelectedImages(newSelectedImages);
    setConfirmVisible(true);
  }

  function handleFullImage() {
    const invalidSize = selectedImages.some(
      (image: SelectedImage) =>
        !selectFullImage && image.size / 1024 / 1024 > 10,
    );
    if (invalidSize) {
      Toast.fail(
        'The size of a single picture should not exceed 10M',
        2,
        undefined,
        false,
      );
    } else {
      setSelectFullImage(!selectFullImage);
    }
  }

  function handleConfirm() {
    if (selectFullImage) {
      let uris = selectedImages.map((image: SelectedImage) => image.path);
      uploadImages(uris);
    } else {
      let promises = selectedImages.map((image: SelectedImage) => {
        return ImageResizer.createResizedImage(
          image.path,
          3000,
          3000,
          'JPEG',
          40,
        );
      });
      Promise.all(promises)
        .then((responseArr: any) => {
          console.log('ImageResizer---res---', responseArr);
          if (Array.isArray(responseArr)) {
            let uris = responseArr.map((image: any) => image.uri);
            uploadImages(uris);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  function uploadImages(uris: string[]) {
    uploadImage(API_v2.uploadFile, uris, authToken).then((res: any) => {
      console.log('Server res ---> ', res);
      if (res.result === 'Success' && Array.isArray(res.data)) {
        sourceArr.push(...res.data);
        handleSelect(sourceArr.join(','));
      }
      handleCancelSelect();
    });
  }

  function handleCancelSelect() {
    setSelectedImages(initSelectedImages);
    setConfirmVisible(false);
  }

  function handleDeleteImage(index: number) {
    sourceArr.splice(index, 1);
    handleSelect(sourceArr.join(','), null);
  }

  function handlePreviewImage(index: number) {
    const imageUrls = sourceArr.map((item: string) => ({url: item}));
    store.dispatch(openImagePreview(index, imageUrls));
  }

  function handleOpenActionSheet() {
    // 选择来源
    const actions = [
      {
        text: 'Take Photo',
        onPress: () => {
          selectPhoto('Camera');
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: () => {
          selectPhoto('Gallery');
        },
      },
    ];
    store.dispatch(openActionSheet(actions));
  }

  sourceArr = !source ? [] : source.split(',');
  let containerStyle: any = [styles.avatarContainer, styles.avatar];
  if (pickerStyle) {
    containerStyle.push(pickerStyle);
  }

  const formatSize = (size: number) => {
    return Math.ceil(size / 1024) > 1024
      ? Math.ceil((size / 1024 / 1024) * 100) / 100 + 'M'
      : Math.ceil(size / 1024) + 'K';
  };

  // 上传前预处理
  let selectedFullSize = 0;
  const selectedFulfilledUrls = selectedImages.map((image: SelectedImage) => {
    selectedFullSize += image.size;
    return {url: image.path};
  });

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
            key="deleteImage"
            onPress={() => {
              handleDeleteImage(index);
            }}
            style={styles.deleteBtn}>
            <Image style={styles.deleteIcon} source={deleteImg} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
      {!maxFiles || sourceArr.length < maxFiles ? (
        <TouchableOpacity
          key="newPicker"
          onPress={handleOpenActionSheet}
          style={containerStyle}>
          <Image style={styles.addIcon} source={addImg} />
        </TouchableOpacity>
      ) : null}
      <Modal
        popup
        visible={confirmVisible}
        transparent={false}
        animationType="slide-up"
        onClose={handleCancelSelect}>
        <View
          style={{
            width: deviceWidth,
            height: deviceHeight,
          }}>
          <View style={styles.previewView}>
            {selectedFulfilledUrls.length ? (
              <ImageViewer
                imageUrls={selectedFulfilledUrls}
                saveToLocalByLongPress={false}
              />
            ) : null}
          </View>
          <View style={styles.controller}>
            <TouchableOpacity
              key="cancel"
              onPress={handleCancelSelect}
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
                  ? 'Full image (' + formatSize(selectedFullSize) + ')'
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
