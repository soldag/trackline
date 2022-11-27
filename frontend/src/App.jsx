import { IntlProvider } from "react-intl";

import CssBaseline from "@mui/joy/CssBaseline";
import GlobalStyles from "@mui/joy/GlobalStyles";
import { CssVarsProvider } from "@mui/joy/styles";

import RootContainer from "containers/RootContainer";
import translations from "translations";

const locale = navigator.language && navigator.language.split(/[-_]/)[0];

const App = () => (
  <IntlProvider locale={locale} messages={translations[locale]}>
    <CssVarsProvider>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            //overflow: "hidden",
          },
        }}
      />
      <RootContainer />
    </CssVarsProvider>
  </IntlProvider>
);

export default App;
