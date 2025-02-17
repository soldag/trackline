import PropTypes from "prop-types";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import ConfirmModal from "@/components/common/ConfirmModal";
import SpotifyContext from "@/components/contexts/SpotifyContext";
import { startAuth } from "@/store/spotify/actions";

const SpotifyContainer = ({ children }) => {
  const [isRequired, setIsRequired] = useState(false);

  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.spotify.isLoggedIn);
  const needsAuth = isRequired && isLoggedIn === false;

  return (
    <SpotifyContext.Provider
      value={{
        isRequired,
        setIsRequired,
      }}
    >
      <ConfirmModal
        open={needsAuth}
        onConfirm={() => dispatch(startAuth())}
        showCancel={false}
        header={
          <FormattedMessage
            id="SpotifyContainer.authModal.header"
            defaultMessage="Connect Spotify account"
          />
        }
        confirmLabel={
          <FormattedMessage
            id="SpotifyContainer.authModal.confirm"
            defaultMessage="Connect account"
          />
        }
      >
        <FormattedMessage
          id="SpotifyContainer.authModal.message"
          defaultMessage="For playing you need to connect your Spotify account to Trackline."
        />
      </ConfirmModal>
      {children}
    </SpotifyContext.Provider>
  );
};

SpotifyContainer.propTypes = {
  children: PropTypes.node,
};

export default SpotifyContainer;
