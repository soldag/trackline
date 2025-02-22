import { combineReducers } from "@reduxjs/toolkit";

import { reducer as auth } from "@/store/auth";
import { reducer as errors } from "@/store/errors";
import { reducer as games } from "@/store/games";
import { reducer as loading } from "@/store/loading";
import { reducer as spotify } from "@/store/spotify";
import { reducer as timing } from "@/store/timing";

export default combineReducers({
  auth,
  errors,
  loading,
  games,
  spotify,
  timing,
});
