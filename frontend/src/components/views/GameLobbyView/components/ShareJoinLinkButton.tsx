import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import CopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import { Button, ButtonProps } from "@mui/joy";

const COPY_CONFIRMATION_TIMEOUT = 3000;

interface ShareJoinLinkButtonProps extends ButtonProps {
  url?: string;
}

const ShareJoinLinkButton = ({
  url,
  ...remainingProps
}: ShareJoinLinkButtonProps) => {
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);

  const canShareLink = !!url && !!navigator.share;
  const canCopyLink = !!url && !!navigator.clipboard;

  const handleClick = () => {
    if (canShareLink) {
      navigator.share({ url });
    } else if (canCopyLink) {
      navigator.clipboard.writeText(url);
      setShowCopyConfirmation(true);
    }
  };

  useEffect(() => {
    if (!showCopyConfirmation) return;

    const id = setTimeout(
      () => setShowCopyConfirmation(false),
      COPY_CONFIRMATION_TIMEOUT,
    );
    return () => clearTimeout(id);
  }, [showCopyConfirmation]);

  return (
    <Button
      {...remainingProps}
      disabled={!canShareLink && !canCopyLink}
      startDecorator={!canShareLink ? <CopyIcon /> : <ShareIcon />}
      onClick={handleClick}
    >
      {showCopyConfirmation && (
        <FormattedMessage
          id="GameLobbyView.ShareJoinLinkButton.copy.confirmation"
          defaultMessage="Invite link copied!"
        />
      )}
      {!showCopyConfirmation && canShareLink && (
        <FormattedMessage
          id="GameLobbyView.ShareJoinLinkButton.share"
          defaultMessage="Share invite link"
        />
      )}
      {!showCopyConfirmation && !canShareLink && (
        <FormattedMessage
          id="GameLobbyView.ShareJoinLinkButton.copy"
          defaultMessage="Copy invite link"
        />
      )}
    </Button>
  );
};

export default ShareJoinLinkButton;
