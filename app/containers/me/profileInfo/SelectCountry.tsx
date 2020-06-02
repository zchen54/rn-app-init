import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Toast, Modal, Portal} from '@ant-design/react-native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {TitleBarNew} from '../../../common/components';
import {FONT_FAMILY} from '../../../common/styles';
import {deviceWidth, requestApiV2, API_v2} from '../../../common/utils';
import {countryByCallingCode} from '../../../common/constants/country';

interface State {}
interface Props {
  authToken: string;
  navigation: any;
}
const Page = {
  font_family: FONT_FAMILY,
};

const Icon: any = {
  social: require('../../images/industry/Personnel.png'),
  EnterIcon: require('../../images/Me/enterwhite.png'),
};

export class SelectCountry extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  handleSelectState = (value: string) => {
    const {navigation} = this.props;
    const onChange = navigation.getParam('onChange');
    onChange(value);
    navigation.goBack();
  };

  renderListItem = ({item, index}: any) => {
    const value = item.dial_code;
    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          this.handleSelectState(value);
        }}
        style={{marginTop: 1}}>
        <View style={styles.itemWrapper}>
          <Text style={styles.textStyle}>{`${item.name}  ${
            item.dial_code
          }`}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const {navigation} = this.props;
    console.log('2233', this.props);
    return (
      <View style={styles.normal}>
        <TitleBarNew title={'Select Country Code'} navigation={navigation} />
        <FlatList
          data={countryByCallingCode}
          renderItem={this.renderListItem}
          keyExtractor={(item, index) => '' + index}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  itemWrapper: {
    width: deviceWidth,
    height: 48,
    paddingLeft: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  textStyle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#2E2E2E',
  },
  enterStyle: {
    position: 'relative',
    width: 7,
    height: 12,
    marginRight: 17,
  },
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectCountry);
