
/* =========================================
   PLAYORA - MUSIC AND VIDEO PLAYER
========================================= */

// ADD YOUR API CREDENTIALS
const JAMENDO_CLIENT_ID = "f9fe8bd7";
const YOUTUBE_API_KEY = "AIzaSyCnfLym92t3UXbHJE2C3eL_WNH488QnJpU";

// SELECT HTML ELEMENTS
const audio = document.getElementById("audioElement");
const musicResults = document.getElementById("musicResults");
const musicMessage = document.getElementById("musicMessage");

const videoResults = document.getElementById("videoResults");
const videoMessage = document.getElementById("videoMessage");

const playPauseButton = document.getElementById("playPauseButton");
const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");

let songs = [];
let currentSongIndex = -1;

// Cache repeated searches during this page session
const musicCache = new Map();
const videoCache = new Map();


// =========================================
// 1. PAGE NAVIGATION
// =========================================

function showPage(pageName) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".nav-link").forEach(button => {
        button.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageName);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    const activeButton = document.querySelector(
        `.nav-link[data-page="${pageName}"]`
    );

    if (activeButton) {
        activeButton.classList.add("active");
    }
}

document.querySelectorAll(".nav-link").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.go);
    });
});


// =========================================
// 2. JAMENDO MUSIC SEARCH
// =========================================

async function searchMusic() {
    const query = document.getElementById("musicSearch").value.trim();

    if (!query) {
        musicMessage.textContent = "Please enter a song or artist name.";
        return;
    }

    if (!JAMENDO_CLIENT_ID || JAMENDO_CLIENT_ID === "YOUR_JAMENDO_CLIENT_ID") {
        musicMessage.textContent =
            "Add your Jamendo Client ID in javascript.js first.";
        return;
    }

    musicResults.innerHTML = "";
    musicMessage.textContent = "Searching for music...";

    try {
        let data;

        if (musicCache.has(query.toLowerCase())) {
            data = musicCache.get(query.toLowerCase());
        } else {
            const url = new URL("https://api.jamendo.com/v3.0/tracks/");

            url.search = new URLSearchParams({
                client_id: JAMENDO_CLIENT_ID,
                format: "json",
                limit: "12",
                search: query,
                audioformat: "mp32",
                include: "musicinfo"
            });

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Music service request failed.");
            }

            data = await response.json();
            musicCache.set(query.toLowerCase(), data);
        }

        const tracks = data.results || [];

        if (tracks.length === 0) {
            musicMessage.textContent = "No songs found. Try another search.";
            return;
        }

        songs = tracks;
        currentSongIndex = -1;

        musicMessage.textContent = `${tracks.length} songs found.`;

        tracks.forEach((song, index) => {
            const card = document.createElement("div");
            card.className = "song-card";

            const image = song.album_image || song.image ||
                "https://placehold.co/300x300/241018/ffffff?text=Music";

            const title = song.name || "Unknown Song";
            const artist = song.artist_name || "Unknown Artist";

            card.innerHTML = `
                <img src="${escapeHTML(image)}" alt="Album cover">
                <h3>${escapeHTML(title)}</h3>
                <p>${escapeHTML(artist)}</p>
                <button type="button">▶ Play Song</button>
            `;

            card.querySelector("button").addEventListener("click", () => {
                playSong(index);
            });

            musicResults.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        musicMessage.textContent =
            "Unable to load music. Check your internet connection and Jamendo Client ID.";
    }
}

document.getElementById("musicSearchButton")
    .addEventListener("click", searchMusic);

document.getElementById("musicSearch")
    .addEventListener("keydown", event => {
        if (event.key === "Enter") searchMusic();
    });


// =========================================
// 3. PLAY SONG
// =========================================

async function playSong(index) {
    const song = songs[index];

    if (!song || !song.audio) {
        musicMessage.textContent = "This song does not have a playable audio URL.";
        return;
    }

    currentSongIndex = index;

    // Stop the YouTube video
    document.getElementById("youtubeFrame").src = "";

    audio.pause();
    audio.src = song.audio;

    document.getElementById("playingTitle").textContent =
        song.name || "Unknown Song";

    document.getElementById("playingArtist").textContent =
        song.artist_name || "Unknown Artist";

    document.getElementById("playingImage").src =
        song.album_image || song.image ||
        "https://placehold.co/300x300/241018/ffffff?text=Music";

    try {
        await audio.play();
        playPauseButton.textContent = "Ⅱ";
    } catch (error) {
        console.error(error);
        playPauseButton.textContent = "▶";
        musicMessage.textContent =
            "Unable to play this track. Try another song.";
    }
}


// =========================================
// 4. PLAY / PAUSE
// =========================================

playPauseButton.addEventListener("click", async () => {
    if (!audio.src) {
        musicMessage.textContent = "Search for a song and select Play Song.";
        return;
    }

    if (audio.paused) {
        try {
            await audio.play();
        } catch (error) {
            console.error(error);
        }
    } else {
        audio.pause();
    }
});

audio.addEventListener("play", () => {
    playPauseButton.textContent = "Ⅱ";
});

audio.addEventListener("pause", () => {
    playPauseButton.textContent = "▶";
});


// =========================================
// 5. NEXT SONG
// =========================================

document.getElementById("nextButton").addEventListener("click", () => {
    if (songs.length === 0) return;

    const nextIndex = currentSongIndex < 0
        ? 0
        : (currentSongIndex + 1) % songs.length;

    playSong(nextIndex);
});


// =========================================
// 6. PREVIOUS SONG
// =========================================

document.getElementById("previousButton").addEventListener("click", () => {
    if (songs.length === 0) return;

    const previousIndex = currentSongIndex <= 0
        ? songs.length - 1
        : currentSongIndex - 1;

    playSong(previousIndex);
});


// =========================================
// 7. AUTOMATIC NEXT SONG
// =========================================

audio.addEventListener("ended", () => {
    if (songs.length > 0 && currentSongIndex !== -1) {
        const nextIndex = (currentSongIndex + 1) % songs.length;
        playSong(nextIndex);
    }
});


// =========================================
// 8. MUSIC PROGRESS BAR
// =========================================

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

audio.addEventListener("timeupdate", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        progressBar.value = 0;
        return;
    }

    progressBar.value = (audio.currentTime / audio.duration) * 100;

    document.getElementById("currentTime").textContent =
        formatTime(audio.currentTime);

    document.getElementById("duration").textContent =
        formatTime(audio.duration);
});

