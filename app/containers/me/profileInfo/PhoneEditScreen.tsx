import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {Icon} from '@ant-design/react-native';
import {TitleBarNew} from '../../../common/components';
import {
  deviceWidth,
  deviceHeight,
  reverseGeoCoding,
  getIn,
} from '../../../common/utils';
import {countryByCallingCode} from '../../../common/constants';
import {changeUserInfo} from '../../../store/actions/loginAction';
import {FONT_FAMILY} from '../../../common/styles';
import {Toast} from '@ant-design/react-native';

interface State {
  phone: string;
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
const EnterIcon = require('../../images/Me/enterwhite.png');

export class PhoneEditScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      phone: '',
    };
  }

  componentWillMount() {
    const {currentUserInfo} = this.props;
    this.setState({
      phone: currentUserInfo.phone,
    });
  }

  componentDidMount() {
    this.getLocation();
  }

  getLocation = () => {
    Keyboard.dismiss();
    Geolocation.getCurrentPosition(
      (res: any) => {
        console.log('Geolocation', res);
        if (res && res.coords) {
          const {latitude, longitude} = res.coords;
          if (latitude && longitude) {
            this.handleGeoCoding(latitude, longitude);
          }
        }
      },
      (error: any) => {
        console.log(error);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  handleGeoCoding = async (latitude: number, longitude: number) => {
    const placeRes = await reverseGeoCoding(latitude, longitude);
    if (Array.isArray(placeRes.results) && placeRes.results.length) {
      let addressComponents = getIn(placeRes.results, [
        '0',
        'address_components',
      ]);
      if (Array.isArray(addressComponents)) {
        let filter = addressComponents.filter(
          (item: any) => item.types.indexOf('country') > -1,
        );
        if (filter.length && filter[0].short_name) {
          console.log(filter[0].short_name);
          countryByCallingCode.forEach(item => {
            if (item.code === filter[0].short_name) {
              const phone = this.state.phone || '';
              let tempArr = phone.split(' - ');
              if (tempArr.length < 2) {
                this.handleCountryCodeChange(item.dial_code);
              }
            }
          });
        }
      }
    }
  };

  handleCountryCodeChange = (value: string) => {
    const phone = this.state.phone || '';
    let tempArr = phone.split(' - ');
    let newValue = phone;
    if (tempArr.length === 1) {
      newValue = `${value} - ${phone}`;
    } else if (tempArr.length === 2) {
      newValue = `${value} - ${tempArr[1]}`;
    } else if (tempArr.length === 3) {
      newValue = `${value} - ${tempArr[2]}`;
    }
    this.setState({
      phone: newValue,
    });
  };

  handlePhoneChange = (value: string) => {
    const phone = this.state.phone || '';
    if (value.length > 15) {
      Toast.fail(
        'The length of the phone number should not be more than 15 characters!',
        2,
        undefined,
        false,
      );
      return;
    }
    let tempArr = phone.split(' - ');
    let newValue = phone;
    if (tempArr.length === 1) {
      newValue = value;
    } else if (tempArr.length === 2) {
      tempArr[1] = value;
      newValue = tempArr.join(' - ');
    } else if (tempArr.length === 3) {
      tempArr[2] = value;
      newValue = tempArr.join(' - ');
    }
    this.setState({
      phone: newValue,
    });
  };

  handleClearPhone = () => {
    this.handlePhoneChange('');
  };

  handleConfirm = () => {
    // todo
    const {currentUserInfo, navigation} = this.props;
    let {phone} = this.state;
    let {authToken} = currentUserInfo;
    if (phone) {
      let tempArr = phone.split(' - ');
      if (
        tempArr.length === 1 ||
        (tempArr.length === 2 && (!tempArr[0] || !tempArr[1]))
      ) {
        Toast.fail(
          'Dial code and phone number are required.',
          2,
          undefined,
          false,
        );
        return;
      }
    }
    if (phone === currentUserInfo.phone) {
      navigation.goBack();
      return;
    }
    this.props.dispatch(
      changeUserInfo(authToken, '', '', undefined, phone, () => {
        navigation.goBack();
      }),
    );
  };

  render() {
    let {navigation} = this.props;
    let {phone} = this.state;
    let countryCodeText = '',
      phoneText = phone;
    if (phone) {
      let tempArr = phone.split(' - ');
      if (tempArr.length === 2) {
        countryCodeText = tempArr[0];
        phoneText = tempArr[1];
      } else if (tempArr.length === 3) {
        countryCodeText = tempArr[1];
        phoneText = tempArr[2];
      }
    }

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}>
        <View style={styles.normal}>
          <View>
            <TitleBarNew
              title={'Phone'}
              navigation={navigation}
              right={<Icon name="check" color="#fff" />}
              pressRight={this.handleConfirm}
            />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Dial Code</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('SelectCountry', {
                    onChange: this.handleCountryCodeChange,
                  });
                }}
                style={styles.inputWrap}>
                <Text style={styles.inputStyle}>{countryCodeText}</Text>
                <Image
                  style={{...styles.clearStyle, tintColor: '#B3B3B3'}}
                  source={EnterIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.inputStyle}
                  placeholder="Enter Phone"
                  value={phoneText}
                  keyboardType="phone-pad"
                  onChangeText={this.handlePhoneChange}
                />
                <TouchableOpacity onPress={this.handleClearPhone}>
                  <Image style={styles.clearStyle} source={clearIcon} />
                </TouchableOpacity>
              </View>
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
    paddingHorizontal: 16,
    flexDirection: 'row',
    height: 52,
    width: '100%',
    backgroundColor: '#ffffff',
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    width: 120,
    fontSize: 16,
    color: '#2E2E2E',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputStyle: {
    fontSize: 16,
    color: '#757575',
    padding: 0,
    paddingRight: 10,
    textAlign: 'right',
    flex: 1,
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

export default connect(mapStateToProps)(PhoneEditScreen);
