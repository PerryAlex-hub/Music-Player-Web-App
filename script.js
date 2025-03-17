let progress = document.getElementById("progress");
let song = document.getElementById("song");
let ctrlIcon = document.getElementById("ctrlIcon");
const fileInput = document.getElementById("fileInput");
const songTitle = document.getElementById("song-title");
let albumArt = document.getElementById("album-art");
let sidebar = document.getElementById("sidebar");
let playlistElement = document.getElementById("playlist");

let playlist = [];
let currentSongIndex = 0;

// Function to toggle the sidebar
function toggleSidebar() {
  sidebar.classList.toggle("active");
}

// Update progress bar as song plays
song.addEventListener("timeupdate", function () {
  progress.value = song.currentTime;
});

// Play/Pause button function
function playPause() {
  if (song.paused) {
    song.play();
    ctrlIcon.classList.add("fa-pause");
    ctrlIcon.classList.remove("fa-play");
  } else {
    song.pause();
    ctrlIcon.classList.remove("fa-pause");
    ctrlIcon.classList.add("fa-play");
  }
}

// When progress bar is manually changed, update song time
progress.oninput = function () {
  song.currentTime = progress.value;
};

// Handle file selection
fileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const objectURL = URL.createObjectURL(file);
    song.src = objectURL;
    songTitle.textContent = file.name;

    // Reset play button to "play" state
    ctrlIcon.classList.remove("fa-pause");
    ctrlIcon.classList.add("fa-play");

    //extract Albulm art if available
    extractAlbumArt(file)
  }
});

// Function to extract album art from an audio file
function extractAlbumArt(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const data = new Uint8Array(event.target.result);
    jsmediatags.read(file, {
      onSuccess: function(tag) {
        if (tag.tags.picture) {
          let base64String = "";
          for (let i = 0; i < tag.tags.picture.data.length; i++) {
            base64String += String.fromCharCode(tag.tags.picture.data[i]);
          }
          let imageUrl = "data:" + tag.tags.picture.format + ";base64," + btoa(base64String);
          albumArt.src = imageUrl;
        } else {
          albumArt.src = "media/468-thumbnail.png"; // Default image
        }
      },
      onError: function(error) {
        console.log("Error extracting album art: ", error);
        albumArt.src = "media/468-thumbnail.png"; // Default image
      }
    });
  };
  reader.readAsArrayBuffer(file);
}

// Function to rewind song by 10 seconds
function rewindSong() {
  song.currentTime = Math.max(0, song.currentTime - 10);
}

// Function to forward song by 10 seconds
function forwardSong() {
  song.currentTime = Math.min(song.duration, song.currentTime + 10);
}

function addToPlaylist() {
  fileInput.click();
}

// Handle file input for multiple songs
fileInput.addEventListener("change", function(event) {
  const files = event.target.files;
  Array.from(files).forEach(file => {
    const objectURL = URL.createObjectURL(file);
    playlist.push({ url: objectURL, name: file.name, file: file });
  });
  updatePlaylist();
  // Remove the automatic play functionality
  // if (playlist.length === files.length) {
  //   playSong(0);
  // }
});

// Update playlist UI
function updatePlaylist() {
  playlistElement.innerHTML = "";
  playlist.forEach((song, index) => {
    let li = document.createElement("li");
    li.textContent = song.name;
    li.onclick = () => playSong(index);
    playlistElement.appendChild(li);
  });
}

// Function to play selected song
function playSong(index) {
  if (index >= 0 && index < playlist.length) {
    const songData = playlist[index];
    song.src = songData.url;
    songTitle.textContent = songData.name;
    extractAlbumArt(songData.file);
    song.play();
    currentSongIndex = index;
    ctrlIcon.classList.add("fa-pause");
    ctrlIcon.classList.remove("fa-play");
  }
}

// Play next song automatically when current song ends
function playNextSong() {
  if (currentSongIndex + 1 < playlist.length) {
    playSong(currentSongIndex + 1);
  }
}
