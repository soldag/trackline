import PropTypes from "prop-types";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import screenfull from "screenfull";

import ConfirmModal from "components/common/ConfirmModal";
import FullscreenContext from "components/contexts/FullscreenContext";
import { useMountEffect } from "utils/hooks";

const isSupported = screenfull.isEnabled;
const isStandalone =
  navigator.standalone ||
  window.matchMedia("(display-mode: standalone)").matches;
const isSmallDevice = window.innerHeight <= 500;
const isPreferred = isSupported && (isStandalone || isSmallDevice);

const getIsEnabled = () => screenfull.isFullscreen;
const requestFullscreen = () => {
  screenfull.request(document.body, { navigationUI: "hide" });
};
const exitFullscreen = () => {
  screenfull.exit();
};

const FullscreenContainer = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(getIsEnabled());
  const [modalOpen, setModalOpen] = useState(false);

  useMountEffect(() => {
    if (isPreferred && !isEnabled) {
      setModalOpen(true);
    }
  });

  useMountEffect(() => {
    const listener = () => setIsEnabled(getIsEnabled());
    if (isSupported) {
      screenfull.on("change", listener);
      return () => screenfull.off(listener);
    }
  });

  return (
    <FullscreenContext.Provider
      value={{
        isFullscreenEnabled: isEnabled,
        isFullscreenSupported: isSupported,
        isFullscreenPreferred: isPreferred,
        requestFullscreen,
        exitFullscreen,
      }}
    >
      <ConfirmModal
        open={modalOpen}
        onConfirm={requestFullscreen}
        onClose={() => setModalOpen(false)}
        header={
          <FormattedMessage
            id="FullscreenContainer.modal.header"
            defaultMessage="Fullscreen mode"
          />
        }
        confirmLabel={
          <FormattedMessage
            id="FullscreenContainer.modal.confirm"
            defaultMessage="Yes"
          />
        }
        cancelLabel={
          <FormattedMessage
            id="FullscreenContainer.modal.cancel"
            defaultMessage="No"
          />
        }
      >
        <FormattedMessage
          id="FullscreenContainer.modal.message"
          defaultMessage="This app works best when in fullscreen mode. Do you want to enable it?"
        />
      </ConfirmModal>
      {children}
    </FullscreenContext.Provider>
  );
};

FullscreenContainer.propTypes = {
  children: PropTypes.node,
};

export default FullscreenContainer;
