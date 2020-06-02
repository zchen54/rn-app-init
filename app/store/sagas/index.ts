import { all, put, select, call, takeEvery } from "redux-saga/effects";
import { LoginInit } from "./login";
import { TemplateInit } from "./template";
import { ReportInit } from "./report";
import { FriendsInit } from "./friend";
import { MessageInit } from "./message";
import { GroupsInit } from "./group";
import { CompanyInit } from "./company";
import { DynamicInit } from "./dynamic";

export default function* rootSaga() {
  yield all([
    LoginInit(),
    TemplateInit(),
    ReportInit(),
    FriendsInit(),
    MessageInit(),
    GroupsInit(),
    CompanyInit(),
    DynamicInit()
  ]);
}
