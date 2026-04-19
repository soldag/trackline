import { Route, Routes } from "react-router";

import AppNavigate from "@/components/common/AppNavigate";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import GameContainer from "@/components/containers/GameContainer";
import CreateGameView from "@/components/views/CreateGameView";
import HomeView from "@/components/views/HomeView";
import JoinGameLinkView from "@/components/views/JoinGameLinkView";
import JoinGameView from "@/components/views/JoinGameView";
import LoginView from "@/components/views/LoginView";
import RegisterView from "@/components/views/RegisterView";
import SpotifyCallbackView from "@/components/views/SpotifyCallbackView";
import StatsView from "@/components/views/StatsView";

const RoutingContainer = () => (
  <Routes>
    <Route path="login" element={<LoginView />} />
    <Route path="register" element={<RegisterView />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<HomeView />} />

      <Route path="games">
        <Route path="new" element={<CreateGameView />} />
        <Route path="join" element={<JoinGameView />} />
        <Route path="join/:joinCode?" element={<JoinGameLinkView />} />
        <Route path=":gameId" element={<GameContainer />} />
      </Route>

      <Route path="stats" element={<StatsView />} />

      <Route path="spotify">
        <Route path="callback" element={<SpotifyCallbackView />} />
      </Route>
    </Route>

    <Route path="*" element={<AppNavigate replace to="/" />} />
  </Routes>
);
export default RoutingContainer;
