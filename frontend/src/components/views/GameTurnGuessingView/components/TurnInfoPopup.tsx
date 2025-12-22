import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import {
  AspectRatio,
  Box,
  Card,
  CardContent,
  CardOverflow,
  Stack,
  Typography,
} from "@mui/joy";

import Popup from "@/components/common/Popup";
import { Game } from "@/types/games";
import { User } from "@/types/users";
import { getRoundNumber } from "@/utils/games";

interface TurnInfoPopupProps {
  game: Game;
  users?: User[];
  currentUserId?: string;
}

const TurnInfoPopup = ({
  game,
  users = [],
  currentUserId,
}: TurnInfoPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const roundNumber = getRoundNumber(game);
  const turn = game.turns.at(-1);
  const activeUser = users.find((u) => u.id === turn?.activeUserId);
  const isActivePlayer = activeUser != null && activeUser.id === currentUserId;

  const catchUpTokenGain = currentUserId
    ? (turn?.catchUpTokenGain?.[currentUserId] ?? 0)
    : 0;

  useEffect(() => {
    if (turn?.activeUserId) {
      setIsOpen(true);
    }
  }, [turn?.activeUserId]);

  return (
    <Popup autoClose open={isOpen} onClose={() => setIsOpen(false)}>
      <Card
        variant="plain"
        sx={{
          "outline": "none",
          "textAlign": "center",
          "alignItems": "center",
          "width": "min(400px, calc(100vw - 50px))",
          "--TurnInfoPopup-iconSize": "100px",
        }}
      >
        <CardOverflow variant="solid" color="primary">
          <AspectRatio
            variant="outlined"
            color="primary"
            ratio="1"
            sx={{
              m: "auto",
              transform: "translateY(50%)",
              borderRadius: "50%",
              width: "var(--TurnInfoPopup-iconSize)",
              boxShadow: "sm",
              bgcolor: "background.surface",
              position: "relative",
            }}
          >
            <div>
              <HourglassBottomIcon color="primary" sx={{ fontSize: "4rem" }} />
            </div>
          </AspectRatio>
        </CardOverflow>

        <Typography
          level="title-lg"
          sx={{ mt: "calc(var(--TurnInfoPopup-iconSize) / 2)" }}
        >
          <FormattedMessage
            id="GameTurnGuessingView.TurnInfoPopup.round"
            defaultMessage="Round {number}"
            values={{ number: roundNumber }}
          />
        </Typography>

        <CardContent>
          {isActivePlayer ? (
            <FormattedMessage
              id="GameTurnGuessingView.TurnInfoPopup.activeUser.active"
              defaultMessage="It's your turn."
            />
          ) : (
            <FormattedMessage
              id="GameTurnGuessingView.TurnInfoPopup.activeUser.passive"
              defaultMessage="It's {username}'s turn."
              values={{ username: activeUser?.username }}
            />
          )}
        </CardContent>

        {catchUpTokenGain > 0 && (
          <CardOverflow
            variant="solid"
            color="primary"
            sx={{ mt: 1, px: 3, py: 2 }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <WhatshotIcon sx={{ color: "white", fontSize: "3rem" }} />
              <Box sx={{ textAlign: "left" }}>
                <Typography
                  level="title-md"
                  sx={{ color: "inherit", fontWeight: "bold" }}
                >
                  <FormattedMessage
                    id="GameTurnGuessingView.TurnInfoPopup.catchUp.header"
                    defaultMessage="Catch-up bonus"
                  />
                </Typography>
                <Typography level="body-sm" sx={{ color: "inherit" }}>
                  <FormattedMessage
                    id="GameTurnGuessingView.TurnInfoPopup.catchUp.description"
                    defaultMessage="You gained {count, plural, =1 {#{nbsp}token} other {#{nbsp}tokens}}. Time for a comeback!"
                    values={{ count: catchUpTokenGain, nbsp: "\u00a0" }}
                  />
                </Typography>
              </Box>
            </Stack>
          </CardOverflow>
        )}
      </Card>
    </Popup>
  );
};

export default TurnInfoPopup;
