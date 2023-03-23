import { put, race, take, takeEvery } from "redux-saga/effects";

export function* ignoreError(effect, { filter, fallbackValue = null } = {}) {
  try {
    return yield effect();
  } catch (e) {
    if (!filter || filter(e)) {
      return fallbackValue;
    }
    throw e;
  }
}

function* handleAction(saga, options = {}, action) {
  const { payload } = action;
  const { cancelAction } = options;

  const tasks = { result: saga(payload) };
  if (cancelAction) {
    tasks.cancellation = take(cancelAction.toString());
  }

  try {
    const { result } = yield race(tasks);
    return result;
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error(e);
    }
    throw e;
  }
}

function* handleRoutineTrigger(actionType, saga, options = {}, action) {
  try {
    const result = yield handleAction(saga, options, action);
    yield put(actionType.success(result));
  } catch ({ code, message, ...extra }) {
    const error = {
      code,
      message,
      extra,
      trigger: action,
    };
    yield put(actionType.failure({ error }));
  } finally {
    yield put(actionType.fulfill());
  }
}

export function registerSagaHandlers(configs) {
  return configs.map((config) => {
    // For some reason the array destructuring operator doesn't work here
    const actionType = config[0];
    const saga = config[1];
    const {
      effectCreator = takeEvery,
      autoDetectRoutineTrigger = true,
      ...options
    } = config[2] || {};

    const handler =
      autoDetectRoutineTrigger && actionType.TRIGGER
        ? handleRoutineTrigger.bind(null, actionType, saga, options)
        : handleAction.bind(null, saga, options);

    return effectCreator(actionType, handler);
  });
}
