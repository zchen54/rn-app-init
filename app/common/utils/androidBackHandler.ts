import { BackHandler, Platform } from "react-native";
import { PlatFormAndroid } from "../../env";

export function addHardwareBackPressEventListener(eventHandler: any) {
  if (Platform.OS === PlatFormAndroid) {
    BackHandler.addEventListener("hardwareBackPress", eventHandler);
  }
}

export function removeHardwareBackPressEventListener(eventHandler: any) {
  if (Platform.OS === PlatFormAndroid) {
    BackHandler.removeEventListener("hardwareBackPress", eventHandler);
  }
}
