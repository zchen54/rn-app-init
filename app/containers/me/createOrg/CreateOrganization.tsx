import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import {Toast} from '@ant-design/react-native';
import {TitleBarNew} from '../../../common/components';
import {PlatFormAndroid} from '../../../env';
import {createCompany} from '../../../store/actions';
import {deviceWidth} from '../../../common/utils';
import {FONT_FAMILY} from '../../../common/styles';
import {Organization} from './../organization/Organization';

interface OrgOptions {
  name: string;
  reseller: any;
  industry: string;
  industryText: string;
  scale: string;
  regionStateData: any;
  regionProvData: any;
  regionCityData: any;
  regionText: string;
  fullAddress: string;
}

interface State {
  visible: boolean;
  options: OrgOptions;
}
interface Props {
  navigation: any;
  authToken: any;
  dispatch: Function;
}
const Page = {
  font_family: FONT_FAMILY,
};

const Icon = {
  QRCodeIcon: require('../../images/Me/QR.png'),
  EnterIcon: require('../../images/Me/enterwhite.png'),
};

export class CreateOrganization extends Component<Props, State> {
  viewDidAppear: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      visible: false,
      options: {
        name: '',
        reseller: {},
        industry: '',
        industryText: '',
        scale: '',
        regionStateData: {},
        regionProvData: {},
        regionCityData: {},
        regionText: '',
        fullAddress: '',
      },
    };
  }

  componentDidMount() {
    this.viewDidAppear = this.props.navigation.addListener(
      'willFocus',
      (navigationProps: any) => {
        // console.log("Org页面将要显示", navigationProps);
        const {params} = navigationProps.state;
        if (params) {
          const {
            industry,
            industryText,
            scale,
            regionCityData,
            regionProvData,
            regionStateData,
            reseller,
          } = params;
          let regionText = '';
          if (regionCityData && regionProvData && regionStateData) {
            if (
              regionCityData.name &&
              regionProvData.name &&
              regionStateData.country
            ) {
              regionText =
                regionCityData.name +
                ', ' +
                regionProvData.name +
                ', ' +
                regionStateData.country;
            } else if (regionProvData.name && regionStateData.country) {
              regionText = regionProvData.name + ', ' + regionStateData.country;
            } else {
              regionText = '';
            }
          }
          this.setState(prevState => ({
            ...prevState,
            options: {
              ...prevState.options,
              industry: industry ? industry : prevState.options.industry,
              reseller: reseller ? reseller : prevState.options.reseller,
              industryText: industryText
                ? industryText
                : prevState.options.industryText,
              scale: scale ? scale : prevState.options.scale,
              regionStateData: regionStateData ? regionStateData : {},
              regionProvData: regionProvData ? regionProvData : {},
              regionCityData: regionCityData ? regionCityData : {},
              regionText,
            },
          }));
        }
      },
    );
  }

  componentWillUnmount() {
    this.viewDidAppear.remove();
  }

  handleCreateOrganization = () => {
    const {authToken, navigation} = this.props;
    const {
      name,
      industry,
      reseller,
      scale,
      regionText,
      fullAddress,
    } = this.state.options;
    if (name === '') {
      Toast.fail('Organization name' + ' is required', 2, undefined, false);
      return;
    }
    if (name.length > 50) {
      Toast.fail(
        'The length of the phone number should not be more than 50 characters!',
        2,
        undefined,
        false,
      );
      return;
    }
    if (industry === '') {
      Toast.fail('Industry' + ' is required', 2, undefined, false);
      return;
    }
    if (scale === '') {
      Toast.fail('Scale' + ' is required', 2, undefined, false);
      return;
    }
    if (regionText === '') {
      Toast.fail('Region' + ' is required', 2, undefined, false);
      return;
    }
    if (fullAddress === '') {
      Toast.fail('Address' + ' is required', 2, undefined, false);
      return;
    }

    this.props.dispatch(
      createCompany(
        authToken,
        {
          companyPkey: '',
          industryID: industry,
          name: name,
          dealer: reseller._id,
          address: regionText,
          scale: scale,
          fullAddress: fullAddress,
        },
        () => {
          Toast.success('Organization created successfully', 1);
          navigation.navigate('Me');
        },
      ),
    );
  };

  renderItems = () => {
    const {
      name,
      industryText,
      reseller,
      scale,
      regionText,
      fullAddress,
    } = this.state.options;
    return (
      <View style={styles.itemsWrapper}>
        <View style={styles.itemStyle}>
          <View style={styles.itemTextWrapper}>
            <Text style={styles.itemText}>Name</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput
                placeholder="Enter the organization name"
                style={styles.input}
                onChangeText={(text: string) =>
                  this.setState(prevState => ({
                    ...prevState,
                    options: {
                      ...prevState.options,
                      name: text,
                    },
                  }))
                }
                value={name}
              />
              <View style={styles.enterStyle} />
            </View>
          </View>
        </View>
        {/* <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate('SelectReseller');
          }}>
          <View style={styles.itemStyle}>
            <View style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>Reseller</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.itemTextTwo}>
                  {reseller && reseller.label ? reseller.label : 'Optional'}
                </Text>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate('Industry');
          }}>
          <View style={styles.itemStyle}>
            <View style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>Industry</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.itemTextTwo}>
                  {industryText ? industryText : 'Required'}
                </Text>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('Scale')}>
          <View style={styles.itemStyle}>
            <View style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>Scale</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.itemTextTwo}>
                  {scale ? scale : 'Required'}
                </Text>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('RegionState')}>
          <View style={styles.itemStyle}>
            <View style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>Region</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.itemTextTwo}>
                  {regionText ? regionText : 'Required'}
                </Text>
                <Image
                  style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                  source={Icon.EnterIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.addressRow}>
          <Text style={styles.addressLabel}>Address</Text>
          <TextInput
            placeholder="Enter the address"
            style={styles.addressInput}
            onChangeText={(text: string) =>
              this.setState(prevState => ({
                ...prevState,
                options: {
                  ...prevState.options,
                  fullAddress: text,
                },
              }))
            }
            value={fullAddress}
          />
        </View>
      </View>
    );
  };

  render() {
    let {navigation} = this.props;
    if (Platform.OS === PlatFormAndroid) {
      StatusBar.setBackgroundColor('rgba(0,0,0,0)', true);
      StatusBar.setBarStyle('light-content', true);
      StatusBar.setTranslucent(true);
    }
    return (
      <View style={styles.normal}>
        <TitleBarNew title={'Create Organization'} navigation={navigation} />
        <ScrollView>
          {this.renderItems()}
          <TouchableOpacity
            onPress={this.handleCreateOrganization}
            style={{marginTop: 8}}>
            <View style={styles.itemStyle}>
              <View style={styles.confirmStyle}>
                <Text style={styles.confirmText}>Create Organization</Text>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  Avatar: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    marginRight: 16,
    backgroundColor: '#F38900',
  },
  QR: {
    width: 17,
    height: 16,
    marginRight: 16,
  },
  enterStyle: {
    position: 'relative',
    width: 7,
    height: 12,
    marginRight: 17,
  },
  itemsWrapper: {
    marginTop: 7,
  },
  itemStyle: {
    flexDirection: 'row',
    width: '100%',
    minHeight: 52,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  itemTextWrapper: {
    minHeight: 52,
    height: 'auto',
    paddingVertical: 5,
    flex: 1,
    flexDirection: 'row',
    marginLeft: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderBottomColor: '#D9D9D9',
    borderBottomWidth: 1,
  },
  addressRow: {
    backgroundColor: '#FFFFFF',
  },
  addressLabel: {
    lineHeight: 52,
    width: '100%',
    height: 52,
    paddingHorizontal: 14,
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#2E2E2E',
  },
  addressInput: {
    height: 52,
    padding: 0,
    marginRight: 17,
    marginLeft: 17,
    fontFamily: Page.font_family,
    fontSize: 16,
  },
  input: {
    textAlign: 'right',
    padding: 0,
    maxWidth: 0.65 * deviceWidth,
    marginRight: 16,
    marginLeft: 15,
    fontFamily: Page.font_family,
    fontSize: 16,
  },
  itemText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#2E2E2E',
  },
  itemTextTwo: {
    maxWidth: 0.65 * deviceWidth,
    marginRight: 16,
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#757575',
  },
  confirmStyle: {
    height: 52,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#1E9DFC',
  },
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
  };
};

export default connect(mapStateToProps)(CreateOrganization);
