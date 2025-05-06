const backendURL = "http://localhost:3000/api";
let restrictedUsers = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadRestrictedUsers();
  await loadPlaylists();
});

async function loadRestrictedUsers() {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const res = await fetch(`${backendURL}/restricted-users?owner=${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  restrictedUsers = await res.json();
  const select = document.getElementById("restrictedUserSelect");
  select.innerHTML = `<option value="">-- Seleccionar usuario --</option>`;
  restrictedUsers.forEach(user => {
    const option = document.createElement("option");
    option.value = user._id;
    option.textContent = user.name;
    select.appendChild(option);
  });
}

function openPlaylistModal(playlist = null) {
  const modal = new bootstrap.Modal(document.getElementById("playlistModal"));
  document.getElementById("playlistId").value = playlist?._id || "";
  document.getElementById("playlistName").value = playlist?.name || "";

  const restrictedUserId = typeof playlist?.restrictedUser === "object"
    ? playlist.restrictedUser._id
    : playlist?.restrictedUser;

  document.getElementById("restrictedUserSelect").value = restrictedUserId || "";
  modal.show();
}

async function loadPlaylists() {
  const res = await fetch(`${backendURL}/playlists`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  const playlists = await res.json();
  console.log("📂 Playlists recibidas del backend:", playlists); // 👈 Aquí ves si restrictedUser viene poblado

  const container = document.getElementById("playlist-list");
  container.innerHTML = "";

  playlists.forEach(playlist => {
    const user = typeof playlist.restrictedUser === "object"
      ? playlist.restrictedUser
      : restrictedUsers.find(u => u._id === playlist.restrictedUser);

    const userName = user?.name || "N/A";

    const card = `
      <div class="col-md-4">
        <div class="card p-3">
          <h5>${playlist.name}</h5>
          <p class="text-muted">Asignado a: ${userName}</p>
          <div class="d-flex justify-content-between">
            <button class="btn btn-sm btn-primary" onclick='openPlaylistModal(${JSON.stringify(playlist)})'>✏️ Editar</button>
            <button class="btn btn-sm btn-danger" onclick='deletePlaylist("${playlist._id}")'>🗑️ Eliminar</button>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += card;
  });
}

async function savePlaylist() {
  const id = document.getElementById("playlistId").value.trim();
  const name = document.getElementById("playlistName").value.trim();
  const restrictedUser = document.getElementById("restrictedUserSelect").value;
  const token = localStorage.getItem("token");

  if (!name || !restrictedUser) {
    alert("⚠️ Debes ingresar un nombre y seleccionar un usuario restringido.");
    return;
  }

  const payload = { name, restrictedUser };
  const url = id ? `${backendURL}/playlists/${id}` : `${backendURL}/playlists`;
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("❌ Error al guardar playlist:", result);
      alert(result.error || "No se pudo guardar la playlist.");
      return;
    }

    alert(result.message || "✅ Playlist guardada exitosamente");

    const modalElement = document.getElementById("playlistModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    await loadPlaylists();
  } catch (error) {
    console.error("❌ Error en la solicitud:", error);
    alert("❌ Error de red o del servidor.");
  }
}

async function deletePlaylist(id) {
  if (!confirm("¿Estás seguro de eliminar esta playlist?")) return;
  const res = await fetch(`${backendURL}/playlists/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
  const result = await res.json();
  alert(result.message || "Playlist eliminada");
  await loadPlaylists();
}
function asignarDesdePlaylist(playlistId) {
  localStorage.setItem("directPlaylistId", playlistId);
  window.location.href = "adminAssignVideos.html";
}
