import React, { Component } from "react";
import { View, Text, TouchableOpacity, Image, ViewStyle } from "react-native";

import { styles } from "../../template/style";

const timeIcon = require("../../images/template/time.png");
interface State {}
interface Props {
  FieldValue: string;
  handlePress: () => void;
  isWarn?: boolean;
  placeholder?: string;
  autocomplete?: boolean;
}

export class TimeField extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      FieldValue,
      handlePress,
      isWarn,
      placeholder,
      autocomplete
    } = this.props;
    const warnStyle: ViewStyle = {
      borderColor: "#ed2f31",
      borderWidth: 1
    };
    const formStyle: ViewStyle = {
      ...styles.formItemWrap,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center"
    };

    return autocomplete ? (
      <View
        style={{ ...formStyle, backgroundColor: "transparent", height: "auto" }}
      >
        <Image source={timeIcon} />
        <Text style={styles.formItemWrapOText}>
          {FieldValue ? FieldValue : ""}
        </Text>
      </View>
    ) : (
      <TouchableOpacity onPress={handlePress}>
        <View style={isWarn ? { ...formStyle, ...warnStyle } : formStyle}>
          <Image source={timeIcon} />
          <Text style={styles.formItemWrapOText}>
            {FieldValue
              ? FieldValue
              : placeholder
              ? placeholder
              : "Please select time"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}
