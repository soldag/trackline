import { PropsWithChildren } from "react";

import ReportIcon from "@mui/icons-material/Report";
import { Typography } from "@mui/joy";

const FormError = ({ children }: PropsWithChildren) => (
  <Typography color="danger" level="body-sm" startDecorator={<ReportIcon />}>
    {children}
  </Typography>
);

export default FormError;
