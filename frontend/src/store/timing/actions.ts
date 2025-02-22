import { createAction } from "@reduxjs/toolkit";

import { ServiceType } from "@/types/api";

import { PREFIX } from "./constants";

interface SetTimeDeviationPayload {
  service: ServiceType;
  value: number;
}
export const setTimeDeviation = createAction<SetTimeDeviationPayload>(
  `${PREFIX}/setTimeDeviation`,
);
