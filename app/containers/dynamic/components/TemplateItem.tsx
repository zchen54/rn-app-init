import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {
  setSize, // 设置宽高
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
  statusBarHeight,
  getIn,
  backgroundColorEnum,
} from '../../../common/utils';
import {DColors, DFontSize, FONT_FAMILY} from '../../../common/styles';
import moment from 'moment';

const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  titleColor: DColors.title,
  templateMargin: 8,
};

const Icon = {
  headerImageIcon: require('../../images/Me/Portrait.png'),
  d2gIcon: require('../../images/Me/about.png'),
};

interface Props {
  templateData: any;
  index: number;
  onPress: () => void;
  showCategory: boolean;
  category?: string;
  bgColor?: string;
}

export const TemplateItem = (props: Props) => {
  const {templateData, index, onPress, showCategory, category, bgColor} = props;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.templateItemWrapper,
        {
          backgroundColor: bgColor,
        },
      ]}>
      <View style={styles.creatorInfo}>
        <Image
          style={{width: 20, height: 20, borderRadius: 10}}
          source={Icon.d2gIcon}
        />
        <Text numberOfLines={1} style={styles.creatorText}>
          Sample
        </Text>
      </View>
      <View style={{flex: 1, marginTop: 8}}>
        <Text numberOfLines={2} style={styles.templateTitle}>
          {templateData.Name}
        </Text>
      </View>
      <Text numberOfLines={1} style={styles.infoText}>
        {showCategory && category ? category : ''}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  templateItemWrapper: {
    width: (deviceWidth - Page.templateMargin * 6) / 2,
    marginHorizontal: Page.templateMargin,
    marginBottom: Page.templateMargin * 2,
    borderRadius: 7,
    overflow: 'hidden',
    height: 100,
    padding: 10,
  },
  templateTitle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    lineHeight: 18,
    color: '#fff',
  },
  creatorInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  creatorText: {
    fontFamily: Page.font_family,
    fontSize: 14,
    marginLeft: 10,
    width: 100,
    color: '#fff',
  },
  infoText: {
    fontFamily: Page.font_family,
    fontSize: 12,
    color: '#fff',
    textAlign: 'right',
  },
});