audio.addEventListener("loadedmetadata", () => {
    document.getElementById("duration").textContent =
        formatTime(audio.duration);
});

progressBar.addEventListener("input", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = (progressBar.value / 100) * audio.duration;
    }
});


// =========================================
// 9. VOLUME CONTROL
// =========================================

volumeBar.addEventListener("input", () => {
    audio.volume = Number(volumeBar.value);
});

audio.volume = Number(volumeBar.value);


// =========================================
// 10. YOUTUBE VIDEO SEARCH
// =========================================

async function searchVideos() {
    const query = document.getElementById("videoSearch").value.trim();

    if (!query) {
        videoMessage.textContent = "Please enter a video name.";
        return;
    }

    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_YOUTUBE_API_KEY") {
        videoMessage.textContent =
            "Add your YouTube API key in javascript.js first.";
        return;
    }

    videoResults.innerHTML = "";
    videoMessage.textContent = "Searching for videos...";

    try {
        let data;

        if (videoCache.has(query.toLowerCase())) {
            data = videoCache.get(query.toLowerCase());
        } else {
            const url = new URL(
                "https://www.googleapis.com/youtube/v3/search"
            );

            url.search = new URLSearchParams({
                part: "snippet",
                q: query,
                type: "video",
                maxResults: "10",
                regionCode: "IN",
                relevanceLanguage: "ta",
                videoEmbeddable: "true",
                key: YOUTUBE_API_KEY
            });

            const response = await fetch(url);
            data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error?.message || "YouTube search failed."
                );
            }

            videoCache.set(query.toLowerCase(), data);
        }

        const videos = data.items || [];

        if (videos.length === 0) {
            videoMessage.textContent = "No videos found.";
            return;
        }

        videoMessage.textContent = `${videos.length} videos found.`;

        videos.forEach(video => {
            const videoId = video.id.videoId;
            const title = video.snippet.title;
            const channel = video.snippet.channelTitle;
            const thumbnail = video.snippet.thumbnails.medium.url;

            const card = document.createElement("div");
            card.className = "video-card-item";

            card.innerHTML = `
                <img src="${escapeHTML(thumbnail)}" alt="Video thumbnail">
                <h3>${escapeHTML(title)}</h3>
                <p>${escapeHTML(channel)}</p>
                <button type="button">▷ Watch Video</button>
            `;

            card.querySelector("button").addEventListener("click", () => {
                playVideo(videoId, title);
            });

            videoResults.appendChild(card);
        });

    } catch (error) {
        console.error(error);

        if (error.message.toLowerCase().includes("quota")) {
            videoMessage.textContent =
                "YouTube API daily search quota exceeded. Try again after the quota resets.";
        } else {
            videoMessage.textContent = "Unable to load videos: " + error.message;
        }
    }
}

document.getElementById("videoSearchButton")
    .addEventListener("click", searchVideos);

document.getElementById("videoSearch")
    .addEventListener("keydown", event => {
        if (event.key === "Enter") searchVideos();
    });


// =========================================
// 11. PLAY YOUTUBE VIDEO
// =========================================

function playVideo(videoId, title) {
    // Stop audio music
    audio.pause();

    document.getElementById("youtubeFrame").src =
        "https://www.youtube-nocookie.com/embed/" +
        encodeURIComponent(videoId) + "?autoplay=1";

    document.getElementById("videoTitle").textContent = title;

    document.getElementById("youtubeFrame")
        .scrollIntoView({ behavior: "smooth", block: "center" });
}


// =========================================
// 12. SAFE TEXT FOR HTML
// =========================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return replacements[character];
    });
}


// =========================================
// 13. INITIAL SETTINGS
// =========================================

showPage("home");
