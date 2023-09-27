import "@fontsource/inter/200.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

import { extendTheme } from "@mui/joy/styles";

export default extendTheme({
  vars: {
    fontWeight: {
      sm: "200",
      md: "400",
      lg: "500",
      xl: "600",
    },
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          plainDisabledColor: `var(--joy-palette-primary-200)`,
          outlinedDisabledColor: `var(--joy-palette-primary-100)`,
          outlinedDisabledBorder: `var(--joy-palette-primary-100)`,
          softDisabledColor: `var(--joy-palette-primary-300)`,
          softDisabledBg: `var(--joy-palette-primary}-)50`,
          solidDisabledColor: `#fff`,
          solidDisabledBg: `var(--joy-palette-primary-200)`,
        },
        neutral: {
          plainDisabledColor: `var(--joy-palette-neutral-300)`,
          outlinedDisabledColor: `var(--joy-palette-neutral-300)`,
          outlinedDisabledBorder: `var(--joy-palette-neutral-100)`,
          softDisabledColor: `var(--joy-palette-neutral-300)`,
          softDisabledBg: `var(--joy-palette-neutral-50)`,
          solidDisabledColor: `var(--joy-palette-neutral-300)`,
          solidDisabledBg: `var(--joy-palette-neutral-50)`,
        },
        danger: {
          plainDisabledColor: `var(--joy-palette-danger-200)`,
          outlinedDisabledColor: `var(--joy-palette-danger-100)`,
          outlinedDisabledBorder: `var(--joy-palette-danger-100)`,
          softDisabledColor: `var(--joy-palette-danger-300)`,
          softDisabledBg: `var(--joy-palette-danger}-)50`,
          solidDisabledColor: `#fff`,
          solidDisabledBg: `var(--joy-palette-danger-200)`,
        },
        success: {
          plainDisabledColor: `var(--joy-palette-success-200)`,
          outlinedDisabledColor: `var(--joy-palette-success-100)`,
          outlinedDisabledBorder: `var(--joy-palette-success-100)`,
          softDisabledColor: `var(--joy-palette-success-300)`,
          softDisabledBg: `var(--joy-palette-success}-)50`,
          solidDisabledColor: `#fff`,
          solidDisabledBg: `var(--joy-palette-success-200)`,
        },
        warning: {
          plainDisabledColor: `var(--joy-palette-warning-200)`,
          outlinedDisabledColor: `var(--joy-palette-warning-100)`,
          outlinedDisabledBorder: `var(--joy-palette-warning-100)`,
          softDisabledColor: `var(--joy-palette-warning-200)`,
          softDisabledBg: `var(--joy-palette-warning-50)`,
          solidDisabledColor: `var(--joy-palette-warning-200)`,
          solidDisabledBg: `var(--joy-palette-warning-50)`,
        },
      },
    },
    dark: {
      palette: {
        primary: {
          plainDisabledColor: `var(--joy-palette-primary-800)`,
          outlinedDisabledColor: `var(--joy-palette-primary-800)`,
          outlinedDisabledBorder: `var(--joy-palette-primary-800)`,
          softDisabledColor: `var(--joy-palette-primary-800)`,
          softDisabledBg: `var(--joy-palette-primary-900)`,
          solidDisabledColor: `var(--joy-palette-primary-700)`,
          solidDisabledBg: `var(--joy-palette-primary-900)`,
        },
        neutral: {
          plainDisabledColor: `var(--joy-palette-neutral-700)`,
          outlinedDisabledColor: `var(--joy-palette-neutral-800)`,
          outlinedDisabledBorder: `var(--joy-palette-neutral-800)`,
          softDisabledColor: `var(--joy-palette-neutral-700)`,
          softDisabledBg: `var(--joy-palette-neutral-900)`,
          solidDisabledColor: `var(--joy-palette-neutral-700)`,
          solidDisabledBg: `var(--joy-palette-neutral-900)`,
        },
        danger: {
          plainDisabledColor: `var(--joy-palette-danger-800)`,
          outlinedDisabledColor: `var(--joy-palette-danger-800)`,
          outlinedDisabledBorder: `var(--joy-palette-danger-800)`,
          softDisabledColor: `var(--joy-palette-danger-800)`,
          softDisabledBg: `var(--joy-palette-danger-900)`,
          solidDisabledColor: `var(--joy-palette-danger-700)`,
          solidDisabledBg: `var(--joy-palette-danger-900)`,
        },
        success: {
          plainDisabledColor: `var(--joy-palette-success-800)`,
          outlinedDisabledColor: `var(--joy-palette-success-800)`,
          outlinedDisabledBorder: `var(--joy-palette-success-800)`,
          softDisabledColor: `var(--joy-palette-success-800)`,
          softDisabledBg: `var(--joy-palette-success-900)`,
          solidDisabledColor: `var(--joy-palette-success-700)`,
          solidDisabledBg: `var(--joy-palette-success-900)`,
        },
        warning: {
          plainDisabledColor: `var(--joy-palette-warning-800)`,
          outlinedDisabledColor: `var(--joy-palette-warning-800)`,
          outlinedDisabledBorder: `var(--joy-palette-warning-800)`,
          softDisabledColor: `var(--joy-palette-warning-800)`,
          softDisabledBg: `var(--joy-palette-warning-900)`,
          solidDisabledColor: `var(--joy-palette-warning-700)`,
          solidDisabledBg: `var(--joy-palette-warning-900)`,
        },
      },
    },
  },
});
