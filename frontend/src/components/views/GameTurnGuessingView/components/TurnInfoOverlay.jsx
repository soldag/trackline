import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Transition } from "react-transition-group";

import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import {
  AspectRatio,
  Card,
  CardContent,
  CardOverflow,
  Modal,
  Typography,
} from "@mui/joy";

import { GameType } from "~/types/games";
import { UserType } from "~/types/users";

const HIDE_DURATION = 3000;
const TRANSITION_DURATION = 500;

const TurnInfoOverlay = ({ game, users, currentUserId }) => {
  const modelRef = useRef();
  const [isOpen, setIsOpen] = useState(false);

  const turn = game.turns.at(-1);
  const activeUser = users.find((u) => u.id === turn?.activeUserId);
  const isActivePlayer = activeUser != null && activeUser.id === currentUserId;
  const roundNumber = Math.floor(game.turns.length / game.players.length) + 1;

  useEffect(() => {
    if (turn?.activeUserId) {
      setIsOpen(true);

      const id = setTimeout(() => setIsOpen(false), HIDE_DURATION);
      return () => clearTimeout(id);
    }
  }, [turn?.activeUserId]);

  return (
    <Transition nodeRef={modelRef} in={isOpen} timeout={TRANSITION_DURATION}>
      {(state) => (
        <Modal
          ref={modelRef}
          keepMounted
          open
          onClose={() => setIsOpen(false)}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: 0,
            backdropFilter: "none",
            transition: `
              opacity ${TRANSITION_DURATION}ms ease-in-out,
              backdrop-filter ${TRANSITION_DURATION}ms ease-in-out
            `,
            ...{
              entering: { opacity: 1, backdropFilter: "blur(8px)" },
              entered: { opacity: 1, backdropFilter: "blur(8px)" },
              exiting: { opacity: 0 },
              exited: { opacity: 0 },
            }[state],
            visibility: state === "exited" ? "hidden" : "visible",
          }}
        >
          <Card
            variant="plain"
            sx={{
              "textAlign": "center",
              "alignItems": "center",
              "width": "min(400px, calc(100vw - 50px))",
              "--TurnInfoOverlay-iconSize": "100px",
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
                  width: "var(--TurnInfoOverlay-iconSize)",
                  boxShadow: "sm",
                  bgcolor: "background.surface",
                  position: "relative",
                }}
              >
                <div>
                  <HourglassBottomIcon
                    color="primary"
                    sx={{ fontSize: "4rem" }}
                  />
                </div>
              </AspectRatio>
            </CardOverflow>

            <Typography
              level="title-lg"
              sx={{ mt: "calc(var(--TurnInfoOverlay-iconSize) / 2)" }}
            >
              <FormattedMessage
                id="GameTurnGuessingView.TurnInfoOverlay.round"
                defaultMessage="Round {roundNumber}"
                values={{ roundNumber }}
              />
            </Typography>

            <CardContent>
              {isActivePlayer ? (
                <FormattedMessage
                  id="GameTurnGuessingView.TurnInfoOverlay.activeUser.active"
                  defaultMessage="It's your turn."
                />
              ) : (
                <FormattedMessage
                  id="GameTurnGuessingView.TurnInfoOverlay.activeUser.passive"
                  defaultMessage="It's {username}'s turn."
                  values={{ username: activeUser?.username }}
                />
              )}
            </CardContent>
          </Card>
        </Modal>
      )}
    </Transition>
  );
};

TurnInfoOverlay.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  game: GameType.isRequired,
  users: PropTypes.arrayOf(UserType).isRequired,
  currentUserId: PropTypes.string,
};

export default TurnInfoOverlay;
