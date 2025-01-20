const audioFolderPath = '../audio/';
let currentAudio = null;
let currentSongIndex = -1;
let songs = [];
let isPlaying = false;

function getQueryParams() {
    const url = window.location.href; // Ottieni l'URL completo della pagina
    const urlParams = new URLSearchParams(window.location.search); // Ottieni i parametri di query
    const tipo = urlParams.get('tipo'); // Ottieni il valore del parametro 'tipo'
    return tipo; // Restituisci il valore del parametro 'tipo'
}

// Funzione per caricare la lista delle canzoni
function loadSongList() {
    fetch('../audio/_listAudio.json')
        .then(response => response.json())
        .then(data => {
            // Ottieni il parametro 'tipo' dall'URL
            const tipo = getQueryParams();
            // Filtra le canzoni in base al tipo di playlist
            if (tipo !== "all-tracks") {
                filteredSongs = tipo ? data.filter(song => song.playlist === tipo) : data;
                songs = filteredSongs;
                // Aggiungi le canzoni filtrate alla lista
                filteredSongs.forEach((song, index) => {
                    addSongToList(song, index);
                });
            } else {
                songs = data;
                data.forEach((song, index) => {
                    addSongToList(song, index);
                });
            }


            // Ripristina lo stato del player (se c'è uno stato salvato)
            if (isPlaying) {
                const playerState = JSON.parse(sessionStorage.getItem('playerState'));
                restorePlayerState(playerState);
            }
        })
        .catch(error => {
            console.error('Errore nel caricare il file JSON:', error);
        });
}

// Funzione per aggiungere la canzone alla lista
function addSongToList(song, index) {
    const songListElement = document.getElementById('songList');
    const songItem = document.createElement('li');
    songItem.className = 'song-item';

    songItem.innerHTML = `
        <div class="song-info">
            <div class="song-title">${song.title}</div>
            <div class="song-author">${song.author}</div>
            <div class="song-duration">${song.duration}</div>
        </div>
        <button class="play-button" onclick="playSong(${index})">Play</button>
    `;
    songListElement.appendChild(songItem);
}

function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (currentAudio) {
        progressBar.value = (currentAudio.currentTime / currentAudio.duration) * 100;
    }
}

// Cambia la posizione della traccia quando l'utente sposta il cursore
function seekAudio(event) {
    if (currentAudio) {
        const progressBar = event.target;
        const newTime = (progressBar.value / 100) * currentAudio.duration;
        currentAudio.currentTime = newTime;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('progressBar').addEventListener('input', seekAudio);
});

if (currentAudio) {
    currentAudio.ontimeupdate = updateProgressBar;
}

// Funzione per riprodurre la canzone
function playSong(index) {
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
    }

    currentSongIndex = index;
    const song = songs[currentSongIndex];

    console.log(song);

    if (!currentAudio) {
        currentAudio = new Audio(audioFolderPath + song.filename);
    } else {
        currentAudio.src = audioFolderPath + song.filename;
        currentAudio.currentTime = 0;
    }

    currentAudio.ontimeupdate = updateProgressBar;
    currentAudio.onended = nextSong;

    currentAudio.play();

    // Aggiorna il titolo e l'autore
    document.getElementById('songTitle').textContent = song.title;
    document.getElementById('songAuthor').textContent = song.author;

    // Aggiorna l'interfaccia
    document.getElementById('cover').style.backgroundImage = `url(${audioFolderPath}${song.cover})`;
    document.getElementById('playPauseBtn').innerText = 'Pause';

    // Mostra il player
    const player = document.getElementById('player');
    player.classList.add('show');
}


// Funzione per salvare lo stato del player
function savePlayerState() {
    const playerState = {
        songIndex: currentSongIndex,
        isPlaying: !currentAudio.paused,
        currentTime: currentAudio.currentTime,
        songTitle: songs[currentSongIndex]?.title,
        songCover: songs[currentSongIndex]?.cover
    };
    sessionStorage.setItem('playerState', JSON.stringify(playerState));
}

// Funzione per ripristinare lo stato del player
function restorePlayerState(playerState) {

    currentSongIndex = playerState.songIndex;
    const song = songs[currentSongIndex];

    // Se l'oggetto audio non è ancora stato creato, lo creiamo
    if (!currentAudio) {
        currentAudio = new Audio(audioFolderPath + song.filename);
    } else {
        // Se già esiste, aggiorniamo il file e il tempo
        currentAudio.src = audioFolderPath + song.filename;
    }

    currentAudio.currentTime = playerState.currentTime;

    if (playerState.isPlaying) {
        currentAudio.play();
        document.getElementById('playPauseBtn').innerText = 'Pause';
    } else {
        currentAudio.pause();
        document.getElementById('playPauseBtn').innerText = 'Play';
    }

    // Aggiorna l'interfaccia del player
    document.getElementById('cover').style.backgroundImage = `url(${audioFolderPath}${song.cover})`;
    console.log("CIAO2");
    document.getElementById('player').classList.add('show');

}


// Play/Pause toggle
document.addEventListener('DOMContentLoaded', function () {
    loadSongList();
    document.getElementById('playPauseBtn').onclick = function (event) {
        event.stopPropagation(); // Impedisce la propagazione al player
        if (currentAudio.paused) {
            currentAudio.play();
            this.innerText = 'Pause';
            savePlayerState(); // Salva lo stato ogni volta che cambia
        } else {
            currentAudio.pause();
            this.innerText = 'Play';
            savePlayerState(); // Salva lo stato ogni volta che cambia
        }
    };


    // Go to the next song
    document.getElementById('nextBtn').onclick = function (event) {
        event.stopPropagation(); // Impedisce la propagazione al player
        nextSong();
    };

    // Go to the previous song
    document.getElementById('prevBtn').onclick = function (event) {
        event.stopPropagation(); // Impedisce la propagazione al player
        prevSong();
    };

    // Toggle player expansion
    document.getElementById('player').onclick = function () {
        const player = document.getElementById('player');
        const cover = document.getElementById('cover');
        player.classList.toggle('expanded');
    };
});
// Funzioni per passare alla canzone successiva e precedente
function nextSong() {
    if (currentSongIndex < songs.length - 1) {
        currentSongIndex++;
    } else {
        currentSongIndex = 0;
    }
    playSong(currentSongIndex);
}

function prevSong() {
    if (currentSongIndex > 0) {
        currentSongIndex--;
    } else {
        currentSongIndex = songs.length - 1;
    }
    playSong(currentSongIndex);
}


// Salva lo stato prima che la pagina venga cambiata
window.addEventListener('beforeunload', function () {
    savePlayerState(); // Salva lo stato prima che la pagina venga cambiata
});
