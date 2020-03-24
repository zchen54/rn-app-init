import React, {Component} from 'react';
import ImagePicker from 'react-native-image-picker';
import {StyleSheet, View, TouchableOpacity, Image, Text} from 'react-native';
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

const addImg = require('../../containers/images/template/Add-picture.png');
const deleteImg = require('../../containers/images/template/delete-gray.png');
const rightIcon = require('../../containers/images/template/right_choose.png');

interface State {
  previewVisible: boolean;
  previewIndex: number;
  selectIndex: number;
  uploadOrLocal: boolean;
  imageUri: string;
  imageSize: number;
  previewWhenSelectVisible: boolean;
  selectFullImage: boolean;
}
interface Props {
  source: any;
  pickerStyle: any;
  handleSelect: any;
  authToken: string;
  isCollectData?: boolean;
}

export class DImagePicker extends Component<Props, State> {
  sourceArr: any = [];
  constructor(props: Props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewIndex: 0,
      selectIndex: 0,
      uploadOrLocal: false,
      imageUri: '',
      imageSize: 0,
      previewWhenSelectVisible: false,
      selectFullImage: false,
    };
  }

  //选择图片
  selectPhotoTapped = (index: any) => {
    const {isCollectData} = this.props;
    isNetworkConnected()
      .then(isConnected => {
        if (isConnected) {
          this.setState({selectIndex: index, uploadOrLocal: true});
          this.handleSelectImage();
        } else if (isCollectData) {
          this.setState({selectIndex: index, uploadOrLocal: false});
          this.handleSelectImage();
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  handleSelectImage = () => {
    const options = {
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
        path: 'Data2GoImages',
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
        this.setState({
          imageUri: response.uri,
          imageSize: response.fileSize,
          previewWhenSelectVisible: true,
        });
      }
    });
  };

  handleConfirm = () => {
    const {authToken} = this.props;
    const {
      selectIndex,
      uploadOrLocal,
      imageUri,
      imageSize,
      selectFullImage,
    } = this.state;
    const confirmFunction = (uri: string) => {
      if (uploadOrLocal) {
        uploadImage(API_v2.uploadFile, [uri], authToken).then((res: any) => {
          console.log('Server res ---> ', res);
          if (res.result === 'Success') {
            if (selectIndex >= 0) {
              this.sourceArr[selectIndex] = res.data[0];
            } else {
              this.sourceArr.push(res.data[0]);
            }
          }
          this.props.handleSelect(this.sourceArr.join(','));
          this.handleClosePreviewWhenSelect();
        });
      } else {
        if (selectIndex >= 0) {
          this.sourceArr[selectIndex] = uri;
        } else {
          this.sourceArr.push(uri);
        }
        this.props.handleSelect(this.sourceArr.join(','));
        this.handleClosePreviewWhenSelect();
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
  };

  handleFullImage = () => {
    const {imageSize, selectFullImage} = this.state;
    if (!selectFullImage && imageSize / 1024 / 1024 > 10) {
      Toast.fail('Images cannot be larger than 10M', 2, undefined, false);
    } else {
      this.setState(prevState => ({
        selectFullImage: !prevState.selectFullImage,
      }));
    }
  };

  handleClosePreviewWhenSelect = () => {
    this.setState({
      imageUri: '',
      imageSize: 0,
      previewWhenSelectVisible: false,
      selectFullImage: false,
    });
  };

  handleDeleteImage = (index: number) => {
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
          this.sourceArr.splice(index, 1);
          this.props.handleSelect(this.sourceArr.join(','), null);
        },
      },
    ]);
  };

  handlePreviewVisible = (visible: boolean, index: number) => {
    this.setState({previewVisible: visible, previewIndex: index || 0});
  };

  render() {
    const {
      previewVisible,
      previewIndex,
      imageSize,
      imageUri,
      previewWhenSelectVisible,
      selectFullImage,
    } = this.state;
    const {source, pickerStyle} = this.props;
    this.sourceArr = !source ? [] : source.split(',');
    const imageUrls = this.sourceArr.map((item: string) => ({url: item}));
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
              key="newPicker"
              onPress={() => {
                this.handleDeleteImage(index);
              }}
              style={styles.deleteBtn}>
              <Image style={styles.deleteIcon} source={deleteImg} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          key="newPicker"
          onPress={() => {
            this.selectPhotoTapped(-1);
          }}
          style={containerStyle}>
          <Image style={styles.addIcon} source={addImg} />
        </TouchableOpacity>
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
          visible={previewWhenSelectVisible}
          transparent={false}
          animationType="slide-up"
          onClose={this.handleClosePreviewWhenSelect}>
          <View
            style={{
              width: deviceWidth,
              height: deviceHeight,
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
                onPress={this.handleClosePreviewWhenSelect}
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
                  <View style={styles.fullImageBtnCircle}></View>
                )}
                <Text style={{fontSize: 14, color: '#fff'}}>
                  {selectFullImage
                    ? 'Full image (' + formatSize + ')'
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
