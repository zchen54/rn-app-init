import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {Icon} from '@ant-design/react-native';
import {TitleBarNew} from '../../../common/components';
import {deviceWidth, deviceHeight} from '../../../common/utils';
import {changeUserInfo} from '../../../store/actions/loginAction';
import {FONT_FAMILY} from '../../../common/styles';
import {Toast} from '@ant-design/react-native';
interface State {
  nickname: string;
}
interface Props {
  navigation: any;
  currentUserInfo: any;
  dispatch: Function;
}
const Page = {
  font_family: FONT_FAMILY,
};
const clearIcon = require('../../images/Me/close.png');
export class NickName extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      nickname: '',
    };
  }

  componentWillMount() {
    const {currentUserInfo} = this.props;
    this.setState({
      nickname: currentUserInfo.nickName,
    });
  }

  handleNickNameChange = (text: string) => {
    this.setState({
      nickname: text,
    });
  };

  handleConfirm = () => {
    // todo
    const {currentUserInfo, navigation} = this.props;
    let {nickname} = this.state;
    let {authToken} = currentUserInfo;
    if (nickname === '') {
      Toast.fail('Nickname' + ' is required', 2, undefined, false);
      return;
    }
    if (nickname === currentUserInfo.nickName) {
      navigation.goBack();
      return;
    }
    this.props.dispatch(
      changeUserInfo(authToken, nickname, '', undefined, undefined, () => {
        navigation.goBack();
      }),
    );
  };

  render() {
    let {navigation} = this.props;
    let {nickname} = this.state;
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}>
        <View style={styles.normal}>
          <View>
            <TitleBarNew
              title={'NickName'}
              navigation={navigation}
              right={<Icon name="check" color="#fff" />}
              pressRight={this.handleConfirm}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputStyle}
                value={nickname}
                onChangeText={this.handleNickNameChange}
              />
              <TouchableOpacity onPress={() => this.setState({nickname: ''})}>
                <Image style={styles.clearStyle} source={clearIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
const styles = StyleSheet.create({
  preview: {
    width: deviceWidth,
    height: deviceHeight,
  },
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  inputContainer: {
    flexDirection: 'row',
    height: 52,
    width: '100%',
    backgroundColor: '#ffffff',
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputStyle: {
    fontSize: 16,
    color: '#2E2E2E',
    padding: 0,
    width: deviceWidth - 34,
  },
  clearStyle: {
    width: 16,
    height: 16,
  },
});

const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo,
  };
};

export default connect(mapStateToProps)(NickName);
