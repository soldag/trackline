import { PropsWithChildren } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

import LoadingView from "@/components/views/LoadingView";
import { useAppSelector } from "@/utils/hooks";

const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const location = useLocation();

  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  if (isLoggedIn == null) {
    return <LoadingView />;
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        replace
        to="/login"
        state={{
          redirect: location.pathname,
        }}
      />
    );
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
