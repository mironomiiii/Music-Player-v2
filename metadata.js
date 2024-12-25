const myImage = new Image(300, 300);
const HcoverImage = document.getElementById("cover");
const HbackgroundImage = document.getElementById("background");

const HtrackName = document.getElementById("title");
const HalbumName = document.getElementById("album");
const HartistName = document.getElementById("artist");
const HtrackLink = document.getElementById("link");
const HlistContent = document.getElementById("list-content");

const wrapper = document.getElementById("wrapper");
const bgWrappper = document.getElementById("bgWrapper")
let username = "";
let usernameValue = "";
const input = document.getElementById("loginput");
const loginScreen = document.getElementById("login");
const call = document.getElementById("call")

let currentSong = {
  title: "",
  artist: "",
  cover: "",
  songlink: "",
  album: "",
};

let initLoad = true;
let prevsURL = 0;

myImage.onload = () => {
  wrapper.classList.add("fade-in-out");
  bgWrapper.classList.add("fade-in-out");
  setTimeout(() => {
    wrapper.classList.remove("fade-in-out");
    bgWrapper.classList.remove("fade-in-out");
  }, 2000);
  setTimeout(() => {
    handleUpdateSong();
  }, 1000);
};

input.addEventListener("keypress", function (i) {
  // If the user presses the "Enter" key on the keyboard
  if (i.key == "Enter") {
    // Cancel the default action, if needed
    i.preventDefault();
    updateUsername();
    setTimeout(() => {
      loginScreen.classList.add("fade-out");
      setTimeout(() => {
        loginScreen.classList.add("invis");
      }, 900);
    }, 4000);
  }
});

const updateUsername = () => {
  const usernameValue = document.getElementById("loginput").value;
  username = usernameValue;
  call.innerHTML = username;
};

const getUserRecent = async (user) => {
  URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=b956d838d88dca005908329670ad0f3c&limit=25&format=json`;
  try {
    const response = await fetch(URL, {
      method: "GET",
      mode: "cors",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
    if (!response.ok) {
      throw new Error("could not fetch");
    }

    return await response.json();
  } catch (e) {}
};

const getTrackInfo = async (artist, song) => {
  URL = `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=b956d838d88dca005908329670ad0f3c&artist=${artist}&track=${song}&format=json`;
  try {
    const response2 = await fetch(URL, {
      method: "GET",
      mode: "cors",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
    if (!response2.ok) {
      throw new Error("could not fetch");
    }
    return await response2.json();
  } catch (e) {}
};

const isPlaying = async (track) => {
  const value = (await track["@attr"]?.nowplaying) == "true";
  //   console.log(value);
  return value;
};

const handleRefreshDisplay = async () => {
  if (username != "") {
    const data = await getUserRecent(username);
    const URL = await data.recenttracks.track[0].url;

    handleUpdateSong();
    // check if it is the same song
    if (prevsURL == URL) return;
    prevsURL = URL; // set as new prevs

    UpdateTableRecent(data);

    const songName = data.recenttracks.track[0].name;
    const artistName = data.recenttracks.track[0].artist["#text"];
    const cover = data.recenttracks.track[0].image[3]["#text"];
    const link = data.recenttracks.track[0].url;
    const album = data.recenttracks.track[0].album["#text"];

    currentSong = {
      title: songName,
      artist: artistName,
      cover: cover,
      songlink: link,
      album: album,
    };
  }
  // console.log("please input a username");
  //   console.log(cover);
  myImage.src = currentSong.cover;
};

const listitem = (
  title = "test",
  duration = "2:42",
  lastPlayed = "now",
  href = ""
) => `<li class="table-list">
  <p class="left"><span class="prevSong truncate">${title}</span><span class="duration">${duration}</span></p>
  <p><span class="date">${lastPlayed}</span><a target="_blank" href="${href}"><img class="share" src="Frame.svg" alt="" /></a></p>
</li>`;

const UpdateTableRecent = async (data) => {
  const tracks = data.recenttracks.track;

  // const tracksInfos = await Promise.all(
  //   tracks.map((res) => {
  //     const name = track.name;
  //     const artistname = track.artist;
  //   })
  // );

  const trackInfos = [];
  for (track of tracks) {
    const name = track.name;
    const artistname = track.artist;
    trackInfos.push(
      getTrackInfo(artistname["#text"].replaceAll(" ", "+"), name)
    );
  }
  const info = await Promise.all(trackInfos);
  HlistContent.innerHTML = "";

  for (let i = 0; i < tracks.length; i++) {
    const name = tracks[i].name;
    const artistname = tracks[i].artist;
    const link = tracks[i].url;
    let time = "";
    const isplaying = await isPlaying(tracks[i]);

    if (isplaying) {
      time = "now";
    } else {
      time = parseInt(tracks[i].date["uts"]);
      const date = Math.floor(new Date().valueOf() / 1000);
      time = date - time;
      interval = time / 60;
      if (interval < 2) {
        // console.log(Math.floor(interval) + " min ago");
        time = Math.floor(interval) + " minute ago";
      } else if (interval < 60) {
        // console.log(Math.floor(interval) + " mins ago");
        time = Math.floor(interval) + " minutes ago";
      } else if (interval < 120) {
        // console.log(Math.floor(interval / 60) + " hour ago");
        time = Math.floor(interval / 60) + " hour ago";
      } else if (interval >= 120) {
        // console.log(Math.floor(interval / 60) + " hours ago");
        time = Math.floor(interval / 60) + " hours ago";
      }
    }
    // const info = await TrackInfo(
    //   artistname["#text"].replaceAll(" ", "+"),
    //   name
    // );

    let duration = info?.track?.duration;
    if (duration > 0) {
      duration = parseInt(duration) / 1000;
      const min = Math.floor(duration / 60);
      const seconds = duration % 60;
      duration = `${min}:${seconds}`;
    } else {
      duration = "";
    }

    // const info = tracksInfos[i];
    HlistContent.insertAdjacentHTML(
      "beforeend",
      listitem(name, duration, time, link)
    );
  }
};

const handleUpdateSong = () => {
  const { title, artist, cover, songlink, album } = currentSong;

  HtrackName.innerHTML = title;
  HartistName.innerHTML = artist;
  HcoverImage.src = cover;
  HbackgroundImage.src = cover;
  HtrackLink.href = songlink;
  if (album == HtrackName) {
    HalbumName.innerHTML = "";
  } else {
    HalbumName.innerHTML = album;
  }
  //   console.log(isPlaying);
};

const main = () => {
  handleRefreshDisplay();
  setInterval(() => {
    // console.log("fetching");
    handleRefreshDisplay();
  }, 3000);
};

main();
