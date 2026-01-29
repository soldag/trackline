import { FormattedMessage } from "react-intl";

import { Alert } from "@mui/joy";

import ConfirmModal, {
  ConfirmModalProps,
} from "@/components/common/ConfirmModal";

interface GuessModalProps extends ConfirmModalProps {
  isActivePlayer?: boolean;
  playerTokens?: number;
}

const GuessModal = ({
  playerTokens,
  tokenCost,
  children,
  ...remainingProps
}: GuessModalProps) => {
  const showTokenWarning =
    playerTokens != null &&
    tokenCost != null &&
    tokenCost > 0 &&
    tokenCost >= playerTokens;

  return (
    <ConfirmModal tokenCost={tokenCost} {...remainingProps}>
      {children}
      {showTokenWarning && (
        <Alert color="warning" sx={{ mt: 2 }}>
          <FormattedMessage
            id="GameTurnGuessingView.GuessModal.tokenWarning"
            defaultMessage="You have only {count, plural, =1 {#{nbsp}token} other {#{nbsp}tokens}} left. If you're wrong, you won't be able to challenge other players until you earn new tokens."
            values={{ count: playerTokens, nbsp: "\u00A0" }}
          />
        </Alert>
      )}
    </ConfirmModal>
  );
};

export default GuessModal;
