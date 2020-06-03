import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import SignatureCapture from 'react-native-signature-capture';
import {
  Button,
  Modal,
  WhiteSpace,
  WingBlank,
  Toast,
  Provider,
} from '@ant-design/react-native';
import Orientation from 'react-native-orientation';
import {DColors, DFontSize, FONT_FAMILY} from '../styles';
import {
  statusBarHeight,
  setSize, // 设置宽高
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
} from '../utils';

const deleteImg = require('../../assets/images/template/delete-gray.png');

interface State {
  signature: string;
  modalVisible: boolean;
}
interface Props {
  source: string;
}
export class SignatureDemo extends React.Component<Props, State> {
  SignatureDom: any;
  constructor(props: Props) {
    super(props);
    this.state = {signature: '', modalVisible: false};
  }

  componentWillMount() {
    Orientation.lockToPortrait();
  }

  handleOpen = () => {
    this.setState({modalVisible: true});
    Orientation.lockToLandscape();
  };

  handleClose = () => {
    this.setState({
      modalVisible: false,
    });
    Orientation.lockToPortrait();
  };

  handleDelete = () => {
    Modal.alert('Delete signature ?', '', [
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
          this.setState({signature: ''});
          // this.props.handleSelect("", null);
        },
      },
    ]);
  };

  saveSign = () => {
    this.SignatureDom.saveImage();
  };

  resetSign = () => {
    this.SignatureDom.resetImage();
  };

  _onSaveEvent = (result: any) => {
    //result.encoded - for the base64 encoded png
    //result.pathName - for the file path name
    console.log(result);
    this.setState({signature: 'file://' + result.pathName});
    this.handleClose();
  };
  _onDragEvent = () => {
    // This callback will be called when the user enters signature
    // console.log("dragged");
  };

  render() {
    const {modalVisible, signature} = this.state;
    // const { source } = this.props;
    const source = signature;
    console.log('render signature', source, deviceWidth, deviceHeight);
    return (
      <View style={styles.container}>
        {!signature || signature === '' ? (
          <TouchableOpacity
            style={styles.defaultView}
            onPress={this.handleOpen}>
            <Text>Click here to sign</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.signatureView}>
            <Image
              style={styles.signatureImage}
              source={{
                uri: source,
              }}
            />
            <TouchableOpacity
              key="newPicker"
              onPress={() => {
                this.handleDelete();
              }}
              style={styles.deleteBtn}>
              <Image style={styles.deleteIcon} source={deleteImg} />
            </TouchableOpacity>
          </View>
        )}
        <Modal
          transparent={false}
          visible={modalVisible}
          animationType="slide-up"
          onClose={this.handleClose}>
          <View style={styles.signatureWrap}>
            <Text
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}>
              Please sign below
            </Text>
            <View style={styles.signature}>
              <SignatureCapture
                ref={(dom: any) => {
                  this.SignatureDom = dom;
                }}
                style={{flex: 1}}
                onSaveEvent={this._onSaveEvent}
                onDragEvent={this._onDragEvent}
                showBorder={true} // 是否显示虚线边框（边框仅在iOS上显示）
                saveImageFileInExtStorage={true} // 将图像文件保存在外部存储中
                showNativeButtons={false} // 是否显示本机按钮“Save”和“Reset”
                showTitleLabel={false} // 是否显示“x_ _ _ _ _ _ _ _ _ _”占位符，指示要签名的位置
                // viewMode={"landscape"} // 'portrait' | 'landscape' 设置屏幕方向
                // maxSize ：设置图像的最大尺寸保持纵横比，默认为500
              />
            </View>
            <View style={{flexDirection: 'row'}}>
              <Button style={styles.buttonStyle} onPress={this.saveSign}>
                <Text>Save</Text>
              </Button>
              <Button style={styles.buttonStyle} onPress={this.resetSign}>
                <Text>Reset</Text>
              </Button>
              <Button style={styles.buttonStyle} onPress={this.handleClose}>
                <Text>Exit</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'red',
    borderWidth: 1,
  },
  defaultView: {
    width: setSizeWithPx(980),
    height: setSizeWithPx(560),
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'green',
    borderWidth: 1,
  },
  signatureView: {
    width: setSizeWithPx(980),
    height: setSizeWithPx(560),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderColor: 'green',
    borderWidth: 1,
  },
  signatureImage: {
    width: setSizeWithPx(960),
    height: setSizeWithPx(500),
  },
  signature: {
    flex: 1,
    borderColor: '#333',
    borderWidth: 1,
  },
  signatureWrap: {
    width: deviceHeight,
    height: deviceWidth,
    paddingBottom: 30,
  },
  buttonStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#f2f2f2',
    margin: 10,
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
