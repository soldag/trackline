import { Navigate } from "react-router-dom";

import View from "~/components/views/View";

const GameAbortView = () => {
  return (
    <View appBar={{ showPlayerInfo: true, showLogout: true }}>
      {/* Redirect to home view while this is not implemented */}
      <Navigate to="/" />
    </View>
  );
};

export default GameAbortView;
