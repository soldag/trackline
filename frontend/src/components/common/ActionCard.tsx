import {
  Card,
  CardContent,
  CardOverflow,
  ColorPaletteProp,
  Typography,
  VariantProp,
} from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";

import { mergeSx } from "@/utils/style";

interface ActionCardProps {
  color?: ColorPaletteProp;
  variant?: VariantProp;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  sx?: SxProps;
}

const ActionCard = ({
  color = "primary",
  variant = "solid",
  startDecorator,
  endDecorator,
  title,
  description,
  sx,
}: ActionCardProps) => (
  <Card
    orientation="horizontal"
    variant={variant}
    color={color}
    invertedColors
    sx={mergeSx(sx, {
      "&:hover": {
        boxShadow: "md",
        backgroundColor: `${color}.${variant}HoverBg`,
      },
      "&:active": {
        backgroundColor: `${color}.${variant}ActiveBg`,
      },
    })}
  >
    {startDecorator && (
      <CardOverflow
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          pl: "var(--Card-padding)",
          fontSize: "2rem",
        }}
      >
        {startDecorator}
      </CardOverflow>
    )}

    <CardContent sx={{ gap: 1 }}>
      {title && <Typography level="title-lg">{title}</Typography>}
      {description && <Typography>{description}</Typography>}
    </CardContent>

    {endDecorator && (
      <CardOverflow
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          pr: "var(--Card-padding)",
          fontSize: "2rem",
        }}
      >
        {endDecorator}
      </CardOverflow>
    )}
  </Card>
);

export default ActionCard;
