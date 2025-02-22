import { createAction } from "@reduxjs/toolkit";

import { PREFIX } from "./constants";

export const resetState = createAction(`${PREFIX}/resetState`);
