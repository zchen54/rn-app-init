'use strict';
import {Store, createStore, applyMiddleware, compose} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import {createLogger} from 'redux-logger';
import createSagaMiddleware from 'redux-saga';

import {rootReducer} from './reducers';
import rootSaga from './sagas';
// import Reactotron from '../../ReactotronConfig';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  // blacklist: ['report'],
  timeout: null,
};
const reducer = persistReducer(persistConfig, rootReducer);

let middleware = [];

// redux saga config
const sagaMiddleware = createSagaMiddleware();
middleware.push(sagaMiddleware);

// redux logger config
if (__DEV__) {
  const logger = createLogger({
    level: 'info',
    collapsed: true,
  });
  middleware.push(logger);
}

const enhancer = compose(
  applyMiddleware(...middleware),
  // Reactotron.createEnhancer(),
);

export const store = createStore(reducer, {}, enhancer);
export const persistor = persistStore(store);

sagaMiddleware.run(rootSaga);
