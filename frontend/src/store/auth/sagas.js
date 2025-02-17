import { call, put } from "redux-saga/effects";

import tracklineApi from "@/api/trackline";
import { resetState } from "@/store/common/actions";
import { registerSagaHandlers } from "@/store/utils/sagas";

import {
  createUser,
  fetchCurrentUser,
  login,
  logout,
  setSessionToken,
} from "./actions";

function* handleSetSessionToken({ token }) {
  // Clear state when session gets invalidated
  if (!token) {
    yield put(resetState());
  }
}

function* handleLogin({ username, password }) {
  const session = yield call(tracklineApi.auth.login, { username, password });
  const user = yield call(tracklineApi.users.getCurrentUser);

  return { session, user };
}

function* handleLogout() {
  yield call(tracklineApi.auth.logout);
}

function* handleFetchCurrentUser() {
  const user = yield call(tracklineApi.users.getCurrentUser);
  return { user };
}

function* handleCreateUser({ username, password }) {
  const user = yield call(tracklineApi.users.createUser, {
    username,
    password,
  });
  const session = yield call(tracklineApi.auth.login, { username, password });

  return { user, session };
}

export default registerSagaHandlers([
  [setSessionToken, handleSetSessionToken],
  [login, handleLogin],
  [logout, handleLogout],
  [fetchCurrentUser, handleFetchCurrentUser],
  [createUser, handleCreateUser],
]);
