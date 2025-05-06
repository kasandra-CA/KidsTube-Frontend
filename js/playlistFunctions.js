document.addEventListener("DOMContentLoaded", async () => {
  await cargarPlaylistsDelUsuarioRestringido();
});

async function cargarPlaylistsDelUsuarioRestringido() {
  const token = localStorage.getItem("token");

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("restrictedUser");

  if (!token || !userId) {
    alert("⚠️ Usuario restringido no autenticado.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/playlists?restrictedUser=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const playlists = await res.json();
    const container = document.getElementById("playlistContainer");
    container.innerHTML = "";

    if (playlists.length ===0) {
      container.innerHTML = "<p class='text-center text-muted'>No hay playlists disponibles.</p>";
      return;
    }

    playlists.forEach(playlist => {
      const col = document.createElement("div");
      col.className = "col-12";

      let videosHTML = "";

      if (!playlist.videos || playlist.videos.length === 0) {
        videosHTML = `<p class="text-muted">Esta playlist no tiene videos.</p>`;
      } else {
        videosHTML = `<div class="row row-cols-1 row-cols-md-3 g-3">`;

        playlist.videos.forEach(video => {
          if (isValidYouTubeEmbedUrl(video.url)) {
            videosHTML += `
              <div class="col">
                <div class="card h-100">
                  <iframe class="card-img-top" src="${video.url}" frameborder="0" allowfullscreen></iframe>
                  <div class="card-body">
                    <h5 class="card-title">${video.name}</h5>
                    <p class="card-text">${video.description || "Sin descripción"}</p>
                  </div>
                </div>
              </div>
            `;
          } else {
            videosHTML += `
              <div class="col">
                <div class="card h-100 border-warning bg-light">
                  <div class="card-body text-center">
                    <h5 class="card-title text-danger">⚠️ ${video.name || "Video sin nombre"}</h5>
                    <p class="card-text">Este video está asignado pero no tiene una URL válida.</p>
                  </div>
                </div>
              </div>
            `;
          }
        });

        videosHTML += `</div>`;
      }

      col.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-body">
            <h4 class="text-danger playlist-header mb-3">🎧 ${playlist.name}</h4>
            ${videosHTML}
          </div>
        </div>
      `;

      container.appendChild(col);
    });
  } catch (error) {
    console.erro("❌ Error al cargar playlists:", error);
    alert("Error al cargar las playlists.");
  }
}

function isValidYouTubeEmbedUrl(url) {
  return typeof url === "string" && url.startsWith("https://www.youtube.com/embed/");
}

// 🔍 Búsqueda de videos desde backend REST
window.handlePlaylistSearch = async function () {
  const token = localStorage.getItem("token");
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("restrictedUser");
  const query = document.getElementById("playlistSearchInput").value.trim();

  if (!query) {
    await cargarPlaylistsDelUsuarioRestringido();
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/playlists/search-videos?userId=${userId}&text=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const videos = await res.json();
    renderSearchResults(videos);
  } catch (err) {
    console.error("❌ Error al buscar videos:", err);
    alert("Error al realizar la búsqueda.");
  }
};

function renderSearchResults(videos) {
  const container = document.getElementById("playlistContainer");
 container.innerHTML = "";

  if (!videos || videos.length === 0) {
    container.innerHTML = "<p class='text-center text-muted'>❌ No se encontraron videos con ese término.</p>";
    return;
  }

  let content = `<div class="row row-cols-1 row-cols-md-3 g-3">`;

  videos.forEach(video => {
    if (isValidYouTubeEmbedUrl(video.url)) {
      content += `
        <div class="col">
          <div class="card h-100">
            <iframe class="card-img-top" src="${video.url}" frameborder="0" allowfullscreen></iframe>
            <div class="card-body">
              <h5 class="card-title">${video.name}</h5>
              <p class="card-text">${video.description || "Sin descripción"}</p>
            </div>
          </div>
        </div>
      `;
    }
  });

  content += `</div>`;
  container.innerHTML = content;
}