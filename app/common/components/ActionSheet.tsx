import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Modal } from "@ant-design/react-native";
import { deviceWidth } from "../utils";
interface State {}
interface Props {
  visible: boolean;
  onClose: () => void;
  selections: Array<string>;
  functions: Array<() => void>;
}

export class ActionSheet extends Component<Props, State> {
  render() {
    const { visible, onClose, selections, functions } = this.props;
    return (
      <Modal
        popup
        visible={visible}
        animationType={"slide-up"}
        maskClosable={true}
        onClose={onClose}
      >
        <View style={styles.actionWrapper}>
          {selections.map((item, index) => (
            <View key={item + index}>
              <TouchableOpacity
                onPress={functions[index]}
                style={{ marginBottom: 1 }}
              >
                <View style={styles.itemWrapper}>
                  <Text style={styles.textStyle}>{item}</Text>
                </View>
              </TouchableOpacity>
              <View
                style={{
                  width: "100%",
                  height: 1,
                  backgroundColor: "#919191"
                }}
              />
            </View>
          ))}
          <View
            style={{
              width: "100%",
              height: 7,
              backgroundColor: "#919191"
            }}
          />
          <TouchableOpacity onPress={onClose}>
            <View style={styles.itemWrapper}>
              <Text style={styles.textStyle}>Cancel</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  actionWrapper: {
    width: deviceWidth
    // bottom: 0
  },
  itemWrapper: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center"
  },
  textStyle: {
    color: "#2E2E2E",
    fontSize: 16
  }
});
