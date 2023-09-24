import { defineMessages } from "react-intl";

export default {
  labels: defineMessages({
    exact: {
      id: "CreditsStrictness.labels.exact",
      defaultMessage: "Exact",
    },
    strict: {
      id: "CreditsStrictness.labels.strict",
      defaultMessage: "Strict",
    },
    moderate: {
      id: "CreditsStrictness.labels.moderate",
      defaultMessage: "Moderate",
    },
    relaxed: {
      id: "CreditsStrictness.labels.relaxed",
      defaultMessage: "Relaxed",
    },
  }),
  descriptions: defineMessages({
    exact: {
      id: "CreditsStrictness.descriptions.exact",
      defaultMessage:
        "Artist names and title need to match <bold>exactly</bold>. Players must guess <bold>every artist</bold> of a track.",
    },
    strict: {
      id: "CreditsStrictness.descriptions.strict",
      defaultMessage:
        "<bold>Small differences</bold> of artist names and title are tolerated. Players must guess <bold>every artist</bold> of a track.",
    },
    moderate: {
      id: "CreditsStrictness.descriptions.moderate",
      defaultMessage:
        "<bold>Small differences</bold> of artist names and title are tolerated. Players only need to guess <bold>one artist</bold> of a track.",
    },
    relaxed: {
      id: "CreditsStrictness.descriptions.relaxed",
      defaultMessage:
        "<bold>Rough differences</bold> of artist names and title are tolerated. Players only need to guess <bold>one artist</bold> of a track.",
    },
  }),
};
