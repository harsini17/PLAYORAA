
import { useState } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";

const SPOTIFY_PLAYLIST_ID = "6tBBUvq3qAORI4SEPuSndF";
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

function App() {
  // =========================================
  // AUTHENTICATION
  // =========================================

  const [currentPage, setCurrentPage] = useState(() => {
    const token = localStorage.getItem("playoraToken");
    const user = localStorage.getItem("playoraUser");

    return token && user ? "home" : "login";
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("playoraUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  function handleLoginSuccess(loggedInUser) {
    setUser(loggedInUser);
    setCurrentPage("home");
  }

  function handleLogout() {
    localStorage.removeItem("playoraToken");
    localStorage.removeItem("playoraUser");

    setUser(null);
    setActivePage("home");
    setCurrentPage("login");
  }

  // =========================================
  // MUSIC AND VIDEO NAVIGATION
  // =========================================

  const [activePage, setActivePage] = useState("home");
  const [spotifyLoaded, setSpotifyLoaded] = useState(false);

  const [videoQuery, setVideoQuery] = useState("Tamil songs");
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoMessage, setVideoMessage] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);

  function showPage(page) {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // =========================================
  // YOUTUBE VIDEO SEARCH
  // =========================================

  async function searchVideos(event) {
    event?.preventDefault();

    if (!YOUTUBE_API_KEY) {
      setVideoMessage(
        "YouTube API key is missing. Check your .env file."
      );
      return;
    }

    if (!videoQuery.trim()) {
      setVideoMessage("Enter a Tamil song or artist name.");
      return;
    }

    setVideoLoading(true);
    setVideoMessage("Searching Tamil videos...");

    try {
      const params = new URLSearchParams({
        part: "snippet",
        q: `${videoQuery.trim()} Tamil songs`,
        type: "video",
        maxResults: "12",
        regionCode: "IN",
        relevanceLanguage: "ta",
        videoEmbeddable: "true",
        key: YOUTUBE_API_KEY
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || "YouTube search failed."
        );
      }

      setVideos(data.items || []);
      setSelectedVideo(null);

      if (!data.items?.length) {
        setVideoMessage("No Tamil videos found.");
      } else {
        setVideoMessage(
          `${data.items.length} Tamil videos found.`
        );
      }
    } catch (error) {
      console.error("YouTube error:", error);
      setVideoMessage(error.message);
      setVideos([]);
    } finally {
      setVideoLoading(false);
    }
  }

  // =========================================
  // PLAY YOUTUBE VIDEO
  // =========================================

  function playVideo(video) {
    if (!video?.id?.videoId) return;
    setSelectedVideo(video);
  }

  // =========================================
  // LOGIN AND REGISTER PAGES
  // =========================================

  if (currentPage === "register") {
    return (
      <Register
        onShowLogin={() => setCurrentPage("login")}
      />
    );
  }

  if (currentPage === "login") {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onShowRegister={() => setCurrentPage("register")}
      />
    );
  }

  // =========================================
  // ORIGINAL PLAYORA WEBSITE
  // =========================================

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">PLAYORA</div>

        <p className="tagline">Stream in Harmony</p>

        <nav>

          <button
            className={`nav-link ${
              activePage === "home" ? "active-link" : ""
            }`}
            onClick={() => showPage("home")}
          >
            <span>⌂</span> Home
          </button>

          <button
            className={`nav-link ${
              activePage === "music" ? "active-link" : ""
            }`}
            onClick={() => showPage("music")}
          >
            <span>♫</span> Music
          </button>

          <button
            className={`nav-link ${
              activePage === "videos" ? "active-link" : ""
            }`}
            onClick={() => showPage("videos")}
          >
            <span>▶</span> Videos
          </button>

          <button
            className={`nav-link ${
              activePage === "explore" ? "active-link" : ""
            }`}
            onClick={() => showPage("explore")}
          >
            <span>✦</span> Explore
          </button>

        </nav>

        <div className="sidebar-bottom">
          <p>Music for every moment.</p>
        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        <header className="topbar">

          <div className="welcome">
            <span className="eyebrow">YOUR MUSIC WORLD</span>
            <h2>Welcome to PLAYORA</h2>
            <p>
              Hello, {user?.username || "Listener"}!
            </p>
          </div>

          <div className="topbar-actions">

            <span className="top-label">
              MUSIC & VIDEO PLAYER
            </span>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </header>

        {/* HOME PAGE */}

        {activePage === "home" && (
          <section className="page">

            <div className="hero">

              <div className="hero-content">

                <span className="eyebrow">
                  FEEL THE MUSIC
                </span>

                <h1>
                  Every Beat.
                  <br />
                  Every Emotion.
                </h1>

                <p>
                  Discover music, watch videos and enjoy your
                  favourite entertainment in one place.
                </p>

                <button
                  className="primary-btn"
                  onClick={() => showPage("music")}
                >
                  Explore Music
                </button>

              </div>

            </div>

            <h2 className="section-title">
              Your Experience
            </h2>

            <div className="experience-grid">

              <div className="experience-card">

                <div className="card-icon">♫</div>

                <h3>Music Streaming</h3>

                <p>
                  Listen to Tamil music through your Spotify playlist.
                </p>

                <button
                  className="outline-btn"
                  onClick={() => showPage("music")}
                >
                  Listen Now
                </button>

              </div>

              <div className="experience-card">

                <div className="card-icon">▶</div>

                <h3>Video Streaming</h3>

                <p>
                  Search and watch Tamil music videos.
                </p>

                <button
                  className="outline-btn"
                  onClick={() => showPage("videos")}
                >
                  Watch Videos
                </button>

              </div>

            </div>

          </section>
        )}

        {/* MUSIC PAGE */}

        {activePage === "music" && (
          <section className="page">

            <div className="page-heading">

              <span className="eyebrow">
                TAMIL MUSIC COLLECTION
              </span>

              <h1>Music Library</h1>

              <p>
                Listen to your favourite Tamil songs.
              </p>

            </div>

           
<div className="spotify-player">

  <div className="spotify-heading">
    <h2>My Tamil Playlist</h2>
  </div>

 
<iframe
  title="Spotify Test Playlist"
  src="https://open.spotify.com/embed/playlist/37i9dQZF1DX4Wsb4d7NKfP"
  width="100%"
  height="500"
  style={{ border: "none", borderRadius: "12px" }}
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  loading="eager"
></iframe>


  <p className="spotify-message">
    {spotifyLoaded
      ? "Spotify player loaded. Check the playlist above."
      : "Connecting to Spotify..."}
  </p>

  <a
    href="https://open.spotify.com/playlist/6tBBUvq3qAORI4SEPuSndF"
    target="_blank"
    rel="noopener noreferrer"
    className="spotify-link"
  >
    Open Playlist in Spotify
  </a>

</div>

          </section>
        )}

        {/* VIDEOS PAGE */}

        {activePage === "videos" && (
          <section className="page">

            <div className="page-heading">

              <span className="eyebrow">
                WATCH YOUR FAVOURITES
              </span>

              <h1>Video Library</h1>

              <p>
                Discover Tamil music videos through YouTube.
              </p>

            </div>

            <form
              className="search-box"
              onSubmit={searchVideos}
            >

              <input
                type="text"
                placeholder="Search Tamil music videos..."
                value={videoQuery}
                onChange={(event) =>
                  setVideoQuery(event.target.value)
                }
              />

              <button
                type="submit"
                disabled={videoLoading}
              >
                {videoLoading ? "Searching..." : "Search"}
              </button>

            </form>

            <p className="message">
              {videoMessage}
            </p>

            {selectedVideo && (
              <div className="video-player">

                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideo.id.videoId}?autoplay=1`}
                  title={selectedVideo.snippet.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>

                <h3>{selectedVideo.snippet.title}</h3>

                <p>
                  {selectedVideo.snippet.channelTitle}
                </p>

              </div>
            )}

            <div className="video-grid">

              {videos.map((video) => (
                <div
                  className="video-card-item"
                  key={video.id.videoId}
                  onClick={() => playVideo(video)}
                >

                  <img
                    src={
                      video.snippet.thumbnails.medium?.url ||
                      video.snippet.thumbnails.default?.url
                    }
                    alt={video.snippet.title}
                  />

                  <h3>{video.snippet.title}</h3>

                  <p>
                    {video.snippet.channelTitle}
                  </p>

                  <button
                    className="card-play-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      playVideo(video);
                    }}
                  >
                    ▶ Watch Video
                  </button>

                </div>
              ))}

            </div>

          </section>
        )}

        {/* EXPLORE PAGE */}

        {activePage === "explore" && (
          <section className="page">

            <div className="page-heading">

              <span className="eyebrow">
                DISCOVER MORE
              </span>

              <h1>Explore PLAYORA</h1>

              <p>
                Choose your entertainment experience.
              </p>

            </div>

            <div className="experience-grid">

              <div className="experience-card">

                <div className="card-icon">♫</div>

                <h3>Discover Tamil Music</h3>

                <p>
                  Browse your Tamil playlist and enjoy music.
                </p>

                <button
                  className="primary-btn"
                  onClick={() => showPage("music")}
                >
                  Explore Music
                </button>

              </div>

              <div className="experience-card">

                <div className="card-icon">▶</div>

                <h3>Discover Videos</h3>

                <p>
                  Find and watch Tamil music videos.
                </p>

                <button
                  className="primary-btn"
                  onClick={() => showPage("videos")}
                >
                  Explore Videos
                </button>

              </div>

            </div>

          </section>
        )}

      </main>

      {/* BOTTOM MUSIC PLAYER */}

      <footer className="music-player">

        <div className="now-playing">

          <div className="spotify-bottom-icon">
            ♫
          </div>

          <div>
            <h4>PLAYORA Music</h4>
            <p>Spotify Playlist</p>
          </div>

        </div>

        <div className="player-controls">

          <div className="control-buttons">

            <button
              type="button"
              disabled
              title="Use Spotify player above"
            >
              ⏮
            </button>

            <button
              type="button"
              className="play-button"
              disabled
              title="Use Spotify player above"
            >
              ▶
            </button>

            <button
              type="button"
              disabled
              title="Use Spotify player above"
            >
              ⏭
            </button>

          </div>

          <div className="progress-area">
            <span>Spotify</span>

            <span className="player-note">
              Playback controlled by Spotify above
            </span>

            <span>♫</span>
          </div>

        </div>

        <div className="volume-area">
          <span>🔊</span>
          <span className="player-note">Spotify volume</span>
        </div>

      </footer>

    </div>
  );
}

export default App;
