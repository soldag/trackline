import { useState } from "react";
import { FormattedMessage } from "react-intl";

import { Checkbox } from "@mui/joy";

import ConfirmModal from "@/components/common/ConfirmModal";

interface BuyTrackReminderModalProps {
  open?: boolean;
  canCatchUp: boolean;
  isGameEnding: boolean;
  onConfirm?: (disableReminder: boolean) => void;
  onClose?: () => void;
}

const BuyTrackReminderModal = ({
  open = false,
  canCatchUp,
  isGameEnding,
  onConfirm,
  onClose,
}: BuyTrackReminderModalProps) => {
  const [disableReminder, setDisableReminder] = useState(false);

  return (
    <ConfirmModal
      open={open}
      onConfirm={() => onConfirm?.(disableReminder)}
      onClose={onClose}
      header={
        <FormattedMessage
          id="GameTurnScoringView.BuyTrackReminderModal.header"
          defaultMessage="Buy track?"
        />
      }
      confirmLabel={
        <FormattedMessage
          id="GameTurnScoringView.BuyTrackReminderModal.confirmLabel"
          defaultMessage="Continue anyway"
        />
      }
    >
      {isGameEnding && canCatchUp ? (
        <FormattedMessage
          id="GameTurnScoringView.BuyTrackReminderModal.message.catchUp"
          defaultMessage="The game will end after this turn unless you spend tokens to catch up. Are you sure you want to continue without buying one?"
        />
      ) : (
        <FormattedMessage
          id="GameTurnScoringView.BuyTrackReminderModal.message.default"
          defaultMessage="You have enough tokens to add an extra track to your timeline. Are you sure you want to continue without buying one?"
        />
      )}

      {!isGameEnding && (
        <Checkbox
          variant="soft"
          checked={disableReminder}
          onChange={(e) => setDisableReminder(e.target.checked)}
          label={
            <FormattedMessage
              id="GameTurnScoringView.BuyTrackReminderModal.disableLabel"
              defaultMessage="Don't show this reminder again until your tokens change."
            />
          }
          sx={{ color: "inherit", lineHeight: 1.5, mt: 1 }}
        />
      )}
    </ConfirmModal>
  );
};

export default BuyTrackReminderModal;
