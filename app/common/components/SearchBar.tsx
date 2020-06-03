import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
interface State {}
interface Props {
  navigation: any;
  type: string;
  mode: string;
  dataObj?: {
    initUsers: Array<string>;
    checkedUsers: Array<string>;
    handleCheckUser: Function;
  };
}

const Icon = {
  SearchIcon: require('../../assets/images/Me/search.png'),
};

export class SearchBar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View>
        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate(this.props.mode, {
              type: this.props.type,
              dataObj: this.props.dataObj,
            })
          }>
          <View style={styles.searchWrapper}>
            <Image style={styles.imageStyle} source={Icon.SearchIcon} />
            <Text style={styles.textStyle}>Search</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: 33,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  imageStyle: {
    width: 14,
    height: 13,
  },
  textStyle: {
    fontSize: 16,
    color: '#BFBFBF',
    marginLeft: 9,
  },
});
