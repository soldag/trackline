import { createAction } from "@reduxjs/toolkit";

import { PREFIX } from "./constants";

export const setSessionToken = createAction(`${PREFIX}/setSessionToken`);

export const invalidateSession = createAction(`${PREFIX}/invalidateSession`);
