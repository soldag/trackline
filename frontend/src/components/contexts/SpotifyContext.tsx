import React from "react";

interface SpotifyContextType {
  isRequired: boolean;
  setIsRequired: (value: boolean) => void;
}

const SpotifyContext = React.createContext<SpotifyContextType>({
  isRequired: false,
  setIsRequired: () => {},
});

export default SpotifyContext;
