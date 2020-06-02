import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  StatusBar,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { networkState } from "../utils";

export const NetworkStateBar = () => {
  return networkState ? (
    <View></View>
  ) : (
    <View
      style={{
        backgroundColor: "#fcecec",
        height: 20,
        paddingHorizontal: 20,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Text style={{ fontSize: 12, color: "#757575" }}>App is offline</Text>
    </View>
  );
};
