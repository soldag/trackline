import * as Sentry from "@sentry/react";
import ReactDOM from "react-dom/client";

import App from "@/components/App";
import "@/instrument";

const container = document.getElementById("root")!;
const root = ReactDOM.createRoot(container, {
  onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
    console.warn("Uncaught error", error, errorInfo.componentStack);
  }),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
});
root.render(<App />);
