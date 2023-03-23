import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import CopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import Button from "@mui/joy/Button";

const COPY_CONFIRMATION_TIMEOUT = 3000;

const ShareJoinLinkButton = ({ url, ...remainingProps }) => {
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);

  const canShareLink = !!navigator.share;
  const canCopyLink = !!navigator.clipboard;

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

ShareJoinLinkButton.propTypes = {
  ...Button.propTypes,
  url: PropTypes.string.isRequired,
};

export default ShareJoinLinkButton;
