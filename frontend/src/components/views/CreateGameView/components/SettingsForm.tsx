import { FormattedMessage, useIntl } from "react-intl";

import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Option,
  Select,
  Slider,
  Stack,
} from "@mui/joy";

import {
  MAX_INITIAL_TOKENS,
  MAX_MAX_TOKENS,
  MAX_TIMELINE_LENGTH,
  MIN_INITIAL_TOKENS,
  MIN_MAX_TOKENS,
  MIN_TIMELINE_LENGTH,
} from "@/constants";
import CreditsStrictnessMessages from "@/translations/messages/CreditsStrictness";
import { CreditsStrictness } from "@/types/games";

interface SettingsFormProps {
  initialTokens: number;
  maxTokens: number;
  timelineLength: number;
  creditsStrictness: CreditsStrictness;
  onInitialTokensChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
  onTimelineLengthChange: (value: number) => void;
  onCreditsStrictnessChange: (value: CreditsStrictness) => void;
}

const SettingsForm = ({
  initialTokens,
  maxTokens,
  timelineLength,
  creditsStrictness,
  onInitialTokensChange,
  onMaxTokensChange,
  onTimelineLengthChange,
  onCreditsStrictnessChange,
}: SettingsFormProps) => {
  const intl = useIntl();

  const handleMaxTokensChange = (value: number) => {
    onMaxTokensChange(value);

    if (value < initialTokens) {
      onInitialTokensChange(value);
    }
  };

  return (
    <Stack spacing={2} sx={{ overflow: "auto" }}>
      <FormControl>
        <FormLabel>
          <FormattedMessage
            id="CreateGameView.SettingsForm.initialTokens.label"
            defaultMessage="Initial tokens"
          />
        </FormLabel>
        <Box
          sx={{
            px: "15px",
            pt: "17px",
            mb: "-12px",
          }}
        >
          <Slider
            marks
            variant="soft"
            min={MIN_INITIAL_TOKENS}
            max={Math.min(maxTokens, MAX_INITIAL_TOKENS)}
            step={1}
            valueLabelDisplay="on"
            value={initialTokens}
            onChange={(_, value) => onInitialTokensChange(value as number)}
          />
        </Box>
        <FormHelperText>
          <FormattedMessage
            id="CreateGameView.SettingsForm.initialTokens.helpText"
            defaultMessage="Each player starts the game {value, plural, =0 {without any tokens} =1 {with #{nbsp}token} other {with #{nbsp}tokens}}."
            values={{ value: initialTokens, nbsp: "\u00a0" }}
          />
        </FormHelperText>
      </FormControl>
      <FormControl>
        <FormLabel>
          <FormattedMessage
            id="CreateGameView.SettingsForm.maxTokens.label"
            defaultMessage="Token limit"
          />
        </FormLabel>
        <Box
          sx={{
            px: "15px",
            pt: "17px",
            mb: "-12px",
          }}
        >
          <Slider
            marks
            variant="soft"
            min={MIN_MAX_TOKENS}
            max={MAX_MAX_TOKENS}
            step={1}
            valueLabelDisplay="on"
            value={maxTokens}
            onChange={(_, value) => handleMaxTokensChange(value as number)}
          />
        </Box>
        <FormHelperText>
          <FormattedMessage
            id="CreateGameView.SettingsForm.maxTokens.helpText"
            defaultMessage="Players cannot have more than {value, plural, =1 {with #{nbsp}token} other {with #{nbsp}tokens}}."
            values={{ value: maxTokens, nbsp: "\u00a0" }}
          />
        </FormHelperText>
      </FormControl>
      <FormControl>
        <FormLabel>
          <FormattedMessage
            id="CreateGameView.SettingsForm.timelineLength.label"
            defaultMessage="End of game"
          />
        </FormLabel>
        <Box
          sx={{
            px: "15px",
            pt: "17px",
            mb: "-12px",
          }}
        >
          <Slider
            marks
            variant="soft"
            min={MIN_TIMELINE_LENGTH}
            max={MAX_TIMELINE_LENGTH}
            step={1}
            valueLabelDisplay="on"
            value={timelineLength}
            onChange={(_, value) => onTimelineLengthChange(value as number)}
          />
        </Box>
        <FormHelperText>
          <FormattedMessage
            id="CreateGameView.SettingsForm.timelineLength.helpText"
            defaultMessage="The game ends when a single player has at least {value}{nbsp}tracks in their trackline."
            values={{ value: timelineLength, nbsp: "\u00a0" }}
          />
        </FormHelperText>
      </FormControl>
      <FormControl>
        <FormLabel>
          <FormattedMessage
            id="CreateGameView.SettingsForm.creditsStrictness.label"
            defaultMessage="Accuracy of artist names and title"
          />
        </FormLabel>
        <Select
          variant="soft"
          value={creditsStrictness}
          onChange={(_, value) =>
            onCreditsStrictnessChange(value as CreditsStrictness)
          }
        >
          {Object.values(CreditsStrictness).map((value) => (
            <Option key={value} value={value}>
              {intl.formatMessage(CreditsStrictnessMessages.labels[value])}
            </Option>
          ))}
        </Select>
        <FormHelperText>
          <span>
            {intl.formatMessage(
              CreditsStrictnessMessages.descriptions[creditsStrictness],
              {
                bold: (chunks) => <strong>{chunks}</strong>,
              },
            )}
          </span>
        </FormHelperText>
      </FormControl>
    </Stack>
  );
};

export default SettingsForm;
