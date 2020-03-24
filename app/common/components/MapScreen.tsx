import React from 'react';
import {connect} from 'react-redux';
import {View, StyleSheet, Platform} from 'react-native';
import {Icon} from '@ant-design/react-native';
import {TitleBarNew} from './TitleBarNew';
import {FONT_FAMILY} from '../styles';
import {deviceWidth} from '../utils';
import {PlatFormAndroid} from '../../env';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';

let latitudeDelta = 0.01,
  longitudeDelta = 0.01;

const Page = {
  font_family: FONT_FAMILY,
};

interface Props {
  navigation: any;
}

interface State {
  region: number[];
}

export class MapScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      region: [],
    };
  }

  componentWillMount() {
    // let FieldValue = this.props.navigation.getParam('FieldValue');
    // let region = FieldValue.split(',');
    // this.setState({
    //   region: [Number(region[0]), Number(region[1])],
    // });
  }

  handleConfirm = () => {
    // let onReportFieldChange = this.props.navigation.getParam(
    //   "onReportFieldChange"
    // );
    // let { region } = this.state;
    // onReportFieldChange(region[0] + "," + region[1]);
    // this.props.navigation.goBack();
  };

  render() {
    console.log('render map', this.props);
    let {region} = this.state;
    const MapViewDom =
      Platform.OS === PlatFormAndroid ? (
        <MapView
          onPress={(e: any) => {
            console.log('data', e.nativeEvent);
            this.setState({
              region: [
                e.nativeEvent.coordinate.longitude,
                e.nativeEvent.coordinate.latitude,
              ],
            });
          }}
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          onRegionChange={region => {
            latitudeDelta = region.latitudeDelta;
            longitudeDelta = region.longitudeDelta;
          }}
          style={styles.map}
          region={{
            latitude: Number(region[1]),
            longitude: Number(region[0]),
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta,
          }}>
          <Marker
            coordinate={{
              latitude: Number(region[1]),
              longitude: Number(region[0]),
            }}
            // title={"marker"}
            // description={"this is a marker"}
          />
        </MapView>
      ) : (
        <MapView
          onPress={(e: any) => {
            console.log('data', e.nativeEvent);
            this.setState({
              region: [
                e.nativeEvent.coordinate.longitude,
                e.nativeEvent.coordinate.latitude,
              ],
            });
          }}
          onRegionChange={region => {
            latitudeDelta = region.latitudeDelta;
            longitudeDelta = region.longitudeDelta;
          }}
          style={styles.map}
          region={{
            latitude: Number(region[1]),
            longitude: Number(region[0]),
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta,
          }}>
          <Marker
            coordinate={{
              latitude: Number(region[1]),
              longitude: Number(region[0]),
            }}
            // title={"marker"}
            // description={"this is a marker"}
          />
        </MapView>
      );
    return (
      <View style={styles.container}>
        {/* <TitleBarNew
          right={<Icon name="check" color="#fff"></Icon>}
          pressRight={this.handleConfirm}
          title={'Map'}
          navigation={this.props.navigation}
        /> */}
        {MapViewDom}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: deviceWidth,
    backgroundColor: '#f2f2f2',
  },
  map: {
    flex: 1,
    width: deviceWidth,
  },
});
