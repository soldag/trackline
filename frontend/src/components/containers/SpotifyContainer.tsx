import { PropsWithChildren, useState } from "react";
import { FormattedMessage } from "react-intl";

import ConfirmModal from "@/components/common/ConfirmModal";
import SpotifyContext from "@/components/contexts/SpotifyContext";
import { startAuth } from "@/store/spotify";
import { useAppDispatch, useAppSelector } from "@/utils/hooks";

const SpotifyContainer = ({ children }: PropsWithChildren) => {
  const [isRequired, setIsRequired] = useState(false);

  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.spotify.isLoggedIn);
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

export default SpotifyContainer;
