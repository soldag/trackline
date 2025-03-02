import { createAction } from "@reduxjs/toolkit";

import { PREFIX } from "./constants";

export const dismissError = createAction(`${PREFIX}/dismiss`);

export const dismissAllErrors = createAction(`${PREFIX}/dismissAll`);
