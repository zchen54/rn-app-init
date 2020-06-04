import React, {Component, Fragment} from 'react';
import {Text} from 'react-native';

export * from './Button';
export * from './SingleImagePicker';
export * from './ImagePreview';
export * from './DInputWithAnimated';
export * from './VideoPlayer';
export * from './TitleBar';
export * from './PageLoading';
export * from './SignaturePad';
export * from './ActionSheet';
export * from './SearchBar';
export * from './SearchInput';
export * from './NewVersionModal';
export * from './NetworkStateBar';
export * from './TitleBarWithTabs';
export * from './MultipleImagePicker';
export * from './MultipleVideoPicker';
export * from './PlaceAutoComplete';

export const formatSearchResultText = (text: string, keyword: string) => {
  const textCharArray = text.split('');
  let keywordUpperCharArray = keyword.toUpperCase().split('');
  const textDomArray = textCharArray.map((item: string, index: number) => {
    if (
      keywordUpperCharArray.length &&
      item.toUpperCase() === keywordUpperCharArray[0]
    ) {
      keywordUpperCharArray = keywordUpperCharArray.slice(1);
      return (
        <Text key={index} style={{color: '#1E9DFC'}}>
          {item}
        </Text>
      );
    } else {
      return <Text key={index}>{item}</Text>;
    }
  });
  return <Fragment>{textDomArray}</Fragment>;
};
