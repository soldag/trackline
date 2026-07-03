import { Fragment, PropsWithChildren, ReactNode, useMemo } from "react";
import { FormattedMessage } from "react-intl";

import { Box, Stack, Tooltip, Typography } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";

const COLORS = [
  "primary.100",
  "primary.200",
  "primary.300",
  "primary.400",
  "primary.500",
  "primary.600",
  "primary.700",
  "primary.800",
  "primary.900",
];

const getColor = (value: number | null | undefined) => {
  if (value == null) {
    return "neutral.100";
  }

  const index = Math.round(value * (COLORS.length - 1));
  return COLORS[index];
};

const HeatmapLegend = () => {
  const colors = [getColor(0), getColor(0.5), getColor(1)];

  return (
    <Stack direction="row" gap={1} alignItems="center">
      <Typography level="body-xs">
        <FormattedMessage
          id="StatsView.Heatmap.legend.low"
          defaultMessage="Low"
        />
      </Typography>
      <Stack direction="row" alignItems="center">
        {colors.map((color) => (
          <Box
            key={color}
            sx={{
              height: "0.8em",
              width: "0.8em",
              backgroundColor: color,
            }}
          />
        ))}
      </Stack>
      <Typography level="body-xs">
        <FormattedMessage
          id="StatsView.Heatmap.legend.high"
          defaultMessage="High"
        />
      </Typography>
    </Stack>
  );
};

interface HeatmapHeaderProps extends PropsWithChildren {
  position: "left" | "top";
}

const HeatmapHeader = ({ position, children }: HeatmapHeaderProps) => (
  <Box sx={{ alignContent: "center" }}>
    <Typography
      level="body-sm"
      textAlign={position === "left" ? "left" : "center"}
    >
      {children}
    </Typography>
  </Box>
);

interface ColorBlockProps {
  label: string;
  count: number;
  value: number | null;
  valueFormatter: (value: number | null) => string | null;
}

const ColorBlock = ({
  label,
  count,
  value,
  valueFormatter,
}: ColorBlockProps) => (
  <FormattedMessage
    id="StatsView.Heatmap.guessCount"
    defaultMessage="{count, plural, =0 {no guesses} =1 {# guess} other {# guesses}}"
    values={{ count }}
  >
    {(guessCountLabel) => (
      <Tooltip
        arrow
        title={
          value == null
            ? `${label}: ${guessCountLabel}`
            : `${label}: ${valueFormatter(value)} (${guessCountLabel})`
        }
        placement="top"
        variant="solid"
      >
        <Box
          sx={{
            aspectRatio: "1",
            backgroundColor: getColor(value),
            border: value == null ? 0.5 : 0,
            borderColor: "neutral.400",
          }}
        />
      </Tooltip>
    )}
  </FormattedMessage>
);

interface YearBlockProps<T> {
  year: number;
  data: Record<number, T>;
  countSelector: (item: T) => number;
  valueSelector: (item: T) => number | null;
  valueFormatter: (value: number | null) => string | null;
}

const YearBlock = <T,>({
  data,
  year,
  countSelector,
  valueSelector,
  valueFormatter,
}: YearBlockProps<T>) => {
  const item = data[year];
  const count = item ? countSelector(item) : 0;
  const value = item ? valueSelector(item) : null;

  return (
    <ColorBlock
      label={year.toString()}
      count={count}
      value={value}
      valueFormatter={valueFormatter}
    />
  );
};

interface DecadeBlockProps<T> {
  decade: number;
  data: Record<number, T>;
  countSelector: (item: T) => number;
  valueSelector: (item: T) => number | null;
  valueFormatter: (value: number | null) => string | null;
}

const DecadeBlock = <T,>({
  data,
  decade,
  countSelector,
  valueSelector,
  valueFormatter,
}: DecadeBlockProps<T>) => {
  let totalCount = 0;
  const values: number[] = [];
  for (const [key, item] of Object.entries(data)) {
    const year = Number(key);
    if (year < decade || year >= decade + 10) {
      continue;
    }

    const value = valueSelector(item);
    if (value == null) {
      continue;
    }

    totalCount += countSelector(item);
    values.push(value);
  }

  const avgValue =
    values.length > 0
      ? values.reduce((acc, curr) => acc + curr, 0) / values.length
      : null;

  return (
    <FormattedMessage
      id="StatsView.Heatmap.decade"
      defaultMessage="{decade}s"
      values={{ decade }}
    >
      {([label]) => (
        <ColorBlock
          label={label as string}
          count={totalCount}
          value={avgValue}
          valueFormatter={valueFormatter}
        />
      )}
    </FormattedMessage>
  );
};

interface HeatmapProps<T> {
  title: ReactNode;
  data: Record<number, T>;
  countSelector: (item: T) => number;
  valueSelector: (item: T) => number | null;
  valueFormatter: (value: number | null) => string | null;
  sx?: SxProps;
}

const Heatmap = <T,>({
  title,
  data,
  countSelector,
  valueSelector,
  valueFormatter,
  sx,
}: HeatmapProps<T>) => {
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const minYear = Math.min(...Object.keys(data).map(Number));
    const start = minYear - (minYear % 10);
    const end = Math.ceil(currentYear / 10) * 10;
    return Array.from({ length: end - start }, (_, i) => start + i);
  }, [data]);

  return (
    <Stack gap={2} sx={sx}>
      <Stack direction="row" justifyContent="space-between">
        <Typography level="title-sm">{title}</Typography>
        <HeatmapLegend />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "40px repeat(10, minmax(0, 1fr)) 0px 1fr",
          gap: 1,
        }}
      >
        <Box />
        {Array.from({ length: 10 }, (_, i) => i).map((i) => (
          <HeatmapHeader key={i} position="top">
            {i.toString().padStart(2, "0")}
          </HeatmapHeader>
        ))}
        <Box />
        <HeatmapHeader position="top">⌀</HeatmapHeader>

        {years.map((year) => (
          <Fragment key={year}>
            {year % 10 === 0 && (
              <HeatmapHeader position="left">{year}</HeatmapHeader>
            )}

            <YearBlock
              data={data}
              year={year}
              countSelector={countSelector}
              valueSelector={valueSelector}
              valueFormatter={valueFormatter}
            />

            {year % 10 === 9 && (
              <>
                <Box />
                <DecadeBlock
                  data={data}
                  decade={Math.floor(year / 10) * 10}
                  countSelector={countSelector}
                  valueSelector={valueSelector}
                  valueFormatter={valueFormatter}
                />
              </>
            )}
          </Fragment>
        ))}
      </Box>
    </Stack>
  );
};

export default Heatmap;
