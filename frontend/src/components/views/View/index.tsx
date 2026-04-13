import { PropsWithChildren, useCallback } from "react";
import { useNavigate } from "react-router";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  CircularProgress,
  Container,
  IconButton,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";

import { dismissAllErrors } from "@/store/errors";
import { useAppDispatch } from "@/utils/hooks";

import AppBar, { AppBarProps } from "./components/AppBar";

interface ViewProps {
  appBar?: AppBarProps;
  header?: React.ReactNode;
  disableGutters?: boolean;
  disableScrolling?: boolean;
  loading?: boolean;
  backButton?: boolean;
}

const View = ({
  appBar,
  header,
  disableGutters = false,
  disableScrolling = false,
  loading = false,
  backButton = false,
  children,
}: PropsWithChildren<ViewProps>) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    dispatch(dismissAllErrors());
    navigate(-1);
  }, [dispatch, navigate]);

  return (
    <Sheet
      sx={{
        height: "100dvh",
        width: "100dvw",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        overscrollBehavior: "none",
        boxSizing: "border-box",
      }}
    >
      {appBar && <AppBar {...appBar} />}

      {loading ? (
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "calc(100% - 66px)",
            top: "66px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffffb0",
          }}
        >
          <CircularProgress size="lg" thickness={6} />
        </Box>
      ) : (
        <Container
          disableGutters={disableGutters}
          maxWidth={disableGutters ? false : "lg"}
          sx={{
            "display": "flex",
            "flexDirection": "column",
            "flexGrow": 1,
            ...(!disableGutters && { py: 2 }),
            ...(!disableScrolling && { overflowY: "auto" }),
            "& > *": {
              flexGrow: 1,
            },
          }}
        >
          {(backButton || header) && (
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              sx={{ flexGrow: 0, mb: 2 }}
            >
              {backButton && (
                <IconButton size="sm" onClick={handleBack}>
                  <ArrowBackIcon />
                </IconButton>
              )}
              <Typography level="title-lg">{header}</Typography>
            </Stack>
          )}
          {children}
        </Container>
      )}
    </Sheet>
  );
};

export default View;
