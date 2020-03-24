import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ToastAndroid,
  PermissionsAndroid
} from "react-native";

export const requestMultiplePermission = async function() {
  try {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ];
    //返回得是对象类型
    const granteds = await PermissionsAndroid.requestMultiple(permissions);
    /**
     * 返回String类型
     * 'granted'： 同意了
     * 'denied': 拒绝了
     * 'never_ask_again': 拒绝不再显示
     */
    // var data = "是否同意地址权限: ";
    // if (granteds["android.permission.ACCESS_FINE_LOCATION"] === "granted") {
    //   data = data + "是\n";
    // } else {
    //   data = data + "否\n";
    // }
    // data = data + "是否同意相机权限: ";
    // if (granteds["android.permission.CAMERA"] === "granted") {
    //   data = data + "是\n";
    // } else {
    //   data = data + "否\n";
    // }
    // data = data + "是否同意存储权限: ";
    // if (granteds["android.permission.WRITE_EXTERNAL_STORAGE"] === "granted") {
    //   data = data + "是\n";
    // } else {
    //   data = data + "否\n";
    // }
    return granteds;
  } catch (err) {
    console.error(err);
    return err;
  }
};
