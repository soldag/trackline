import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import CheckIcon from "@mui/icons-material/Check";
import CopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import { Button, ButtonProps } from "@mui/joy";

import { isMobile } from "@/utils/device";

const COPY_CONFIRMATION_TIMEOUT = 2000;

interface ShareJoinLinkButtonProps extends ButtonProps {
  url?: string;
}

const ShareJoinLinkButton = ({
  url,
  ...remainingProps
}: ShareJoinLinkButtonProps) => {
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);

  const canShareLink = !!url && !!navigator.share && isMobile();
  const canCopyLink = !!url && !!navigator.clipboard;

  let icon;
  if (canShareLink) {
    icon = <ShareIcon />;
  } else {
    icon = showCopyConfirmation ? <CheckIcon /> : <CopyIcon />;
  }

  const handleClick = () => {
    if (canShareLink) {
      navigator.share({ url }).catch((e) => {
        if (e.name !== "AbortError") {
          console.error("Failed to share join link", e);
        }
      });
    } else if (canCopyLink) {
      navigator.clipboard.writeText(url).catch((e) => {
        console.error("Failed to copy join link", e);
      });
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
      variant={showCopyConfirmation ? "solid" : remainingProps.variant}
      disabled={!canShareLink && !canCopyLink}
      startDecorator={icon}
      onClick={handleClick}
    >
      {showCopyConfirmation && (
        <FormattedMessage
          id="GameLobbyView.ShareJoinLinkButton.copy.confirmation"
          defaultMessage="Link copied!"
        />
      )}
      {!showCopyConfirmation && canShareLink && (
        <FormattedMessage
          id="GameLobbyView.ShareJoinLinkButton.share"
          defaultMessage="Share link"
        />
      )}
      {!showCopyConfirmation && !canShareLink && (
        <FormattedMessage
          id="GameLobbyView.ShareJoinLinkButton.copy"
          defaultMessage="Copy link"
        />
      )}
    </Button>
  );
};

export default ShareJoinLinkButton;
