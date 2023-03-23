import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import LoadingView from "components/views/LoadingView";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

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

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};

export default ProtectedRoute;
