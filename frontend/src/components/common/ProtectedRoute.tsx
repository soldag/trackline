import { PropsWithChildren } from "react";
import { Outlet, useLocation } from "react-router";

import AppNavigate from "@/components/common/AppNavigate";
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
      <AppNavigate
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
