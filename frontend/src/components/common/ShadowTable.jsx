import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";

const ShadowTable = (props) => (
  <Sheet
    sx={{
      height: "100%",
      overflow: "auto",
      background: (theme) =>
        `linear-gradient(${theme.vars.palette.background.surface} 30%, rgba(255, 255, 255, 0)),
            linear-gradient(rgba(255, 255, 255, 0), ${theme.vars.palette.background.surface} 70%) 0 100%,
            radial-gradient(
              farthest-side at 50% 0,
              rgba(0, 0, 0, 0.12),
              rgba(0, 0, 0, 0)
            ),
            radial-gradient(
                farthest-side at 50% 100%,
                rgba(0, 0, 0, 0.12),
                rgba(0, 0, 0, 0)
              )
              0 100%`,
      backgroundSize: "100% 40px, 100% 40px, 100% 14px, 100% 14px",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "local, local, scroll, scroll",
      backgroundPosition: "0 40px, 0 100%, 0 40px, 0 100%",
      backgroundColor: "background.surface",
    }}
  >
    <Table stickyHeader {...props} />
  </Sheet>
);

ShadowTable.propTypes = Table.propTypes;

export default ShadowTable;
