import PropTypes from "prop-types";

import { Stack } from "@mui/joy";

const ButtonFooter = ({ children }) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    sx={{
      "& > *": {
        flex: "1 1 0",
      },
    }}
  >
    {children}
  </Stack>
);

ButtonFooter.propTypes = {
  children: PropTypes.node,
};

export default ButtonFooter;
