import { Global, css } from "@emotion/react";
import { Toaster } from "sonner";

import { useTheme } from "@mui/joy";

const JoyToaster = () => {
  const theme = useTheme();

  return (
    <>
      <Global
        styles={css`
          .sonner-toast {
            --normal-bg: ${theme.vars.palette.primary.softBg};
            --normal-border: ${theme.vars.palette.primary.outlinedBorder};
            --normal-text: ${theme.vars.palette.text.primary};
            --success-bg: ${theme.vars.palette.success.solidBg};
            --success-border: ${theme.vars.palette.success.outlinedBorder};
            --success-text: ${theme.vars.palette.success.solidColor};
            --error-bg: ${theme.vars.palette.danger.solidBg};
            --error-border: ${theme.vars.palette.danger.outlinedBorder};
            --error-text: ${theme.vars.palette.danger.solidColor};
            font-family: ${theme.fontFamily};
            font-size: ${theme.fontSize.md};
          }
        `}
      />
      <Toaster richColors closeButton className="sonner-toast" />
    </>
  );
};

export default JoyToaster;
