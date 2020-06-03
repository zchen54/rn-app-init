import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  StatusBar,
  TouchableWithoutFeedback,
  FlatList,
  ImageBackground,
  Modal as ReactModal,
  TextStyle,
} from 'react-native';
import {DColors, DFontSize, FONT_FAMILY} from '../../common/styles';
import {
  setSize, // 设置宽高
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  statusBarHeight,
  titleHeight,
  setSizeWithPx, // 设置字体 px 转 dp
} from '../../common/utils';
import {NetworkStateBar} from './NetworkStateBar';

const backIcon = require('../../assets/images/template/Back.png');

interface TabType {
  title: string;
  key: number;
}

interface Props {
  navigation: any;
  tabs: Array<TabType>;
  currentTabKey: number;
  handleTabChange: (currentTab: number) => void;
}

export const TitleBarWithTabs = (props: Props) => {
  const {navigation, tabs, currentTabKey, handleTabChange} = props;

  const renderTabs = () => {
    const moreThanOne = tabs.length > 1;
    return tabs.map((item: TabType) => (
      <TouchableWithoutFeedback
        key={item.key}
        onPress={() => handleTabChange(item.key)}>
        <View style={styles.tabStyle}>
          <Text
            style={
              currentTabKey === item.key
                ? styles.tabTextStyle
                : {
                    ...styles.tabTextStyle,
                    color: '#E6E6E6',
                    fontSize: 12,
                  }
            }>
            {item.title === 'Template' || item.title === 'Data' ? (
              <Text style={{fontSize: 18}}>{item.title}</Text>
            ) : (
              item.title
            )}
          </Text>
          {moreThanOne ? (
            currentTabKey === item.key ? (
              <View style={styles.underLineStyle} />
            ) : (
              <View
                style={{
                  ...styles.underLineStyle,
                  backgroundColor: DColors.mainColor,
                }}
              />
            )
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    ));
  };

  return (
    <View>
      <View style={styles.tabWrapper}>
        <TouchableWithoutFeedback
          onPress={() => {
            navigation.goBack();
          }}>
          <View
            style={[
              styles.imageWrapper,
              {justifyContent: 'flex-start', paddingLeft: 14},
            ]}>
            <Image style={styles.imageStyle} source={backIcon} />
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.tabsStyle}>{renderTabs()}</View>
        <View style={styles.imageWrapper} />
      </View>
      <NetworkStateBar />
    </View>
  );
};

const styles = StyleSheet.create({
  tabWrapper: {
    flexDirection: 'row',
    width: deviceWidth,
    height: 48 + statusBarHeight,
    backgroundColor: DColors.mainColor,
    paddingTop: statusBarHeight,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabsStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: deviceWidth - 70 * 2,
    height: 48,
  },
  tabStyle: {
    width: (deviceWidth - 70 * 2) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabTextStyle: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: '#FFFFFF',
  },
  underLineStyle: {
    width: 40,
    height: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  imageWrapper: {
    width: 54,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageStyle: {
    resizeMode: 'contain',
    tintColor: '#fff',
  },
});
