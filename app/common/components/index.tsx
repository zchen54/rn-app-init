import React, {Component, Fragment} from 'react';
import {Text} from 'react-native';

export * from './Button';
export * from './DImagePicker';
export * from './DImagePreview';
export * from './DInputWithAnimated';
export * from './DMoviePlayer';
export * from './DTabs';
export * from './DVideoPicker';
export * from './TitleBar';
export * from './TitleBarNew';
export * from './PageLoading';
export * from './DSignaturePad';
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
