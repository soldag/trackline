import AppNavigate from "@/components/common/AppNavigate";
import View from "@/components/views/View";

const GameAbortView = () => (
  <View appBar={{ showPlayerInfo: true, showLogout: true }}>
    {/* Redirect to home view while this is not implemented */}
    <AppNavigate replace to="/" />
  </View>
);

export default GameAbortView;
