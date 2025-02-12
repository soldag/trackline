export const getPossessiveForm = (name, locale) => {
  if (name == null) {
    return name;
  } else if (locale.startsWith("en")) {
    return name.endsWith("s") ? `${name}'` : `${name}'s`;
  } else if (locale.startsWith("de")) {
    return name.match(/[sxzß]$/i) ? `${name}’` : `${name}s`;
  }
  return name;
};
