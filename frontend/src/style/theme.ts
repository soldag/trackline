import { extendTheme } from "@mui/joy/styles";

import "@fontsource/inter/200.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

declare module "@mui/joy/styles" {
  interface ShadowOverrides {
    "lg-top": true;
  }
}

declare module "@mui/joy/Button" {
  interface ButtonPropsSizeOverrides {
    xs: true;
    xl: true;
  }
}

declare module "@mui/joy/CircularProgress" {
  interface CircularProgressPropsSizeOverrides {
    xs: true;
  }
}

declare module "@mui/joy/Avatar" {
  interface AvatarPropsSizeOverrides {
    xs: true;
  }
}

export default extendTheme({
  fontWeight: {
    sm: "200",
    md: "400",
    lg: "500",
    xl: "600",
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
  components: {
    JoyAvatar: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.size === "xs" && {
            width: "var(--Avatar-size, 1.5rem)",
            height: "var(--Avatar-size, 1.5rem)",
            fontSize: "calc(var(--Avatar-size, 1.5rem) * 0.4375)",
          }),
        }),
      },
    },
    JoyCircularProgress: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.size === "xs" && {
            "--_root-size": "var(--CircularProgress-size, 20px)",
            "--_track-thickness":
              "var(--CircularProgress-trackThickness, var(--CircularProgress-thickness, 2px))",
            "--_progress-thickness":
              "var(--CircularProgress-progressThickness, var(--CircularProgress-thickness, 2px))",
          }),
        }),
      },
    },
    JoyButton: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.size === "xs" && {
            "--Icon-fontSize": "1rem",
            "--Button-gap": "0.25rem",
            "minHeight": "var(--Button-minHeight, 1.75rem)",
            "fontSize": theme.vars.fontSize.xs,
            "paddingBlock": "2px",
            "paddingInline": "0.5rem",
          }),
          ...(ownerState.size === "xl" && {
            "--Icon-fontSize": "2rem",
            "--Button-gap": "1rem",
            "minHeight": "var(--Button-minHeight, 4rem)",
            "fontSize": theme.vars.fontSize.xl,
            "paddingBlock": "0.5rem",
            "paddingInline": "2rem",
          }),
        }),
      },
    },
  },
  shadow: {
    "lg-top":
      "var(--joy-shadowRing, 0 0 #000), rgba(var(--joy-shadowChannel, 21 21 21) / var(--joy-shadowOpacity, 0.08)) 0px -4px 16px -2px, rgba(var(--joy-shadowChannel, 21 21 21) / var(--joy-shadowOpacity, 0.08)) 0px -8px 24px -4px",
  },
  unstable_sxConfig: {
    lineClamp: {
      style: ({ lineClamp }) => ({
        "display": "-webkit-box",
        "-webkit-box-orient": "vertical",
        "-webkit-line-clamp": `${lineClamp}`,
        "lineClamp": `${lineClamp}`,
        "overflow": "hidden",
      }),
    },
  },
});
