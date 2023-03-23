import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

const YearRange = ({ min, max }) => {
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

YearRange.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
};

export default YearRange;
