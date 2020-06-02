import React from "react";
import {
  Animated,
  View,
  Easing,
  Text,
  TextInput,
  StyleSheet
} from "react-native";
import { fontSizeConstants } from "../constants/index";
import { setSizeWithPx, setSize } from "../utils/index";
import { DFontSize, DColors } from "../styles";

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

export class DInputWithAnimated extends React.Component<Props, State> {
  textInput: any;
  constructor(props: Props) {
    super(props);

    this.state = {
      progress: new Animated.Value(0),
      bgColor: DColors.orange,
      lineHeight: 1
    };
  }

  componentWillReceiveProps(nextProps: Props) {}

  _update() {
    this.setState({ bgColor: DColors.orange, lineHeight: 2 });
    Animated.timing(this.state.progress, {
      easing: Easing.linear,
      duration: 300,
      toValue: 1
    }).start();
  }

  _onFocus = () => {
    this._update();
  };

  _onBlur = () => {
    this.setState({
      progress: new Animated.Value(0),
      bgColor: DColors.alto,
      lineHeight: 1
    });
  };

  render() {
    let fillWidth = this.state.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0 * this.props.width, 1 * this.props.width]
    });

    return (
      <View style={styles.container}>
        <View style={[styles.textInputView, { width: this.props.width }]}>
          <TextInput
            ref={ref => (this.textInput = ref)}
            underlineColorAndroid="transparent"
            style={[
              styles.textInputStyle,
              {
                height: this.props.height
              }
            ]}
            placeholder={this.props.placeholder}
            placeholderTextColor={DColors.silver}
            onFocus={this._onFocus}
            onBlur={this._onBlur}
            value={this.props.value}
            onChangeText={text => this.props.onChangeText(text)}
            secureTextEntry={
              this.props.secureTextEntry ? this.props.secureTextEntry : false
            }
          />
          <View
            style={[
              styles.animatedView,
              {
                width: this.props.width,
                height: this.state.lineHeight
              }
            ]}
          >
            <Animated.View
              style={[
                styles.animatedStyle,
                { width: fillWidth, backgroundColor: this.state.bgColor }
              ]}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center"
  },
  textInputView: {},
  textInputStyle: {
    fontSize: DFontSize.h1,
    color: DColors.inkiness
  },
  animatedView: {
    backgroundColor: DColors.alto,
    marginTop: 0
  },
  animatedStyle: {
    width: 0,
    backgroundColor: DColors.orange,
    height: setSize(2)
  }
});
