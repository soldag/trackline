import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import PinIcon from "@mui/icons-material/Pin";
import { Button, Stack, Typography } from "@mui/joy";

import FormError from "@/components/common/FormError";
import JoinCodeInput from "@/components/views/JoinGameView/components/JoinCodeInput";
import { JOIN_CODE_LENGTH } from "@/constants";
import { AppError } from "@/types/errors";
import { getErrorMessage } from "@/utils/errors";

interface ManualInputSection {
  error?: AppError;
  loading?: boolean;
  onSubmit: (joinCode: string) => void;
}

const ManualInputSection = ({
  error,
  loading,
  onSubmit,
}: ManualInputSection) => {
  const intl = useIntl();

  const [joinCode, setJoinCode] = useState("");

  const handleSubmit = () => {
    onSubmit(joinCode);
  };

  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        flex: { xs: "0 0 auto", sm: "1 1 0" },
        overflow: "hidden",
      }}
    >
      <Stack spacing={1}>
        <Typography
          level="title-md"
          startDecorator={<PinIcon color="primary" />}
        >
          <FormattedMessage
            id="JoinGameView.ManualInputSection.header"
            defaultMessage="Enter game code"
          />
        </Typography>
        <Typography level="body-sm">
          <FormattedMessage
            id="JoinGameView.ManualInputSection.description"
            defaultMessage="Enter the five-character game code manually to join the game."
          />
        </Typography>
      </Stack>

      <Stack spacing={0.75}>
        <JoinCodeInput
          disabled={loading}
          error={!!error}
          value={joinCode}
          onChange={setJoinCode}
          onSubmit={handleSubmit}
        />
        {error && <FormError>{getErrorMessage(intl, error)}</FormError>}
      </Stack>

      <Button
        color="primary"
        loading={loading}
        disabled={loading || joinCode.length < JOIN_CODE_LENGTH}
        onClick={handleSubmit}
      >
        <FormattedMessage
          id="JoinGameView.joinCode.submit"
          defaultMessage="Join game"
        />
      </Button>
    </Stack>
  );
};

export default ManualInputSection;
