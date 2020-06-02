import { StyleSheet } from "react-native";
import { statusBarHeight, deviceWidth } from "../../common/utils";
import { FONT_FAMILY } from "../../common/styles";
export const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: "#F2F2F2"
  },
  searchWrapper: {
    width: "100%",
    height: 53 + statusBarHeight,
    flexDirection: "row",
    paddingLeft: 17,
    paddingRight: 17,
    paddingTop: statusBarHeight,
    backgroundColor: "#F2F2F2"
  },
  container: {
    flexDirection: "row",
    width: "100%",
    height: 53,
    alignItems: "center"
  },
  inputWrapper: {
    flexDirection: "row",
    width: deviceWidth - 100,
    height: 33,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 3
  },
  serachIconStyle: {
    width: 15,
    height: 15
  },
  inputStyle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    padding: 0,
    flex: 1,
    paddingLeft: 6
  },
  cancelStyle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    color: "#1E9DFC",
    width: 80,
    paddingLeft: 17
  },
  itemWrapper: {
    flexDirection: "row",
    width: "100%",
    height: 48,
    alignItems: "center",
    backgroundColor: "#FFFFFF"
  },
  imageStyle: {
    width: 15,
    height: 15,
    marginLeft: 17,
    marginRight: 17
  },
  line: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
    height: 48,
    justifyContent: "center"
  },
  searchValueStyle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    color: "#2E2E2E"
  },
  closeImageStyle: {
    position: "absolute",
    right: 0,
    height: 48,
    width: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  clearButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  clearTextStyle: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: "#757575"
  },
  avatarStyle: {
    maxWidth: "70%",
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 17,
    marginRight: 17,
    backgroundColor: "#EDEEF5"
  },
  nicknameStyle: {
    fontFamily: FONT_FAMILY,
    width: 0.8 * deviceWidth,
    fontSize: 16,
    color: "#2E2E2E"
  },
  emailStyle: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: "#757575"
  },
  titleStyle: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: "#757575"
  },
  imageStyleWrapper2: {
    flexDirection: "row",
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 17,
    marginRight: 17,
    backgroundColor: "#EDEEF5",
    overflow: "hidden"
  },
  imageHalfStyle: {
    width: 20,
    height: 40
    // borderRadius: 20,
  },
  imageQuiteStyle: {
    width: 20,
    height: 20
    // borderRadius: 20,
  },
  unCheck: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    marginLeft: 18,
    borderRadius: 8
  },
  check: {
    width: 16,
    height: 16,
    marginLeft: 18,
    borderWidth: 0,
    borderRadius: 8
  },
  groupImageStyle: {
    maxWidth: "70%",
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
    marginRight: 18,
    backgroundColor: "#EDEEF5"
  }
});
