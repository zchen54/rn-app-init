import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  ViewStyle
} from "react-native";
import { PlatFormAndroid } from "../../../env";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { styles } from "../../template/style";

const location = require("../../images/template/Location.png");

interface State {}
interface Props {
  FieldValue: string;
  getLocation: () => void;
  onReportFieldChange: Function;
  navigation: any;
  isWarn?: boolean;
}

let latitudeDelta = 0.01,
  longitudeDelta = 0.01;

export class LocationField extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    latitudeDelta = 0.01;
    longitudeDelta = 0.01;
  }

  render() {
    const { FieldValue, getLocation, isWarn } = this.props;
    let region = FieldValue.split(",");
    const MapViewDom =
      Platform.OS === PlatFormAndroid ? (
        <MapView
          onPress={(e: any) => {
            console.log("data", e.nativeEvent);
            this.props.onReportFieldChange(
              e.nativeEvent.coordinate.longitude +
                "," +
                e.nativeEvent.coordinate.latitude
            );
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
            longitudeDelta: longitudeDelta
          }}
        >
          <Marker
            coordinate={{
              latitude: Number(region[1]),
              longitude: Number(region[0])
            }}
            // title={"marker"}
            // description={"this is a marker"}
          />
        </MapView>
      ) : (
        <MapView
          onPress={(e: any) => {
            console.log("data", e.nativeEvent);
            this.props.onReportFieldChange(
              e.nativeEvent.coordinate.longitude +
                "," +
                e.nativeEvent.coordinate.latitude
            );
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
            longitudeDelta: longitudeDelta
          }}
        >
          <Marker
            coordinate={{
              latitude: Number(region[1]),
              longitude: Number(region[0])
            }}
            // title={"marker"}
            // description={"this is a marker"}
          />
        </MapView>
      );
    // console.log("render---", latitudeDelta, longitudeDelta);
    const warnStyle: ViewStyle = {
      borderColor: "#ed2f31",
      borderWidth: 1
    };
    const formStyle: ViewStyle = {
      ...styles.formItemWrap,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center"
    };
    return (
      <View>
        {FieldValue ? (
          // <View style={styles.container2}>{MapViewDom}</View>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate("MapScreen", {
                FieldValue: FieldValue,
                onReportFieldChange: this.props.onReportFieldChange
              });
            }}
          >
            <View style={formStyle}>
              <Image source={location} />
              <Text style={styles.formItemWrapOText}>
                {FieldValue ? FieldValue : "Please touch to get Location"}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={getLocation}>
            <View style={isWarn ? { ...formStyle, ...warnStyle } : formStyle}>
              <Image source={location} />
              <Text style={styles.formItemWrapOText}>
                {FieldValue ? FieldValue : "Please touch to get Location"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}
