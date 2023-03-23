import React from "react";

const FullscreenContext = React.createContext({
  isFullscreenEnabled: false,
  isFullscreenSupported: false,
  isFullscreenPreferred: false,
  requestFullscreen: () => {},
  exitFullscreen: () => {},
});
export default FullscreenContext;
