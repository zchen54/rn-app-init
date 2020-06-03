import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Modal,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  deviceWidth,
  requestApiV2,
  API_v2,
  getIn,
  deviceHeight,
  generateGetUrl,
  nearbySearchByLatLng,
  placeAutoComplete,
  getPlaceDetail,
} from '..//utils';
import {FONT_FAMILY, DColors} from '../styles';
import {TitleBarNew} from '../components';
import {Toast, Portal, Icon} from '@ant-design/react-native';
import {fieldTypes, toastTips, customFormat} from '../constants';
import {
  ErrorMessage_Network_Offline,
  PlatFormAndroid,
  GOOGLE_MAPS_API_KEY,
} from '../../env';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';

interface Props {
  navigation: any;
}
let timestampInput = new Date().getTime();
let initObj: any = {};

export const PlaceAutoComplete = (props: Props) => {
  const [nearbyPlaceData, setNearbyPlaceData] = useState([]);
  const [autoCompleteData, setAutoCompleteData] = useState([]);
  const [selectFromSearchData, setSelectFromSearchData] = useState([]);
  const [sessionToken, setSessionToken] = useState(new Date().getTime());
  const [inputValue, setInputValue] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [selected, setSelected] = useState(initObj);
  const [location, setLocation] = useState({
    latitude: 29.889974,
    longitude: 121.634014,
  });

  const {navigation} = props;
  const handleChange = navigation.getParam('handleChange');

  useEffect(() => {
    getLocation();
    setInputValue('');
    setAutoCompleteData([]);
  }, []);

  function getLocation() {
    Keyboard.dismiss();
    Geolocation.getCurrentPosition(
      (res: any) => {
        console.log('Geolocation', res);
        if (res && res.coords) {
          const {latitude, longitude} = res.coords;
          if (latitude && longitude) {
            handleSearchNearby(latitude, longitude);
            setLocation({
              latitude,
              longitude,
            });
          }
        }
      },
      (error: any) => {
        console.log(error);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }

  async function handleSearchNearby(latitude: number, longitude: number) {
    const nearbyRes = await nearbySearchByLatLng(latitude, longitude);
    console.log('nearbySearchByLatLng', nearbyRes);
    if (Array.isArray(nearbyRes.results) && nearbyRes.results.length) {
      let dataList = nearbyRes.results.map((item: any) => ({
        place_id: item.place_id,
        name: item.name || '',
        formatted_address: item.vicinity || '',
        location: item.geometry.location,
      }));
      setNearbyPlaceData(dataList);
    }
  }

  function onChangeText(text: string) {
    setInputValue(text);
    setSelected(initObj);
    if (text) {
      timestampInput = new Date().getTime();
      setTimeout(() => {
        handlePlaceAutoComplete(text);
      }, 2000);
    } else {
      setAutoCompleteData([]);
    }
  }

  async function handlePlaceAutoComplete(text: string) {
    let timestampNow = new Date().getTime();
    console.log(timestampNow - timestampInput, text);
    if (timestampNow - timestampInput > 1000) {
      const autoCompleteRes = await placeAutoComplete(
        text,
        location.latitude,
        location.longitude,
        sessionToken,
      );
      console.log('placeAutoComplete', autoCompleteRes);
      if (Array.isArray(autoCompleteRes.predictions)) {
        let dataList = autoCompleteRes.predictions.map((item: any) => ({
          place_id: item.place_id,
          name: item.structured_formatting.main_text || '',
          formatted_address: item.description || '',
        }));
        setAutoCompleteData(dataList);
      }
    }
  }

  function handleClickMap(lat: number, lng: number) {
    if (lat && lng) {
      setSelected('');
      handleSearchNearby(lat, lng);
      setLocation({
        latitude: lat,
        longitude: lng,
      });
    }
  }

  function handleConfirm() {
    setSessionToken(new Date().getTime());
    console.log('ok', selected);
    let value = '';
    if (selected.name) {
      value = `${selected.name}\r\n${selected.formatted_address}`;
    } else {
      value = selected.formatted_address || '';
    }
    handleChange && handleChange(value);
    navigation.goBack();
  }

  function handleSelectPlace(place: any) {
    console.log('place', place);
    setSelected(place);
    if (place.location && place.location.lat && place.location.lng) {
      setLocation({
        latitude: place.location.lat,
        longitude: place.location.lng,
      });
    }
  }

  async function handlePlaceDetail(place_id: string) {
    const detailRes = await getPlaceDetail(place_id, sessionToken);
    console.log('getPlaceDetail', detailRes);
    if (detailRes.result) {
      const {place_id, name, formatted_address, geometry} = detailRes.result;
      let dataList: any = [
        {
          place_id,
          name,
          formatted_address,
          location: geometry ? geometry.location : null,
        },
      ];
      setSelectFromSearchData(dataList);
      setSearchVisible(false);
      handleSelectPlace(dataList[0]);
      setSessionToken(new Date().getTime());
    }
  }

  const _renderItem = (data: any, hasLocation: boolean) => {
    const {index, item} = data;
    const handleClickItem = () => {
      if (hasLocation) {
        handleSelectPlace(item);
      } else {
        handlePlaceDetail(item.place_id);
      }
    };
    return (
      <TouchableOpacity onPress={handleClickItem}>
        <View style={styles.placeItem}>
          <View style={styles.itemContent}>
            {getIn(item, ['name']) ? (
              <Text style={styles.mainText}>{getIn(item, ['name'])}</Text>
            ) : null}
            <Text style={styles.descText}>
              {getIn(item, ['formatted_address'])}
            </Text>
          </View>
          {selected.place_id === item.place_id ? (
            <Icon name="check" color="#1e9dfc" />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  let latitudeDelta = 0.01,
    longitudeDelta = 0.01;
  const {latitude, longitude} = location;
  const MapViewDom =
    Platform.OS === PlatFormAndroid ? (
      <MapView
        onPress={(e: any) => {
          console.log('data', e.nativeEvent);
          const lat = e.nativeEvent.coordinate.latitude,
            lng = e.nativeEvent.coordinate.longitude;
          handleClickMap(lat, lng);
        }}
        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
        onRegionChange={region => {
          latitudeDelta = region.latitudeDelta;
          longitudeDelta = region.longitudeDelta;
        }}
        style={styles.map}
        region={{
          latitude,
          longitude,
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta,
        }}>
        <Marker
          coordinate={{
            latitude,
            longitude,
          }}
          // title={"marker"}
          // description={"this is a marker"}
        />
      </MapView>
    ) : (
      <MapView
        onPress={(e: any) => {
          console.log('data', e.nativeEvent);
          const lat = e.nativeEvent.coordinate.latitude,
            lng = e.nativeEvent.coordinate.longitude;
          handleClickMap(lat, lng);
        }}
        onRegionChange={region => {
          latitudeDelta = region.latitudeDelta;
          longitudeDelta = region.longitudeDelta;
        }}
        style={styles.map}
        region={{
          latitude,
          longitude,
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta,
        }}>
        <Marker
          coordinate={{
            latitude,
            longitude,
          }}
          // title={"marker"}
          // description={"this is a marker"}
        />
      </MapView>
    );

  let emptyTip = (
    <View style={{...styles.placeItem, justifyContent: 'center'}}>
      <Text style={styles.descText}>No relevant location was found.</Text>
    </View>
  );

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}>
      <View style={styles.container}>
        <TitleBarNew
          title={'Select Place'}
          right={<Icon name="check" color="#fff" />}
          pressRight={handleConfirm}
          navigation={navigation}
        />
        <View style={styles.inputWrap}>
          <TouchableOpacity
            onPress={() => {
              setSearchVisible(true);
            }}
            style={styles.inputContainer}>
            <Icon name="search" color="#aaa" />
            <Text style={styles.textInput}>{inputValue}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.mapContainer}>{MapViewDom}</View>
        <View style={{height: 300}}>
          {!searchVisible ? (
            <FlatList
              data={
                inputValue && selectFromSearchData.length
                  ? selectFromSearchData
                  : nearbyPlaceData
              }
              renderItem={data => _renderItem(data, true)}
              keyExtractor={(item, index) => '' + index}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={styles.middleLine} />}
              ListEmptyComponent={emptyTip}
            />
          ) : null}
        </View>
        <Modal animationType="slide" transparent={true} visible={searchVisible}>
          <View style={styles.modalContainer}>
            <TitleBarNew
              title={'Search'}
              navigation={null}
              pressLeft={() => {
                setSearchVisible(false);
              }}
            />
            <View style={styles.inputWrap}>
              <View style={styles.inputContainer}>
                <Icon name="search" color="#aaa" />
                <TextInput
                  placeholder="Search Place"
                  value={inputValue}
                  onChangeText={onChangeText}
                  style={styles.textInput}
                  autoFocus={true}
                />
              </View>
            </View>
            <View style={{flex: 1}}>
              <FlatList
                data={autoCompleteData}
                renderItem={data => _renderItem(data, false)}
                keyExtractor={(item, index) => '' + index}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => (
                  <View style={styles.middleLine} />
                )}
                ListEmptyComponent={emptyTip}
              />
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  cancelText: {
    fontSize: 16,
  },
  okText: {
    fontSize: 16,
    color: DColors.mainColor,
  },
  inputWrap: {
    borderBottomColor: '#f2f2f2',
    borderBottomWidth: 1,
  },
  inputContainer: {
    height: 36,
    marginVertical: 10,
    marginHorizontal: 16,
    paddingHorizontal: 8,
    backgroundColor: '#f2f2f2',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    fontSize: 16,
    padding: 0,
    paddingLeft: 8,
    width: '100%',
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  placeItem: {
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    width: deviceWidth - 64,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  selectedIcon: {},
  mainText: {
    fontSize: 14,
    color: '#2e2e2e',
    marginBottom: 4,
  },
  descText: {
    fontSize: 12,
    color: '#757575',
  },
  middleLine: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
});
