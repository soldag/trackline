import { Link as RouterLink } from "react-router";

import {
  Box,
  Card,
  CardContent,
  ColorPaletteProp,
  Link,
  Stack,
  VariantProp,
} from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";

import { mergeSx } from "@/utils/style";

import ActionCardOverflow from "./ActionCardOverflow";
import ActionCardTitle from "./ActionCardTitle";

interface ActionCardProps {
  color?: ColorPaletteProp;
  variant?: VariantProp;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  linkTo?: string;
  sx?: SxProps;
  onClick?: () => void;
}

const ActionCard = ({
  color = "primary",
  variant = "solid",
  startDecorator,
  endDecorator,
  title,
  description,
  linkTo,
  sx,
  onClick,
}: ActionCardProps) => (
  <Card
    orientation="horizontal"
    variant={variant}
    color={color}
    invertedColors
    sx={mergeSx(sx, {
      "alignItems": "center",
      "&:hover": {
        boxShadow: "md",
        backgroundColor: `${color}.${variant}HoverBg`,
      },
      "&:active": {
        backgroundColor: `${color}.${variant}ActiveBg`,
      },
    })}
    onClick={onClick}
  >
    {startDecorator && (
      <ActionCardOverflow>{startDecorator}</ActionCardOverflow>
    )}

    <CardContent sx={{ overflow: "hidden" }}>
      <Stack direction="column" spacing={1}>
        {linkTo ? (
          <Link overlay component={RouterLink} to={linkTo} underline="none">
            <ActionCardTitle title={title} />
          </Link>
        ) : (
          <ActionCardTitle title={title} />
        )}

        {description && (
          <Box sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {description}
          </Box>
        )}
      </Stack>
    </CardContent>

    {endDecorator && <ActionCardOverflow>{endDecorator}</ActionCardOverflow>}
  </Card>
);

export default ActionCard;
