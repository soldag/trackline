import { createAction } from "@reduxjs/toolkit";
import { createRoutine } from "redux-saga-routines";

export const login = createRoutine("AUTH/LOGIN");
export const logout = createRoutine("AUTH/LOGOUT");
export const setSessionToken = createAction("AUTH/SET_SESSION_TOKEN");
export const invalidateSession = createAction("AUTH/INVALIDATE_SESSION");

export const createUser = createRoutine("AUTH/CREATE_USER");
export const fetchCurrentUser = createRoutine("AUTH/FETCH_CURRENT_USER");
