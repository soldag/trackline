import { createAction } from "@reduxjs/toolkit";

import { PREFIX } from "./constants";

export interface SetSessionTokenPayload {
  token: string | null;
}
export const setSessionToken = createAction<SetSessionTokenPayload>(
  `${PREFIX}/setSessionToken`,
);

export const invalidateSession = createAction<void>(
  `${PREFIX}/invalidateSession`,
);
