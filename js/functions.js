const backendURL = "http://localhost:3000/api";
const userId = localStorage.getItem("userId");

document.addEventListener("DOMContentLoaded", () => {
  loadVideos();

  document.getElementById("video-form").addEventListener("submit", submitNewVideo);
  document.getElementById("editVideoForm").addEventListener("submit", submitEditVideo);
});

function convertToEmbedURL(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
  const match = url.match(regex);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

// 📥 Cargar videos
async function loadVideos() {
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(`${backendURL}/videos?owner=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (!res.ok) {
        const error = await res.json();
        console.error("❌ Error al cargar videos:", error.error);
        alert("⚠️ No tienes permisos para ver los videos (token inválido o expirado)");
        return;
      }
  
      const videos = await res.json();
  
      const container = document.getElementById("video-list");
      container.innerHTML = "";
  
      videos.forEach(video => {
        const embedUrl = convertToEmbedURL(video.url);
        const card = document.createElement("div");
        card.className = "col-md-4";
        card.innerHTML = `
          <div class="card h-100 video-card shadow-sm">
            <iframe class="card-img-top" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
            <div class="card-body">
              <h5 class="card-title">${video.name}</h5>
              <p class="card-text">${video.description}</p>
              <button class="btn btn-primary me-2" onclick="openEditModal('${video._id}')">✏️ Editar</button>
              <button class="btn btn-danger" onclick="deleteVideo('${video._id}')">🗑 Eliminar</button>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
  
    } catch (err) {
      console.error("❌ Error al cargar videos:", err);
    }
  }  

// ➕ Agregar nuevo video
async function submitNewVideo(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const url = convertToEmbedURL(document.getElementById("url").value);
  const description = document.getElementById("description").value;

  const payload = { name, url, description, owner: userId };

  try {
    const res = await fetch(`${backendURL}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (res.ok) {
      alert("✅ Video agregado");
      document.getElementById("video-form").reset();
      loadVideos();
    } else {
      alert("❌ " + (result.error || "No se pudo agregar"));
    }
  } catch (err) {
    console.error("❌ Error al agregar:", err);
  }
}

// ✏️ Abrir modal y precargar datos
window.openEditModal = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendURL}/videos/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
  
      if (!res.ok) {
        const error = await res.json();
        console.error("❌ Error en la respuesta:", error);
        alert("⚠️ No se pudo cargar el video para editar.");
        return;
      }
  
      const video = await res.json();
  
      document.getElementById("editId").value = video._id;
      document.getElementById("editName").value = video.name;
      document.getElementById("editUrl").value = video.url;
      document.getElementById("editDescription").value = video.description;
  
      const modal = new bootstrap.Modal(document.getElementById("editModal"));
      modal.show();
    } catch (err) {
      console.error("❌ Error al abrir modal:", err);
    }
  };  

// 💾 Enviar cambios desde el modal
async function submitEditVideo(e) {
    e.preventDefault();
  
    const id = document.getElementById("editId").value;
    const name = document.getElementById("editName").value;
    const url = convertToEmbedURL(document.getElementById("editUrl").value);
    const description = document.getElementById("editDescription").value;
  
    try {
      const res = await fetch(`${backendURL}/videos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` // ✅ AÑADIDO AQUÍ
        },
        body: JSON.stringify({ name, url, description, owner: userId })
      });
  
      const result = await res.json();
  
      if (res.ok) {
        alert("✅ Video editado correctamente");
        bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
        loadVideos();
      } else {
        alert("❌ " + (result.error || "No se pudo editar"));
      }
    } catch (err) {
      console.error("❌ Error al editar video:", err);
    }
  }  

window.handleYouTubeSearch = async function () {
    const input = document.getElementById("youtubeSearchInput");
    const query = input.value.trim();
  
    if (!query) return alert("❗ Ingresa un término de búsqueda.");
  
    try {
      const data = await searchYouTube(query);
  
      if (!data || !data.items || data.items.length === 0) {
        alert("⚠️ No se encontraron resultados.");
        return;
      }
  
      const resultsContainer = document.getElementById("youtubeResults");
      resultsContainer.innerHTML = "";
  
      data.items.forEach(video => {
        const videoId = video.id.videoId;
        const title = video.snippet.title;
        const thumbnail = video.snippet.thumbnails.medium.url;
  
        const col = document.createElement("div");
        col.className = "col-md-4";
  
        col.innerHTML = `
          <div class="card h-100 shadow-sm">
            <img src="${thumbnail}" class="card-img-top" alt="${title}">
            <div class="card-body">
              <h6 class="card-title">${title}</h6>
              <button class="btn btn-success w-100" onclick="submitVideoFromSearch('${videoId}', '${escapeQuotes(title)}')">➕ Agregar</button>
            </div>
          </div>
        `;
  
        resultsContainer.appendChild(col);
      });
    } catch (err) {
      console.error("❌ Error al buscar en YouTube:", err);
      alert("❌ Hubo un problema al conectarse con YouTube.");
    }
  };

  function escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
  }

  // ➕ Agregar nuevo video manual
async function submitNewVideo(e) {
    e.preventDefault();
  
    const name = document.getElementById("name").value;
    const url = document.getElementById("url").value;
    const description = document.getElementById("description").value;
    const owner = localStorage.getItem("userId");
  
    const payload = { name, url, description, owner };
  
    try {
      const res = await fetch(`${backendURL}/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });
  
      const result = await res.json();
      if (res.ok) {
        alert("✅ Video agregado");
        document.getElementById("video-form").reset();
        loadVideos();
      } else {
        alert("❌ " + (result.error || "No se pudo agregar"));
      }
    } catch (err) {
      console.error("❌ Error al agregar:", err);
    }
  }
  
  // 🧪 Agregar video desde búsqueda de YouTube
  window.submitVideoFromSearch = async function (videoId, title) {
    console.log("🎯 Título:", title);
    console.log("🎯 videoId:", videoId);

    const url = `https://www.youtube.com/embed/${videoId}`;
    const description = "Video agregado desde búsqueda de YouTube";
    
    const payload = { name: title, url, description };
  
    try {
        console.log("📦 Enviando este payload al backend:", payload);

      const response = await fetch(`${backendURL}/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert("✅ Video agregado desde YouTube");
        loadVideos();
      } else {
        alert("❌ " + (result.error || "No se pudo agregar el video"));
      }
    } catch (err) {
      console.error("❌ Error al agregar video desde búsqueda:", err);
      alert("❌ Falló la conexión al servidor.");
    }
  };
  
  async function searchYouTube(query) {
    try {
      const apiKey = "AIzaSyDVkVIOSaFUSrgi2XtTS2u5LN3PyB_XX68"; // 👈 tu clave real
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=6&key=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error al consultar la API de YouTube:", errorText);
        throw new Error("No se pudo obtener resultados de YouTube");
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Error en searchYouTube:", error);
      return { items: [] };
    }
  }  

// 🗑 Eliminar video
window.deleteVideo = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este video?")) return;
  
    try {
      const res = await fetch(`${backendURL}/videos/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}` // ✅ token necesario
        }
      });
  
      const result = await res.json();
      if (res.ok) {
        alert("✅ Video eliminado");
        loadVideos();
      } else {
        alert("❌ " + (result.error || "No se pudo eliminar"));
      }
    } catch (err) {
      console.error("❌ Error al eliminar:", err);
    }
  };  