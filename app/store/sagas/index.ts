import {all, put, select, call, takeEvery} from 'redux-saga/effects';
import {LoginInit} from './login';

export default function* rootSaga() {
  yield all([LoginInit()]);
}
