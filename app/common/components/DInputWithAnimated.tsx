import React, {useState} from 'react';
import {
  Animated,
  View,
  Easing,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import {fontSizeConstants} from '../constants/index';
import {setSizeWithPx, setSize} from '../utils/index';
import {DFontSize, DColors} from '../styles';

interface Props {
  width: number;
  height?: number;
  value?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  onChangeText: (text: string) => void;
}
interface State {
  progress: any;
  bgColor: string;
  lineHeight: number;
}

export const DInputWithAnimated = (props: Props) => {
  const {
    width,
    height,
    value,
    placeholder,
    secureTextEntry,
    onChangeText,
  } = props;

  const [progress, setProgress] = useState(new Animated.Value(0));
  const [bgColor, setBgColor] = useState(DColors.auxiliaryOrange);
  const [lineHeight, setLineHeight] = useState(1);

  function onFocus() {
    setBgColor(DColors.auxiliaryOrange);
    setLineHeight(2);
    Animated.timing(progress, {
      easing: Easing.linear,
      duration: 300,
      toValue: 1,
    }).start();
  }

  function onBlur() {
    setProgress(new Animated.Value(0));
    setBgColor(DColors.auxiliaryWords);
    setLineHeight(1);
  }

  let fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0 * width, 1 * width],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.textInputView, {width: width}]}>
        <TextInput
          underlineColorAndroid="transparent"
          style={[
            styles.textInputStyle,
            {
              height: height,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={DColors.auxiliaryWords}
          onFocus={onFocus}
          onBlur={onBlur}
          value={value}
          onChangeText={text => onChangeText(text)}
          secureTextEntry={secureTextEntry ? secureTextEntry : false}
        />
        <View
          style={[
            styles.animatedView,
            {
              width: width,
              height: lineHeight,
            },
          ]}>
          <Animated.View
            style={[
              styles.animatedStyle,
              {width: fillWidth, backgroundColor: bgColor},
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  textInputView: {},
  textInputStyle: {
    fontSize: DFontSize.h1,
    color: DColors.content,
  },
  animatedView: {
    backgroundColor: DColors.auxiliaryWords,
    marginTop: 0,
  },
  animatedStyle: {
    width: 0,
    backgroundColor: DColors.auxiliaryOrange,
    height: setSize(2),
  },
});
