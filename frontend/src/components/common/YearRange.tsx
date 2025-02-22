import { FormattedMessage } from "react-intl";

interface YearRangeProps {
  min?: number;
  max?: number;
}

const YearRange = ({ min, max }: YearRangeProps) => {
  if (min != null && max != null) {
    if (min === max) {
      return min;
    }
    return (
      <FormattedMessage
        id="YearRange.betweenYears"
        defaultMessage="{min} - {max}"
        values={{ min, max }}
      />
    );
  } else if (min != null) {
    return (
      <FormattedMessage
        id="YearRange.afterYear"
        defaultMessage="{min} or later"
        values={{ min }}
      />
    );
  } else if (max != null) {
    return (
      <FormattedMessage
        id="YearRange.beforeYear"
        defaultMessage="{max} or earlier"
        values={{ max }}
      />
    );
  }
};

export default YearRange;
