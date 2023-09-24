import PropTypes from "prop-types";
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

import { CREDITS_STRICTNESS } from "~/constants";
import CreditsStrictnessMessages from "~/translations/messages/CreditsStrictness";

const SettingsForm = ({
  initialTokens,
  timelineLength,
  creditsStrictness,
  onInitialTokensChange,
  onTimelineLengthChange,
  onCreditsStrictnessChange,
}) => {
  const intl = useIntl();

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
            min={0}
            max={5}
            step={1}
            valueLabelDisplay="on"
            value={initialTokens}
            onChange={(e, value) => onInitialTokensChange(value)}
          />
        </Box>
        <FormHelperText>
          <FormattedMessage
            id="CreateGameView.SettingsForm.initialTokens.helpText"
            defaultMessage="Each player starts the game {value, plural, =0 {without any tokens} =1 {with#&#160;token} other {with#&#160;tokens}}."
            values={{ value: initialTokens }}
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
            min={5}
            max={20}
            step={1}
            valueLabelDisplay="on"
            value={timelineLength}
            onChange={(e, value) => onTimelineLengthChange(value)}
          />
        </Box>
        <FormHelperText>
          <FormattedMessage
            id="CreateGameView.SettingsForm.timelineLength.helpText"
            defaultMessage="The game ends when a single player has at least {value}&#160;tracks in their trackline."
            values={{ value: timelineLength }}
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
          onChange={(e, value) => onCreditsStrictnessChange(value)}
        >
          {Object.values(CREDITS_STRICTNESS).map((value) => (
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

SettingsForm.propTypes = {
  initialTokens: PropTypes.number.isRequired,
  timelineLength: PropTypes.number.isRequired,
  creditsStrictness: PropTypes.oneOf(Object.values(CREDITS_STRICTNESS))
    .isRequired,
  onInitialTokensChange: PropTypes.func.isRequired,
  onTimelineLengthChange: PropTypes.func.isRequired,
  onCreditsStrictnessChange: PropTypes.func.isRequired,
};

export default SettingsForm;
