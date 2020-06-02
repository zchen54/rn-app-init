import React, { Component } from "react";
import { View, Text } from "react-native";
import { DSignaturePad } from "../../../common/components";
import { deviceWidth } from "../../../common/utils";

interface State {}
interface Props {
  FieldValue: string;
  handleSignatureSave: (uri: string) => void;
  authToken: string;
}

export class SignatureField extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const { FieldValue, handleSignatureSave, authToken } = this.props;
    return (
      <View style={{ marginTop: 16, marginBottom: 32 }}>
        <DSignaturePad
          // pickerStyle={{ width: deviceWidth * 0.8, height: deviceWidth * 0.4 }}
          source={FieldValue}
          handleConfirm={handleSignatureSave}
          authToken={authToken}
        />
      </View>
    );
  }
}
