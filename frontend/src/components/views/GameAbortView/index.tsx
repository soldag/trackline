import { Navigate } from "react-router";

import View from "@/components/views/View";

const GameAbortView = () => (
  <View appBar={{ showPlayerInfo: true, showLogout: true }}>
    {/* Redirect to home view while this is not implemented */}
    <Navigate to="/" />
  </View>
);

export default GameAbortView;
