import PropTypes from "prop-types";

export const ApiErrorDetailType = PropTypes.shape({
  message: PropTypes.string.isRequired,
  location: PropTypes.string,
});

export const ApiErrorType = PropTypes.shape({
  code: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  details: PropTypes.arrayOf(ApiErrorDetailType),
});

export const ErrorType = PropTypes.shape({
  code: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  extra: PropTypes.shape({
    // API errors
    apiError: ApiErrorType,
    statusCode: PropTypes.number,
  }),
});
