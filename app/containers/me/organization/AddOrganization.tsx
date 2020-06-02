import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, StyleSheet, Image, TouchableOpacity, Text} from 'react-native';
import {TitleBarNew} from '../../../common/components';
import {FONT_FAMILY} from '../../../common/styles';

const Icon = {
  AddSearch: require('../../images/Me/Add_search.png'),
  addScan: require('../../images/Me/Add_scan.png'),
  EnterIcon: require('../../images/Me/enter.png'),
};
interface State {}
interface Props {
  navigation: any;
}

const Page = {
  font_family: FONT_FAMILY,
};

export class AddOrganization extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    let {navigation} = this.props;
    return (
      <View style={styles.normal}>
        <TitleBarNew title={'Join organization'} navigation={navigation} />
        {/* <View style={styles.headerStyle}>
          <Text style={styles.headerTitle}>Join your organization</Text>
        </View> */}
        <TouchableOpacity
          onPress={() => navigation.navigate('SearchOrganization')}>
          <View style={styles.itemStyle}>
            <View
              style={{...styles.itemImageWrapper, backgroundColor: '#F38900'}}>
              <Image style={styles.itemImage} source={Icon.AddSearch} />
            </View>
            <View style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>
                Search for organization name to join
              </Text>
              <Image
                style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                source={Icon.EnterIcon}
              />
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate('AuthScanQRCode', {
              type: 'Organization',
            });
          }}>
          <View style={styles.itemStyle}>
            <View
              style={{...styles.itemImageWrapper, backgroundColor: '#01CB9C'}}>
              <Image style={styles.itemImage} source={Icon.addScan} />
            </View>
            <View
              style={{
                ...styles.itemTextWrapper,
                borderTopColor: '#D9D9D9',
                borderTopWidth: 1,
              }}>
              <Text style={styles.itemText}>Scan the QR code to join</Text>
              <Image
                style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
                source={Icon.EnterIcon}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  headerStyle: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    paddingLeft: 17,
  },
  headerTitle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#2E2E2E',
  },
  itemStyle: {
    flexDirection: 'row',
    width: '100%',
    height: 52,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  itemImageWrapper: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 17,
  },
  itemImage: {
    width: 16,
    height: 16,
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
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddOrganization);
