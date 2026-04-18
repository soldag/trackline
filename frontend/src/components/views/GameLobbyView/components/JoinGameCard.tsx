import { useState } from "react";
import { FormattedMessage } from "react-intl";

import { Box, Card, CardContent, Divider, Stack, Typography } from "@mui/joy";

import ResponsiveQrCode from "@/components/common/ResponsiveQrCode";
import QrCodeModal from "@/components/views/GameLobbyView/components/QrCodeModal";
import ShareJoinLinkButton from "@/components/views/GameLobbyView/components/ShareJoinLinkButton";
import { JOIN_URL_PATTERN } from "@/constants";

const getJoinUrl = (joinCode: string) => {
  const path = JOIN_URL_PATTERN.replace(":joinCode", joinCode);
  const url = new URL(path, document.location.origin);
  return url.toString();
};

interface JoinGameCardProps {
  joinCode: string;
}

const JoinGameCard = ({ joinCode }: JoinGameCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const joinUrl = getJoinUrl(joinCode);

  return (
    <Card color="primary" variant="soft">
      <QrCodeModal
        joinUrl={joinUrl}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <CardContent>
        <Typography color="neutral" level="body-sm">
          <FormattedMessage
            id="GameLobbyView.JoinGameCard.code"
            defaultMessage="Code"
          />
        </Typography>
        <Stack direction="row" alignItems="center" gap={2}>
          <Typography
            color="primary"
            level="title-lg"
            fontSize="2.5em"
            fontWeight="xl"
          >
            {joinCode}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" alignItems="center" gap={2}>
          <Box sx={{ backgroundColor: "white", borderRadius: "md", p: 1.5 }}>
            <ResponsiveQrCode
              data={joinUrl}
              sx={{ maxWidth: "128px", cursor: "pointer" }}
              onClick={() => setIsModalOpen(true)}
            />
          </Box>
          <Stack direction="column" alignItems="start" gap={1}>
            <Typography color="neutral" level="body-sm">
              <FormattedMessage
                id="GameLobbyView.JoinGameCard.scanInstructions"
                defaultMessage="Or can this QR code to join the game."
              />
            </Typography>
            <ShareJoinLinkButton
              color="primary"
              variant="plain"
              url={joinUrl}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default JoinGameCard;
