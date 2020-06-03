import React, {Component} from 'react';
import {
  Text,
  View,
  Image,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
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

interface State {}
interface Props {
  title: string; // 标题
  navigation: any; // 导航器
  hideLeftArrow?: boolean; // 是否隐藏左侧的返回按钮
  pressLeft?: any; // 左侧按钮的点击事件
  pressRight?: any; // 右侧按钮的点击事件
  left?: string; // 左侧按钮文字
  backgroundColor?: string; // 背景色
  titleColor?: string; // 标题的文字颜色
  right?: any; // 右侧按钮的文字或者组件
  rightImage?: any; // 右侧按钮的图标
  leftImage?: any; // 左侧按钮的图片
  statusBarBgColor?: string; // 状态栏背景色
  barStyle?: any; // 状态栏样式
  middleStyle?: any; //标题样式
  isStatusBAr?: boolean; //是否存在statusbar
}

export class TitleBarNew extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  static defaultProps = {
    title: '',
    hideLeftArrow: false,
    pressRight: () => {},
  };

  back() {
    if (this.props.pressLeft) {
      this.props.pressLeft();
      return;
    }
    this.props.navigation.goBack();
  }

  render() {
    const {backgroundColor, titleColor, isStatusBAr} = this.props;
    // console.log(deviceWidth, deviceHeight, statusBarHeight);
    return (
      <View
        style={[
          TitleStyle.titleBar,
          backgroundColor ? {backgroundColor: backgroundColor} : null,
          isStatusBAr ? {minHeight: 48} : null,
        ]}>
        <StatusBar
          backgroundColor={this.props.statusBarBgColor || 'rgba(0,0,0,0)'}
          barStyle={this.props.barStyle || 'light-content'}
          // barStyle="dark-content"
          translucent={true}
        />
        {isStatusBAr ? null : <View style={TitleStyle.statusBar} />}

        <View style={TitleStyle.titleBarContent}>
          {this.props.hideLeftArrow ? (
            <View style={TitleStyle.left} />
          ) : (
            <TouchableOpacity
              activeOpacity={1}
              onPress={this.back.bind(this)}
              style={TitleStyle.left}>
              <Image
                style={
                  this.props.backgroundColor === '#FFFFFF'
                    ? {...TitleStyle.titleLeftImage, tintColor: '#1E9DFC'}
                    : TitleStyle.titleLeftImage
                }
                source={this.props.leftImage || backIcon}
              />
              <Text style={TitleStyle.leftText}>{this.props.left}</Text>
            </TouchableOpacity>
          )}
          <View style={{...TitleStyle.middle, ...this.props.middleStyle}}>
            <Text
              numberOfLines={1}
              style={[
                TitleStyle.middleTitle,
                titleColor ? {color: titleColor} : null,
              ]}>
              {this.props.title}
            </Text>
          </View>
          {this.renderRight()}
        </View>

        <NetworkStateBar />
      </View>
    );
  }

  renderRight() {
    if (!this.props.right && !this.props.rightImage) {
      return <View style={TitleStyle.right} />;
    }
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={TitleStyle.right}
        onPress={() => {
          this.props.pressRight();
        }}>
        {typeof this.props.right == 'object' ? (
          this.props.right
        ) : (
          <Text style={TitleStyle.rightText}>{this.props.right}</Text>
        )}
        {this.props.rightImage ? (
          <Image style={TitleStyle.rightImage} source={this.props.rightImage} />
        ) : null}
      </TouchableOpacity>
    );
  }
}

const TitleStyle = StyleSheet.create({
  titleBar: {
    width: deviceWidth,
    minHeight: statusBarHeight + 48,
    backgroundColor: DColors.mainColor,
  },
  titleBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: deviceWidth,
    height: titleHeight - statusBarHeight,
  },
  titleBarSearchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: deviceWidth,
    height: titleHeight - statusBarHeight,
  },

  searchLeftIcon: {
    width: setSize(30),
    height: setSize(38),
    resizeMode: 'stretch',
    marginLeft: setSize(24),
    marginRight: setSize(15),
  },
  searchLeftText: {
    width: setSize(140),
    fontSize: setSizeWithPx(30),
    color: '#ffffff',
  },

  searchBlock: {
    flexDirection: 'row',
    width: setSize(500),
    height: setSize(60),
    borderRadius: setSize(30),
    backgroundColor: 'white',
    alignItems: 'center',
    paddingLeft: setSize(30),
    paddingRight: setSize(30),
  },

  searchIcon: {
    width: setSize(40),
    height: setSize(40),
    resizeMode: 'stretch',
    marginRight: setSize(30),
  },

  searchBarInput: {
    width: setSize(350),
    height: setSize(60),
    fontSize: setSizeWithPx(30),
    backgroundColor: 'transparent',
    alignItems: 'center',
    margin: 0,
    padding: 0,
  },

  left: {
    width: 80,
    height: titleHeight - statusBarHeight,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 14,
  },
  middle: {
    minWidth: deviceWidth / 4,
    height: titleHeight - statusBarHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  right: {
    width: 80,
    height: titleHeight - statusBarHeight,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  leftText: {
    fontSize: setSizeWithPx(30),
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rightText: {
    fontSize: 16,
    color: '#FFFEFE',
    justifyContent: 'center',
  },
  rightImage: {
    marginLeft: setSize(5),
    width: 20,
    height: 19,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  titleLeftImage: {
    width: 20,
    height: 20,
    marginRight: setSize(5),
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },

  homeTitleIcon: {
    width: setSize(213),
    height: setSize(52),
    resizeMode: 'stretch',
  },
  titleRightDownloadImage: {
    width: setSize(65),
    height: setSize(65),
    resizeMode: 'contain',
  },
  statusBar: {
    width: deviceWidth,
    height: statusBarHeight,
    backgroundColor: 'transparent',
  },
});
