import {CommonActions} from '@react-navigation/native';

let _navigator: any;

function setTopLevelNavigator(navigatorRef: any) {
  _navigator = navigatorRef;
}

function navigate(routeName: string, params?: any) {
  console.log('navigate---', routeName);
  _navigator.dispatch(
    CommonActions.navigate({
      name: routeName,
      params,
    }),
  );
}
// add other navigation functions that you need and export them

export default {
  navigate,
  setTopLevelNavigator,
};
