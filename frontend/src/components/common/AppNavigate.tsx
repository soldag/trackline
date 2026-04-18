// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { Navigate, NavigateProps } from "react-router";

const AppNavigate = (props: NavigateProps) => (
  <Navigate
    {...props}
    state={{
      ...props.state,
      canGoBack: true,
    }}
  />
);

export default AppNavigate;
