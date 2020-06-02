import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, StyleSheet, TouchableOpacity, Text, Image} from 'react-native';
import {Icon} from '@ant-design/react-native';
import {TitleBarNew} from '../../../common/components';
import {changeUserInfo} from '../../../store/actions/loginAction';
import {FONT_FAMILY} from '../../../common/styles';

interface State {
  gender: number;
}
interface Props {
  navigation: any;
  currentUserInfo: any;
  dispatch: Function;
}
const checkIcon = require('../../images/Me/right.png');

export class Gender extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      gender: 0,
    };
  }

  componentWillMount() {
    const {currentUserInfo} = this.props;
    this.setState({
      gender: currentUserInfo.gender,
    });
  }

  handleConfirm = () => {
    // todo
    const {currentUserInfo, navigation} = this.props;
    let {gender} = this.state;
    let {authToken} = currentUserInfo;
    this.props.dispatch(
      changeUserInfo(authToken, '', '', gender, undefined, () => {
        navigation.goBack();
      }),
    );
  };

  render() {
    let {navigation} = this.props;
    const {gender} = this.state;
    return (
      <View style={styles.normal}>
        <TitleBarNew
          title={'Gender'}
          navigation={navigation}
          right={<Icon name="check" color="#fff" />}
          pressRight={this.handleConfirm}
        />
        <View style={styles.itemsWrapper}>
          <TouchableOpacity onPress={() => this.setState({gender: 0})}>
            <View style={styles.itemStyle}>
              <View
                style={{
                  ...styles.itemTextWrapper,
                  borderBottomColor: '#D9D9D9',
                  borderBottomWidth: 1,
                }}>
                <Text style={styles.itemText}>Man</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {gender === 0 ? (
                    <Image style={styles.enterStyle} source={checkIcon} />
                  ) : null}
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({gender: 1})}>
            <View style={styles.itemStyle}>
              <View
                style={{
                  ...styles.itemTextWrapper,
                  borderBottomColor: '#D9D9D9',
                  borderBottomWidth: 1,
                }}>
                <Text style={styles.itemText}>Woman</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {gender === 1 ? (
                    <Image style={styles.enterStyle} source={checkIcon} />
                  ) : null}
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({gender: 3})}>
            <View style={styles.itemStyle}>
              <View style={styles.itemTextWrapper}>
                <Text style={styles.itemText}>Other</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {gender === 3 ? (
                    <Image style={styles.enterStyle} source={checkIcon} />
                  ) : null}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  itemsWrapper: {
    marginTop: 7,
  },
  itemStyle: {
    flexDirection: 'row',
    width: '100%',
    height: 52,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  itemTextWrapper: {
    height: 52,
    flex: 1,
    flexDirection: 'row',
    marginLeft: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 16,
    color: '#2E2E2E',
  },
  enterStyle: {
    position: 'relative',
    width: 15,
    height: 10,
    marginRight: 17,
  },
});
const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo,
  };
};

export default connect(mapStateToProps)(Gender);
