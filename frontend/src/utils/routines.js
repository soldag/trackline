export const getRoutinePrefix = (action) => {
  if (typeof action === "function") {
    return action._PREFIX;
  }

  const type = typeof action === "string" ? action : action.type;
  const index = type.lastIndexOf("/");
  return index <= 0 ? type : type.substring(0, index);
};
