import { createAction } from "@reduxjs/toolkit";

import { PREFIX } from "./constants";

interface DismissErrorPayload {
  typePrefix: string;
}
export const dismissError = createAction<DismissErrorPayload>(
  `${PREFIX}/dismiss`,
);

export const dismissAllErrors = createAction(`${PREFIX}/dismissAll`);
