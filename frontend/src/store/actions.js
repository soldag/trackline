import * as auth from "store/auth";
import * as errors from "store/errors";
import * as games from "store/games";
import * as spotify from "store/spotify";
import * as timing from "store/timing";

export default [
  ...Object.values(auth.actions),
  ...Object.values(errors.actions),
  ...Object.values(games.actions),
  ...Object.values(spotify.actions),
  ...Object.values(timing.actions),
];
