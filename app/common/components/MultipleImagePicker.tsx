import React, {Component} from 'react';
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
import {DImagePreview} from './DImagePreview';
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
import {PlatFormAndroid} from '../../env';

const addImg = require('../../assets/images/template/Add-picture.png');
const deleteImg = require('../../assets/images/template/delete-gray.png');
const rightIcon = require('../../assets/images/template/right_choose.png');

interface SelectedImages {
  path: string;
  size: number;
  uploading: boolean;
}

interface State {
  actionSheetVisible: boolean; // 选择拍照或相册
  previewVisible: boolean; // 预览已选图片
  previewIndex: number; // 预览序号
  uploadOrLocal: boolean; // 是否联网上传
  previewAfterSelect: boolean; // 选择后预览
  selectedImages: Array<SelectedImages>; // 待处理的图片
  selectFullImage: boolean;
  isBusy: boolean; // 正在处理图片
}
interface Props {
  source: any;
  pickerStyle: any;
  handleSelect: any;
  multiple?: boolean;
  maxFiles?: number;
  authToken: string;
  isCollectData?: boolean;
}

export class MultipleImagePicker extends Component<Props, State> {
  sourceArr: any = [];
  constructor(props: Props) {
    super(props);
    this.state = {
      actionSheetVisible: false,
      previewVisible: false,
      previewIndex: 0,
      uploadOrLocal: false,
      previewAfterSelect: false,
      selectedImages: [],
      selectFullImage: false,
      isBusy: false,
    };
  }

  //选择图片
  selectPhoto = (type: 'Camera' | 'Gallery') => {
    const {isCollectData} = this.props;
    isNetworkConnected()
      .then(isConnected => {
        if (isConnected || isCollectData) {
          this.setState({
            uploadOrLocal: isConnected ? true : false,
            actionSheetVisible: false,
          });
          if (type === 'Camera') {
            this.selectFromCamera();
          } else if (type === 'Gallery') {
            this.selectFromGallery();
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  selectFromCamera = () => {
    ImagePicker.openCamera({
      mediaType: 'photo',
    }).then(image => {
      this.selectFulfilled(image);
    });
  };

  selectFromGallery = () => {
    const {multiple, maxFiles} = this.props;
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: multiple ? true : false,
      maxFiles: maxFiles || 1,
    }).then(images => {
      this.selectFulfilled(images);
    });
  };

  selectFulfilled = (images: any) => {
    console.log('selectFulfilled', images);
    const {maxFiles} = this.props;
    const formatImageObj = (image: any) => {
      let imageObj: SelectedImages = {
        path: image.path,
        size: image.size,
        uploading: false,
      };
      return imageObj;
    };

    let selectedImages: Array<SelectedImages> = [];
    if (Array.isArray(images)) {
      if (maxFiles && images.length + this.sourceArr.length > maxFiles) {
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
      selectedImages = images.map((item: any) => formatImageObj(item));
    } else {
      selectedImages.push(formatImageObj(images));
    }
    this.setState({selectedImages, previewAfterSelect: true});
  };

  handleFullImage = () => {
    const {selectedImages, selectFullImage} = this.state;
    const invalidSize = selectedImages.some(
      (image: SelectedImages) =>
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
      this.setState(prevState => ({
        ...prevState,
        selectFullImage: !prevState.selectFullImage,
      }));
    }
  };

  handleConfirm = () => {
    const {selectFullImage, selectedImages} = this.state;

    if (selectFullImage) {
      let uris = selectedImages.map((image: SelectedImages) => image.path);
      this.uploadImages(uris);
    } else {
      let promises = selectedImages.map((image: SelectedImages) => {
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
            this.uploadImages(uris);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  uploadImages = (uris: string[]) => {
    const {authToken} = this.props;
    const {uploadOrLocal} = this.state;
    if (uploadOrLocal) {
      uploadImage(API_v2.uploadFile, uris, authToken).then((res: any) => {
        console.log('Server res ---> ', res);
        if (res.result === 'Success' && Array.isArray(res.data)) {
          this.sourceArr.push(...res.data);
          this.props.handleSelect(this.sourceArr.join(','));
        }
        this.handleCancelSelect();
      });
    } else {
      this.sourceArr.push(uris);
      this.props.handleSelect(this.sourceArr.join(','));
      this.handleCancelSelect();
    }
  };

  handleCancelSelect = () => {
    this.setState({
      selectedImages: [],
      previewAfterSelect: false,
    });
  };

  handleDeleteImage = (index: number) => {
    this.sourceArr.splice(index, 1);
    this.props.handleSelect(this.sourceArr.join(','), null);
  };

  handlePreviewVisible = (visible: boolean, index: number) => {
    this.setState({previewVisible: visible, previewIndex: index || 0});
  };

  render() {
    const {
      previewVisible,
      previewIndex,
      previewAfterSelect,
      selectFullImage,
      actionSheetVisible,
      isBusy,
      selectedImages,
    } = this.state;
    const {source, pickerStyle, maxFiles} = this.props;

    this.sourceArr = !source ? [] : source.split(',');
    const imageUrls = this.sourceArr.map((item: string) => ({url: item}));
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
    const selectedFulfilledUrls = selectedImages.map(
      (image: SelectedImages) => {
        selectedFullSize += image.size;
        return {url: image.path};
      },
    );

    // 选择来源
    const controllers = [
      {
        text: 'Take Photo',
        onPress: () => {
          this.selectPhoto('Camera');
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: () => {
          this.selectPhoto('Gallery');
        },
      },
    ];

    return (
      <View style={styles.imagePickerList}>
        {this.sourceArr.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              this.handlePreviewVisible(true, index);
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
                this.handleDeleteImage(index);
              }}
              style={styles.deleteBtn}>
              <Image style={styles.deleteIcon} source={deleteImg} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        {!maxFiles || this.sourceArr.length < maxFiles ? (
          <TouchableOpacity
            key="newPicker"
            disabled={isBusy}
            onPress={() => {
              this.setState({actionSheetVisible: true});
            }}
            style={containerStyle}>
            <Image style={styles.addIcon} source={addImg} />
          </TouchableOpacity>
        ) : null}
        <DImagePreview
          visible={previewVisible}
          imageUrls={imageUrls}
          index={previewIndex}
          handleClose={() => {
            this.handlePreviewVisible(false, 0);
          }}
        />
        <Modal
          popup
          visible={previewAfterSelect}
          transparent={false}
          animationType="slide-up"
          onClose={this.handleCancelSelect}>
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
                onPress={this.handleCancelSelect}
                style={styles.cancelBtn}>
                <Text style={{fontSize: 14, color: '#fff'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                key="fullImage"
                onPress={this.handleFullImage}
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
                onPress={this.handleConfirm}
                style={styles.confirmBtn}>
                <Text style={{fontSize: 14, color: '#fff'}}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <ActionSheet
          visible={actionSheetVisible}
          onClose={() => {
            this.setState({actionSheetVisible: false});
          }}
          actions={controllers}
        />
      </View>
    );
  }
}

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
