import { createAction } from "@reduxjs/toolkit";

import { PREFIX } from "./constants";

export const setTimeDeviation = createAction(`${PREFIX}/setTimeDeviation`);
