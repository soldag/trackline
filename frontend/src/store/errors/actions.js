import { createAction } from "@reduxjs/toolkit";

export const dismissError = createAction("ERRORS/DISMISS");
export const dismissAllErrors = createAction("ERRORS/DISMISS_ALL");
