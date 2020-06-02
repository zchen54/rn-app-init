import React, {Component} from 'react';
import {View} from 'react-native';
import {MultipleImagePicker} from '../../../common/components';

interface State {}
interface Props {
  FieldValue: string;
  handleImageSelect: (uri: string, response: any) => void;
  authToken: string;
  maxFiles?: number;
}

export class PictureField extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const {FieldValue, handleImageSelect, authToken, maxFiles} = this.props;
    return (
      <View style={{marginTop: 16, marginBottom: 32}}>
        <MultipleImagePicker
          pickerStyle={{width: 64, height: 64}}
          source={FieldValue}
          multiple={true}
          maxFiles={maxFiles || 1}
          handleSelect={handleImageSelect}
          authToken={authToken}
          isCollectData={true}
        />
      </View>
    );
  }
}
