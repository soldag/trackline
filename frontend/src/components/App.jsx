import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { PersistGate } from "redux-persist/integration/react";

import { CssBaseline, GlobalStyles } from "@mui/joy";
import { CssVarsProvider } from "@mui/joy/styles";

import JoyToaster from "~/components/common/JoyToaster";
import RootContainer from "~/components/containers/RootContainer";
import LoadingView from "~/components/views/LoadingView";
import { persistor, store } from "~/store";
import { globalStyles, theme } from "~/style";
import translations from "~/translations";

const locale = navigator.language && navigator.language.split(/[-_]/)[0];

const App = () => (
  <BrowserRouter>
    <IntlProvider locale={locale} messages={translations[locale]}>
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={<LoadingView />}>
          <CssVarsProvider theme={theme}>
            <CssBaseline />
            <GlobalStyles styles={globalStyles} />
            <JoyToaster />
            <RootContainer />
          </CssVarsProvider>
        </PersistGate>
      </Provider>
    </IntlProvider>
  </BrowserRouter>
);

export default App;
