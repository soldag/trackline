import FormValidationMessages from "translations/messages/FormValidation";

export const buildRules = (intl, rules) =>
  Object.assign(
    ...Object.entries(rules)
      .filter(([key]) => FormValidationMessages[key] != null)
      .map(([key, value]) => ({
        [key]: {
          value,
          message: intl.formatMessage(FormValidationMessages[key], { value }),
        },
      })),
  );
