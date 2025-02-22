import {
  CircularProgress,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  ListItemProps,
} from "@mui/joy";

interface ExpandableMenuItemProps extends ListItemProps {
  isExpanded: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick?: () => void;
}

const ExpandableMenuItem = ({
  isExpanded,
  disabled = false,
  loading = false,
  icon,
  label,
  onClick,
  ...remainingProps
}: ExpandableMenuItemProps) => (
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
      <IconButton color="primary" disabled={disabled} onClick={onClick}>
        {loading ? <CircularProgress variant="plain" size="sm" /> : icon}
      </IconButton>
    )}
  </ListItem>
);

export default ExpandableMenuItem;
