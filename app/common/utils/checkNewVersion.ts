import { Platform, Linking } from "react-native";
import { Toast, Modal, Portal } from "@ant-design/react-native";
import { requestApiV2 } from "./httpRequest";
import { API_v2 } from "./api";
import { clearUserInfo } from "./storageUtils";
import NavigationService from "./navigationService";
import { PlatFormAndroid } from "../../env";

export const checkNewVersion = (
  versionName: string,
  versionCode: number,
  isManual?: boolean
) => {
  return new Promise(function(resolve, reject) {
    let data = {
      type: Platform.OS === PlatFormAndroid ? "android" : "ios",
      versionCode: versionCode
    };
    requestApiV2(API_v2.getVersion, data, "")
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        // Toast.fail("Check new version failed", 1);
        reject(error);
        console.error(error);
      });
  });
};

const handleUpdateApp = () => {
  const googlePlayUrl =
      "http://play.google.com/store/apps/details?id=com.data2go",
    appStoreUrl = "itms-apps://itunes.apple.com/cn/app/1474206224?mt=8";

  if (Platform.OS === PlatFormAndroid) {
    Linking.canOpenURL(googlePlayUrl)
      .then(supported => {
        if (!supported) {
          Toast.info("Can't handle url");
        } else {
          return Linking.openURL(googlePlayUrl);
        }
      })
      .catch(err => console.error("An error occurred", err));
  } else {
    Linking.canOpenURL(appStoreUrl)
      .then(supported => {
        if (!supported) {
          Toast.info("Can't handle url");
        } else {
          return Linking.openURL(appStoreUrl);
        }
      })
      .catch(err => console.error("An error occurred", err));
  }
};
