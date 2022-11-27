import { useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/joy/Button";
import Grid from "@mui/joy/Grid";
import Sheet from "@mui/joy/Sheet";

import PlayerInfo from "components/PlayerInfo";
import StatusBar from "components/StatusBar";
import Timeline from "components/Timeline";

const player = {
  name: "Sören",
  points: 7,
  tokens: 5,
};

const GameView = () => {
  const [tracks, setTracks] = useState([
    {
      id: 1,
      title: "Riverside 2099",
      artist: "Oliver Heldens",
      release_year: 2018,
      coverUrl: "https://m.media-amazon.com/images/I/81a0XWsb1tL._SS500_.jpg",
    },
    {
      id: 2,
      title: "1999",
      artist: "Charli XCX & Troye Sivan",
      release_year: 2019,
      coverUrl: "https://m.media-amazon.com/images/I/91jy-U3XO5L._SS500_.jpg",
    },
    {
      id: 3,
      title: "I Need Someone (Yotto Remix)",
      artist: "Faithless (feat. Nathan Ball & Caleb Femi)",
      release_year: 2022,
      coverUrl: "https://i1.sndcdn.com/artworks-Cfnm3GUt4evE-0-t500x500.jpg",
    },
    {
      id: 4,
      title: "Riverside 2099",
      artist: "Oliver Heldens",
      release_year: 2018,
      coverUrl: "https://m.media-amazon.com/images/I/81a0XWsb1tL._SS500_.jpg",
    },
    {
      id: 5,
      title: "1999",
      artist: "Charli XCX & Troye Sivan",
      release_year: 2019,
      coverUrl: "https://m.media-amazon.com/images/I/91jy-U3XO5L._SS500_.jpg",
    },
    {
      id: 6,
      title: "I Need Someone (Yotto Remix)",
      artist: "Faithless (feat. Nathan Ball & Caleb Femi)",
      release_year: 2022,
      coverUrl: "https://i1.sndcdn.com/artworks-Cfnm3GUt4evE-0-t500x500.jpg",
    },
  ]);

  return (
    <Sheet
      sx={{
        width: "100vw",
        height: "100vh",
        padding: "8px",
      }}
    >
      <Grid container sx={{ height: "100%" }}>
        <Grid xs={10} alignStart="flex-start">
          <PlayerInfo player={player} />
        </Grid>
        <Grid xs={2} alignStart="flex-start">
          <Grid container justifyContent="flex-end">
            <Button>
              <MenuIcon />
            </Button>
          </Grid>
        </Grid>

        <Grid
          container
          xs={12}
          alignSelf="center"
          alignItems="center"
          sx={{
            "overflowX": "auto",
            "WebkitOverflowScrolling": "touch",
            "msOverflowStyle": "none",
            "scrollbarWidth": "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Timeline
            tracks={tracks}
            activeTrackId={1}
            onTracksChange={setTracks}
          />
        </Grid>

        <Grid xs={12} alignSelf="flex-end">
          <StatusBar
            status="guessing"
            activePlayer="Mimi"
            isActivePlayer={false}
          />
        </Grid>
      </Grid>
    </Sheet>
  );
};

export default GameView;
