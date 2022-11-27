import { RouterProvider, createBrowserRouter } from "react-router-dom";

import GameView from "views/GameView";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GameView />,
  },
]);

const RootContainer = () => <RouterProvider router={router} />;

export default RootContainer;
