import React, { Component } from "react";
import { View, Text, TouchableOpacity, Image, ViewStyle } from "react-native";

import { styles } from "../../template/style";

const datetimeIcon = require("../../images/template/datetime.png");

interface State {}
interface Props {
  FieldValue: string;
  handlePress: () => void;
  isWarn?: boolean;
  placeholder?: string;
  autocomplete?: boolean;
}

export class DatetimeField extends Component<Props, State> {
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
      ...styles.formItemWrap
    };

    return autocomplete ? (
      <View
        style={{ ...formStyle, backgroundColor: "transparent", height: "auto" }}
      >
        <Image source={datetimeIcon} />
        <Text style={styles.formItemWrapOText}>
          {FieldValue ? FieldValue : ""}
        </Text>
      </View>
    ) : (
      <TouchableOpacity
        onPress={handlePress}
        style={isWarn ? { ...formStyle, ...warnStyle } : formStyle}
      >
        <Image source={datetimeIcon} />
        <Text style={styles.formItemWrapOText}>
          {FieldValue
            ? FieldValue
            : placeholder
            ? placeholder
            : "Please select date and time"}
        </Text>
      </TouchableOpacity>
    );
  }
}
