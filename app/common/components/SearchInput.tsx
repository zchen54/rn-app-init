import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
interface State {}
interface Props {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

const Icon = {
  SearchIcon: require('../../assets/images/Me/search.png'),
  clearIcon: require('../../assets/images/template/Close.png'),
};

export class SearchInput extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const {value, placeholder, onChange} = this.props;
    return (
      <View style={styles.searchWrapper}>
        <View style={styles.searchIconWrap}>
          <Image style={{width: 16, height: 16}} source={Icon.SearchIcon} />
        </View>
        <TextInput
          value={value}
          placeholder={placeholder || 'Search'}
          onChangeText={value => {
            onChange(value);
          }}
          style={{flex: 1}}
        />
        {value !== '' && (
          <TouchableOpacity
            onPress={() => {
              onChange('');
            }}
            style={styles.clearIconWrap}>
            <Image style={{width: 12, height: 12}} source={Icon.clearIcon} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  searchWrapper: {
    height: 40,
    paddingRight: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: '#fff',
  },
  searchIconWrap: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIconWrap: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
