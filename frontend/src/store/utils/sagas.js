import { eventChannel } from "redux-saga";
import { fork, put, race, take, takeEvery } from "redux-saga/effects";

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

export function* runWhileVisible(effect) {
  const visibilityEventChannel = eventChannel((emitter) => {
    document.addEventListener("visibilitychange", emitter);
    return () => document.removeEventListener("visibilitychange", emitter);
  });

  let task = yield fork(effect);
  try {
    while (true) {
      yield take(visibilityEventChannel);

      if (document.visibilityState === "hidden") {
        task.cancel();
      } else if (task.isCancelled) {
        task = yield fork(effect);
      }
    }
  } finally {
    task.cancel();
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
    if (import.meta.env.DEV) {
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
