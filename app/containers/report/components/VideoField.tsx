import React, {Component} from 'react';
import {View, Text} from 'react-native';
import {MultipleVideoPicker} from '../../../common/components';

interface State {}
interface Props {
  maxFiles?: number;
  FieldValue: string;
  durationLimit: number;
  handleVideoSelect: (uri: string) => void;
  authToken: string;
}

export class VideoField extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      FieldValue,
      handleVideoSelect,
      authToken,
      durationLimit,
      maxFiles,
    } = this.props;
    return (
      <View style={{marginTop: 16, marginBottom: 32}}>
        <MultipleVideoPicker
          maxFiles={maxFiles || 1}
          source={FieldValue}
          durationLimit={durationLimit}
          handleSelect={handleVideoSelect}
          authToken={authToken}
          isCollectData={true}
        />
      </View>
    );
  }
}
