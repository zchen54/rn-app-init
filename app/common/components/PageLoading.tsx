import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
// import Spinner from "react-native-spinkit";
// let Spinner = require("react-native-spinkit");

interface Props {
  backgroundColor?: string;
}

export const PageLoading = (props: Props) => {
  const {backgroundColor} = props;
  return (
    <View style={[styles.container, {backgroundColor}]}>
      {/* <Spinner
          style={styles.spinner}
          type={"ThreeBounce"}
          size={70}
          color={"#eb842d"}
        /> */}
      <Text>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d35400',
  },
  spinner: {
    marginBottom: 50,
  },
});
