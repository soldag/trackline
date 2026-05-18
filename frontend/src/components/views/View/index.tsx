import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Box, CircularProgress, Container, Sheet, Stack } from "@mui/joy";

import { useMountEffect } from "@/utils/hooks";

import AppBar, { AppBarProps } from "./components/AppBar";

interface ViewProps {
  appBar?: AppBarProps;
  footer?: React.ReactNode;
  disableGutters?: boolean;
  disableScrolling?: boolean;
  loading?: boolean;
}

const View = ({
  appBar,
  footer,
  disableGutters = false,
  disableScrolling = false,
  loading = false,
  children,
}: PropsWithChildren<ViewProps>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const [showFooterShadow, setShowFooterShadow] = useState(false);

  const hasFooter = !!footer;

  const updateFooterShadow = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const { clientHeight, scrollTop, scrollHeight } = scrollContainer;
      setShowFooterShadow(Math.ceil(scrollTop + clientHeight) < scrollHeight);
    }
  }, []);

  useEffect(() => {
    if (!hasFooter) return;

    const observer = new ResizeObserver(updateFooterShadow);
    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current);
    }
    if (contentContainerRef.current) {
      observer.observe(contentContainerRef.current);
    }
    return () => observer.disconnect();
  }, [hasFooter, updateFooterShadow]);

  useMountEffect(() => {
    if (hasFooter) {
      updateFooterShadow();
    }
  });

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
            flexGrow: 1,
            display: "grid",
            placeContent: "center",
          }}
        >
          <CircularProgress size="lg" thickness={6} />
        </Box>
      ) : (
        <Stack sx={{ flexGrow: 1, overflow: "hidden" }}>
          <Box
            ref={scrollContainerRef}
            onScroll={hasFooter ? updateFooterShadow : undefined}
            sx={{
              display: "flex",
              alignItems: "start",
              flexGrow: 1,
              overflowY: disableScrolling ? "visible" : "auto",
            }}
          >
            <Container
              ref={contentContainerRef}
              disableGutters={disableGutters}
              maxWidth={disableGutters ? false : "lg"}
              sx={{
                "minHeight": "100%",
                "display": "flex",
                "flexDirection": "column",
                "py": disableGutters ? 0 : 2,
                "& > *": {
                  flexGrow: 1,
                },
              }}
            >
              {children}
            </Container>
          </Box>

          {hasFooter && (
            <Box
              sx={{
                zIndex: 1,
                ...(showFooterShadow && { boxShadow: "lg-top" }),
              }}
            >
              <Container
                disableGutters={disableGutters}
                maxWidth={disableGutters ? false : "lg"}
                sx={{ py: disableGutters ? 0 : 2 }}
              >
                {footer}
              </Container>
            </Box>
          )}
        </Stack>
      )}
    </Sheet>
  );
};

export default View;
