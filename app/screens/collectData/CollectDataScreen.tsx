import React from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from 'react-native';
import {Toast, Icon, Modal, Button} from '@ant-design/react-native';
import {openActionSheet} from '../../store/actions';

interface Props {
  dispatch: any;
}

const CollectDataScreen = (props: Props) => {
  const {dispatch} = props;

  const actionsMock = [
    {
      text: 'Share',
      onPress: () => {
        console.log('press share');
      },
    },
    {
      text: 'Delete',
      color: 'red',
      onPress: () => {
        console.log('press delete');
      },
    },
  ];

  return (
    <SafeAreaView style={{flex: 1}}>
      <Text>This is top text.</Text>
      <Button
        onPress={() => {
          dispatch(openActionSheet(actionsMock));
        }}>
        Open ActionSheet
      </Button>
      <Text>This is bottom text.</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
  };
};

export default connect(mapStateToProps)(CollectDataScreen);
