import React from "react";

const SpotifyContext = React.createContext({
  isRequired: false,
  setIsRequired: () => {},
});
export default SpotifyContext;
