const isRoutineAction = (suffix, actionTypes) => (action) =>
  actionTypes.length === 0
    ? action.type.endsWith(`/${suffix}`)
    : actionTypes.some((a) => action.type === a[suffix]);

export const isTrigger = (...actionTypes) =>
  isRoutineAction("TRIGGER", actionTypes);

export const isSuccess = (...actionTypes) =>
  isRoutineAction("SUCCESS", actionTypes);

export const isFailure = (...actionTypes) =>
  isRoutineAction("FAILURE", actionTypes);

export const isFulfill = (...actionTypes) =>
  isRoutineAction("FULFILL", actionTypes);
