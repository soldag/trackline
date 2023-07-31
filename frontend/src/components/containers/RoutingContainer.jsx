import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "~/components/common/ProtectedRoute";
import GameContainer from "~/components/containers/GameContainer";
import CreateGameView from "~/components/views/CreateGameView";
import HomeView from "~/components/views/HomeView";
import JoinGameView from "~/components/views/JoinGameView";
import LoginView from "~/components/views/LoginView";
import RegisterView from "~/components/views/RegisterView";
import SpotifyCallbackView from "~/components/views/SpotifyCallbackView";

const RoutingContainer = () => (
  <Routes>
    <Route path="login" element={<LoginView />} />
    <Route path="register" element={<RegisterView />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<HomeView />} />

      <Route path="games">
        <Route path="new" element={<CreateGameView />} />
        <Route path="join/:gameId?" element={<JoinGameView />} />
        <Route path=":gameId" element={<GameContainer />} />
      </Route>

      <Route path="spotify">
        <Route path="callback" element={<SpotifyCallbackView />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

export default RoutingContainer;
