import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';

interface Props {
  text: string;
  onClick: () => void;
}

export const Button = (props: Props) => {
  const {text, onClick} = props;

  return (
    <TouchableOpacity style={styles.Button} onPress={onClick}>
      <Text>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  Button: {
    width: 60,
    height: 20,
    borderWidth: 1,
    borderColor: 'lightgray',
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
