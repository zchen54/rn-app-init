import {
  Dimensions,
  StatusBar,
  Platform,
  PixelRatio,
  NativeModules
} from "react-native";
import { PlatFormAndroid } from "../../env";

export const deviceWidth = Dimensions.get("window").width; //get device width
export const deviceHeight =
  Platform.OS === "ios"
    ? Dimensions.get("window").height
    : Dimensions.get("window").height / Dimensions.get("window").width > 1.8
    ? Dimensions.get("window").height + NativeModules.StatusBarManager.HEIGHT
    : Dimensions.get("window").height;

const defaultAndroidPixelRatio = 2.625, //default Android pixelRatio
  defaultIosPixelRatio = 3; //default IOS pixelRatio - iPhone 7P
let defaultPixelRatio = 1, //default Android pixelRatio
  dpStandardDeviceWidth = 0, // calculated standard devie indepent pixel
  scale = 1; // scale from standard device here to othere devices.

if (Platform.OS === PlatFormAndroid) {
  defaultPixelRatio = defaultAndroidPixelRatio;
} else {
  defaultPixelRatio = defaultIosPixelRatio;
}
dpStandardDeviceWidth = 1080 / defaultPixelRatio;
scale = deviceWidth / dpStandardDeviceWidth;
// //change px to dp
// const logicAndroidWidth = 1080 / defaultAndroidPixel;
// const androidScale = deviceWidth / logicAndroidWidth; //获取缩放比例

// const logicIosWidth = 1080 / defaultIosPixel;
// const iosScale = deviceWidth / logicIosWidth;
//size here is dp size

export function setSize(size: number) {
  return Math.round(size * scale);
}

export function setSizeWithPx(pxSize: number) {
  let dpSize = pxSize / defaultPixelRatio;
  return setSize(dpSize);
}

export const statusBarHeight = getStatusBarHeight();
export const safeAreaViewHeight = isIphoneX() ? 34 : 0;

//标题栏的高度
export const titleHeight = setSizeWithPx(120) + statusBarHeight;

//字体缩放比例，一般情况下不用考虑。
// 当应用中的字体需要根据手机设置中字体大小改变的话需要用到缩放比例
export const fontsScale = PixelRatio.getFontScale();

/**
 * 判断是否为iphoneX
 * @returns {boolean}
 */
export function isIphoneX() {
  const X_WIDTH = 375;
  const X_HEIGHT = 812;
  return (
    Platform.OS == "ios" && deviceHeight == X_HEIGHT && deviceWidth == X_WIDTH
  );
}

export function isIphoneXsMax() {
  const X_WIDTH = 414;
  const X_HEIGHT = 896;
  return (
    Platform.OS == "ios" && deviceHeight == X_HEIGHT && deviceWidth == X_WIDTH
  );
}

export const isFullScreen = () => {
  return Dimensions.get("window").height / Dimensions.get("window").width > 1.8;
};

//状态栏的高度
export function getStatusBarHeight() {
  if (Platform.OS == "android" && StatusBar.currentHeight) {
    return StatusBar.currentHeight;
  }
  if (isIphoneX()) {
    return 44;
  }
  if (isIphoneXsMax()) {
    return 44;
  }
  return 20;
}
