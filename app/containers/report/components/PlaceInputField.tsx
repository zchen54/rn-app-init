import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  ViewStyle,
} from 'react-native';
import {PlatFormAndroid} from '../../../env';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {styles} from '../../template/style';
import Geolocation from '@react-native-community/geolocation';
import {getIn, reverseGeoCoding} from '../../../common/utils';

const location = require('../../images/template/Location.png');

interface State {}
interface Props {
  FieldValue: string;
  onReportFieldChange: (value: string) => void;
  isWarn?: boolean;
  reportId: string;
  navigation: any;
}

export const PlaceInputField = (props: Props) => {
  const {FieldValue, isWarn, onReportFieldChange, reportId, navigation} = props;

  const handleGeoLocation = async (latitude: number, longitude: number) => {
    const geoCodeRes = await reverseGeoCoding(latitude, longitude);
    console.log('geoCodeRes', geoCodeRes);
    if (Array.isArray(geoCodeRes.results) && geoCodeRes.results.length) {
      const place = geoCodeRes.results[0];
      let value = '';
      if (place.name) {
        value = `${place.name}\r\n${place.formatted_address}`;
      } else {
        value = place.formatted_address;
      }
      onReportFieldChange(value);
    }
  };

  const warnStyle: ViewStyle = {
    borderColor: '#ed2f31',
    borderWidth: 1,
  };
  const formStyle: ViewStyle = {
    ...styles.formItemWrap,
    height: 'auto',
    minHeight: 48,
    paddingVertical: 10,
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('PlaceAutoComplete', {
            handleChange: onReportFieldChange,
          });
        }}>
        <View style={isWarn ? {...formStyle, ...warnStyle} : formStyle}>
          {/* <Image source={location} /> */}
          <Text style={styles.formInput}>{FieldValue}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
