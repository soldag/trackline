// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { Link, LinkProps } from "react-router";

const AppLink = (props: LinkProps) => (
  <Link
    {...props}
    state={{
      ...props.state,
      canGoBack: true,
    }}
  />
);
export default AppLink;
