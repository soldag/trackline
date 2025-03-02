import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { resetState } from "@/store/common/actions";

import { invalidateSession, setSessionToken } from "./actions";
import { createUser, fetchCurrentUser, login, logout } from "./thunks";

const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["sessionToken"],
};

const initialState = {
  isLoggedIn: null,
  user: null,
  sessionToken: null,
};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(resetState, () => ({
      ...initialState,
      isLoggedIn: false,
    }))

    .addCase(setSessionToken, (state, { payload: { token } }) => {
      state.isLoggedIn = true;
      state.sessionToken = token;
    })

    .addCase(invalidateSession, (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.sessionToken = null;
    })

    .addCase(fetchCurrentUser.fulfilled, (state, { payload: { user } }) => {
      state.isLoggedIn = true;
      state.user = user;
    })

    .addCase(logout.fulfilled, (state) => {
      state.isLoggedIn = false;
      state.user = null;
    })

    .addMatcher(
      isAnyOf(login.fulfilled, createUser.fulfilled),
      (state, { payload: { session, user } }) => {
        state.isLoggedIn = true;
        state.sessionToken = session.token;
        state.user = user;
      },
    );
});

export default persistReducer(persistConfig, reducer);
