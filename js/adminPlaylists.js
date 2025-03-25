const backendURL = "http://localhost:3000/api";
let currentPlaylistId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadPlaylists();
    loadProfiles();
    loadVideos();
});

async function loadPlaylists() {
    const playlistList = document.getElementById("playlist-list");
    const ownerId = localStorage.getItem("userId");

    try {
        const response = await fetch(`${backendURL}/playlists?owner=${ownerId}`);
        const playlists = await response.json();
        playlistList.innerHTML = "";

        playlists.forEach(playlist => {
            const card = document.createElement("div");
            card.className = "col-md-4 mb-3";
            card.innerHTML = `
                <div class="card p-3 shadow-sm">
                    <h5 class="card-title text-primary">${playlist.name}</h5>
                    <p class="card-text">Perfiles: ${playlist.profiles.map(p => p.name).join(", ")}</p>
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-warning btn-sm" onclick="editPlaylist('${playlist._id}', '${playlist.name}', ${JSON.stringify(playlist.profiles.map(p => p._id))}, ${JSON.stringify(playlist.videos.map(v => v._id))})">✏️ Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deletePlaylist('${playlist._id}')">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
            playlistList.appendChild(card);
        });
    } catch (err) {
        console.error("Error cargando playlists:", err);
    }
}

async function loadProfiles() {
    const profilesList = document.getElementById("profilesList");
    const ownerId = localStorage.getItem("userId");

    try {
        const response = await fetch(`${backendURL}/restricted-users?owner=${ownerId}`);
        const profiles = await response.json();
        profilesList.innerHTML = "";

        profiles.forEach(profile => {
            const checkbox = document.createElement("div");
            checkbox.className = "form-check";
            checkbox.innerHTML = `
                <input class="form-check-input" type="checkbox" value="${profile._id}" id="profile-${profile._id}">
                <label class="form-check-label" for="profile-${profile._id}">${profile.name}</label>
            `;
            profilesList.appendChild(checkbox);
        });
    } catch (err) {
        console.error("Error cargando perfiles:", err);
    }
}

async function loadVideos() {
    const videosList = document.getElementById("videosList");

    try {
        const response = await fetch(`${backendURL}/videos`);
        const videos = await response.json();

        console.log("Cargando videos...");
        console.log("Respuesta:", videos);

        videosList.innerHTML = "";

        videos.forEach(video => {
            console.log("Renderizando video:", video.name);

            const embedUrl = convertToEmbedURL(video.url);
            if (!embedUrl) return;

            const wrapper = document.createElement("div");
            wrapper.className = "col-md-4 mb-3";

            wrapper.innerHTML = `
                <div class="card shadow-sm h-100">
                    <iframe class="card-img-top" src="${embedUrl}" frameborder="0"
                            style="width:100%; height:180px;" allowfullscreen></iframe>
                    <div class="card-body p-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${video._id}" id="video-${video._id}">
                            <label class="form-check-label" for="video-${video._id}">${video.name}</label>
                        </div>
                    </div>
                </div>
            `;

            videosList.appendChild(wrapper);
        });
    } catch (err) {
        console.error("Error cargando videos:", err);
    }
}

function convertToEmbedURL(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}


function openAddPlaylistModal() {
    currentPlaylistId = null;
    document.getElementById("playlistModalTitle").innerText = "Agregar Playlist";
    document.getElementById("playlistId").value = "";
    document.getElementById("playlistName").value = "";

    document.querySelectorAll("#profilesList input").forEach(input => input.checked = false);
    document.querySelectorAll("#videosList input").forEach(input => input.checked = false);

    new bootstrap.Modal(document.getElementById("playlistModal")).show();
}

async function editPlaylist(id, name, profileIds, videoIds) {
    currentPlaylistId = id;
    document.getElementById("playlistModalTitle").innerText = "Editar Playlist";
    document.getElementById("playlistId").value = id;
    document.getElementById("playlistName").value = name;

    await loadProfiles();
    await loadVideos();

    document.querySelectorAll("#profilesList input").forEach(input => {
        input.checked = profileIds.includes(input.value);
    });

    document.querySelectorAll("#videosList input").forEach(input => {
        input.checked = videoIds.includes(input.value);
    });

    new bootstrap.Modal(document.getElementById("playlistModal")).show();
}

async function savePlaylist() {
    const name = document.getElementById("playlistName").value.trim();
    const owner = localStorage.getItem("userId");

    const selectedProfiles = Array.from(document.querySelectorAll("#profilesList input:checked")).map(i => i.value);
    const selectedVideos = Array.from(document.querySelectorAll("#videosList input:checked")).map(i => i.value);

    if (!name || selectedProfiles.length === 0 || selectedVideos.length === 0) {
        alert("⚠️ Debes completar todos los campos obligatorios.");
        return;
    }

    const payload = { name, owner, profiles: selectedProfiles, videos: selectedVideos };
    const method = currentPlaylistId ? "PUT" : "POST";
    const url = currentPlaylistId ? `${backendURL}/playlists/${currentPlaylistId}` : `${backendURL}/playlists`;

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            bootstrap.Modal.getInstance(document.getElementById("playlistModal")).hide();
            loadPlaylists();
        } else {
            alert(result.error);
        }
    } catch (err) {
        console.error("Error al guardar playlist:", err);
    }
}

async function deletePlaylist(id) {
    if (!confirm("¿Seguro que deseas eliminar esta playlist?")) return;

    try {
        const response = await fetch(`${backendURL}/playlists/${id}`, {
            method: "DELETE"
        });
        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            loadPlaylists();
        } else {
            alert(result.error);
        }
    } catch (err) {
        console.error("Error al eliminar playlist:", err);
    }
}