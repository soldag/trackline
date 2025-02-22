import { ValidationRule } from "react-hook-form";
import { IntlShape, MessageDescriptor } from "react-intl";

import FormValidationMessages from "@/translations/messages/FormValidation";

type PrimitiveRules<TFieldValue> = {
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  validate?: {
    [key: string]: {
      fn: (value: TFieldValue) => boolean;
      message: MessageDescriptor;
    };
  };
};

type LocalizedRules<TFieldValue> = {
  required?: ValidationRule<boolean>;
  min?: ValidationRule<number>;
  max?: ValidationRule<number>;
  maxLength?: ValidationRule<number>;
  minLength?: ValidationRule<number>;
  pattern?: ValidationRule<RegExp>;
  validate?: {
    [key: string]: (value: TFieldValue) => string | true;
  };
};

export const buildRules = <TFieldValue>(
  intl: IntlShape,
  rules: PrimitiveRules<TFieldValue>,
): LocalizedRules<TFieldValue> => {
  const { validate = {}, ...commonRules } = rules;

  const localizedCommonRules = Object.fromEntries(
    Object.entries(commonRules)
      .filter(([key]) => key in FormValidationMessages)
      .map(([key, value]) => [
        key,
        {
          value,
          message: intl.formatMessage(
            FormValidationMessages[key as keyof typeof FormValidationMessages],
            typeof value === "string" || typeof value === "number"
              ? { value }
              : undefined,
          ),
        },
      ]),
  );

  const localizedCustomRules = Object.fromEntries(
    Object.entries(validate).map(([key, { fn, message }]) => [
      key,
      (value: TFieldValue) => fn(value) || intl.formatMessage(message),
    ]),
  );

  return {
    ...localizedCommonRules,
    validate: localizedCustomRules,
  };
};
