import { Dimensions, StatusBar, Platform, PixelRatio } from "react-native";
import { PlatFormAndroid } from "../../env";
import { setSizeWithPx, setSize } from "../utils";

// Font Definitions
export const DFontSize = {
  h1: setSizeWithPx(60), // 标题
  c1: setSizeWithPx(50), // 内容/辅助
  a1: setSizeWithPx(30), // 辅助
  a2: setSizeWithPx(36), // 辅助
  a3: setSizeWithPx(42) // 辅助
};

const fontFamily =
  Platform.OS === PlatFormAndroid ? "Roboto" : "AppleSDGothicNeo-Regular";

export const FONT_FAMILY = fontFamily;

export const PAGE_SIZE = {
  left_width: setSizeWithPx(50), //页面所有离左边的距离
  nav_FOR_textSize: DFontSize.h1, //导航字体大小
  nav_FOR_rightWidth: setSizeWithPx(50) //导航新增或下一页按钮离右边的距离
};
