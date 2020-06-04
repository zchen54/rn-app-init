import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PixelRatio,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Button, Toast, Icon, Modal} from '@ant-design/react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import {DColors, DFontSize, FONT_FAMILY} from '../styles';
import {
  setSize, // 设置宽高
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
} from '../utils';

interface Props {
  visible: boolean;
  imageUrls: any;
  index: number;
  onClose: () => void;
}

export const ImagePreview = (props: Props) => {
  const {visible, imageUrls, index, onClose} = props;

  function handleSave(url: string) {
    console.log('save photo', url);
  }

  return (
    <View
      style={{
        padding: 10,
      }}>
      <Modal
        popup
        visible={visible}
        transparent={false}
        animationType="slide-up"
        onClose={onClose}>
        <View
          style={{
            width: deviceWidth,
            height: deviceHeight,
          }}>
          <ImageViewer
            imageUrls={imageUrls}
            index={index}
            enableSwipeDown={true}
            onSwipeDown={onClose}
            onClick={onClose}
            saveToLocalByLongPress={false}
          />
        </View>
      </Modal>
    </View>
  );
};
