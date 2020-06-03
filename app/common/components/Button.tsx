import React, { Component } from "react";
import PropTypes from "prop-types";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface State {}
interface Props {
  text: string;
  onClick: () => void;
}

export class Button extends Component<Props, State> {
  static propTypes = {
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  };

  render() {
    const { text, onClick } = this.props;
    return (
      <TouchableOpacity style={styles.Button} onPress={onClick}>
        <Text>{text}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  Button: {
    width: 60,
    height: 20,
    borderWidth: 1,
    borderColor: "lightgray",
    margin: 5,
    alignItems: "center",
    justifyContent: "center"
  }
});