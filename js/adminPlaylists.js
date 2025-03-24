const backendURL = "http://localhost:3000/api";
let currentPlaylistId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadPlaylists();
    loadProfiles();
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
                <div class="card p-3">
                    <h5 class="card-title text-primary">${playlist.name}</h5>
                    <p class="card-text">Perfiles: ${playlist.profiles.map(p => p.name).join(", ")}</p>
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-warning btn-sm" onclick="editPlaylist('${playlist._id}', '${playlist.name}', ${JSON.stringify(playlist.profiles.map(p => p._id))})">✏️ Editar</button>
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

function openAddPlaylistModal() {
    currentPlaylistId = null;
    document.getElementById("playlistModalTitle").innerText = "Agregar Playlist";
    document.getElementById("playlistId").value = "";
    document.getElementById("playlistName").value = "";
    document.querySelectorAll("#profilesList input").forEach(input => input.checked = false);

    new bootstrap.Modal(document.getElementById("playlistModal")).show();
}

function editPlaylist(id, name, profileIds) {
    currentPlaylistId = id;
    document.getElementById("playlistModalTitle").innerText = "Editar Playlist";
    document.getElementById("playlistId").value = id;
    document.getElementById("playlistName").value = name;

    document.querySelectorAll("#profilesList input").forEach(input => {
        input.checked = profileIds.includes(input.value);
    });

    new bootstrap.Modal(document.getElementById("playlistModal")).show();
}

async function savePlaylist() {
    const name = document.getElementById("playlistName").value.trim();
    const owner = localStorage.getItem("userId");
    const selectedProfiles = Array.from(document.querySelectorAll("#profilesList input:checked")).map(input => input.value);

    if (!name || selectedProfiles.length === 0) {
        alert("⚠️ Debes completar todos los campos obligatorios.");
        return;
    }

    const payload = { name, owner, profiles: selectedProfiles };
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
