import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import {
  AspectRatio,
  Card,
  CardContent,
  CardOverflow,
  Typography,
} from "@mui/joy";

import Popup from "~/components/common/Popup";
import { GameType } from "~/types/games";
import { UserType } from "~/types/users";
import { getRoundNumber } from "~/utils/games";

const TurnInfoPopup = ({ game, users, currentUserId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const roundNumber = getRoundNumber(game);
  const turn = game.turns.at(-1);
  const activeUser = users.find((u) => u.id === turn?.activeUserId);
  const isActivePlayer = activeUser != null && activeUser.id === currentUserId;

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
      </Card>
    </Popup>
  );
};

TurnInfoPopup.propTypes = {
  game: GameType.isRequired,
  users: PropTypes.arrayOf(UserType).isRequired,
  currentUserId: PropTypes.string,
};

export default TurnInfoPopup;
