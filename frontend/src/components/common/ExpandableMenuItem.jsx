import PropTypes from "prop-types";

import {
  CircularProgress,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemDecorator,
} from "@mui/joy";

const ExpandableMenuItem = ({
  isExpanded,
  disabled = false,
  loading = false,
  icon,
  label,
  onClick,
  ...remainingProps
}) => (
  <ListItem {...remainingProps}>
    {isExpanded ? (
      <ListItemButton color="primary" disabled={disabled} onClick={onClick}>
        <ListItemDecorator
          sx={{
            "& svg": {
              color: (theme) => theme.vars.palette.primary.plainColor,
            },
          }}
        >
          {loading ? (
            <CircularProgress
              variant="plain"
              sx={{
                "--CircularProgress-size": "20px",
                "--CircularProgress-trackThickness": "2px",
                "--CircularProgress-progressThickness": "2px",
              }}
            />
          ) : (
            icon
          )}
        </ListItemDecorator>
        {label}
      </ListItemButton>
    ) : (
      <IconButton variant="plain" disabled={disabled} onClick={onClick}>
        {loading ? <CircularProgress variant="plain" size="sm" /> : icon}
      </IconButton>
    )}
  </ListItem>
);

ExpandableMenuItem.propTypes = {
  ...ListItem.propTypes,
  isExpanded: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node.isRequired,
  label: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

export default ExpandableMenuItem;
