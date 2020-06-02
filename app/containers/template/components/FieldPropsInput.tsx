import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import UUID from "uuid/v1";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Image,
  Keyboard,
  Switch,
  StatusBar
} from "react-native";
import { Icon, Modal, Tabs, Portal, Toast } from "@ant-design/react-native";
import {
  fieldTypes,
  tableFieldTypes,
  fieldProperty,
  customFormat
} from "../../../common/constants";
import { DColors, DFontSize, FONT_FAMILY } from "../../../common/styles";
import { getIn } from "../../../common/utils";
import { FieldType, TableFieldType } from "../../../common/constants/ModeTypes";
import { isStaffInCompany } from ".././judgement";
import { styles } from "./style";

type KeyboardType =
  | "default"
  | "email-address"
  | "numeric"
  | "phone-pad"
  | "visible-password"
  | "ascii-capable"
  | "numbers-and-punctuation"
  | "url"
  | "number-pad"
  | "name-phone-pad"
  | "decimal-pad"
  | "twitter"
  | "web-search"
  | undefined;

interface Props {
  label: string;
  value: string;
  onChange: ((text: string) => void) | undefined;
  keyboardType?: KeyboardType;
  onBlur?: () => void;
}

export const FieldPropsInput = (props: Props) => {
  const { keyboardType, label, value, onChange, onBlur } = props;
  return (
    <View style={styles.switchView}>
      <Text style={styles.switchText}>{label}</Text>
      <TextInput
        keyboardType={keyboardType || undefined}
        value={value}
        placeholder=""
        placeholderTextColor="#ccc"
        style={{ flex: 1, textAlign: "right", marginLeft: 17 }}
        onChangeText={onChange}
        onBlur={onBlur}
      />
    </View>
  );
};
