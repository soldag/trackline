export const getRoutinePrefix = (action) => {
  if (typeof action === "function") {
    return action._PREFIX;
  }

  const { type } = action;
  const index = type.lastIndexOf("/");
  return index <= 0 ? type : type.substring(0, index);
};
