const backendURL = "http://localhost:3000/api";
const restrictedUserId = new URLSearchParams(window.location.search).get("restrictedUser");

// ✅ Corregido: obtener playlists del usuario logueado
const ownerId = localStorage.getItem("userId");

document.addEventListener("DOMContentLoaded", async () => {
    if (!restrictedUserId || !ownerId) {
        alert("Faltan datos para cargar las playlists.");
        return;
    }

    try {
        const response = await fetch(`${backendURL}/playlists?owner=${ownerId}`);
        const playlists = await response.json();

        console.log("restrictedUserId:", restrictedUserId);
        console.log("playlists recibidas:", playlists);

        const filtered = playlists.filter(p =>
            p.profiles.some(pr => String(pr._id) === String(restrictedUserId))
        );

        console.log("Playlists filtradas:", filtered);

        const container = document.getElementById("playlists-container");
        container.innerHTML = "";

        if (filtered.length === 0) {
            container.innerHTML = "<p class='text-center'>Este perfil no tiene playlists asignadas.</p>";
            return;
        }

        filtered.forEach(playlist => {
            const section = document.createElement("div");
            section.className = "col-12 mb-4";

            let videosHTML = "";

            playlist.videos.forEach(video => {
                const embedUrl = convertToEmbedURL(video.url);
                if (!embedUrl) return;

                videosHTML += `
                    <div class="col-md-4 mb-3">
                        <div class="card">
                            <iframe class="card-img-top" src="${embedUrl}" frameborder="0" allowfullscreen loading="lazy"></iframe>
                            <div class="card-body">
                                <h5 class="card-title">${video.name}</h5>
                                <p class="card-text">${video.description || ''}</p>
                            </div>
                        </div>
                    </div>
                `;
            });

            const playlistId = `playlist-${playlist._id}`;
            const toggleId = `toggle-${playlist._id}`;

            section.innerHTML = `
                <h4 class="text-primary mb-2" style="cursor:pointer;" onclick="toggleVideos('${playlistId}', '${toggleId}')">
                    📂 ${playlist.name}
                    <small class="text-muted">(${playlist.videos.length} videos)</small>
                    <span id="${toggleId}" style="font-size: 1rem;">🔽</span>
                </h4>
                <div id="${playlistId}" class="row mb-3" style="display: none;">
                    ${videosHTML}
                </div>
                <hr>
            `;

            container.appendChild(section);
        });
    } catch (error) {
        console.error("Error cargando playlists:", error);
    }
});

function convertToEmbedURL(url) {
    if (!url) return null;

    // Si ya es formato embed, lo aceptamos directamente
    if (url.includes("youtube.com/embed/")) return url;

    // Si es un link normal, lo convertimos
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function toggleVideos(containerId, iconId) {
    const container = document.getElementById(containerId);
    const icon = document.getElementById(iconId);

    const isVisible = container.style.display === "block";

    container.style.display = isVisible ? "none" : "block";
    icon.textContent = isVisible ? "🔽" : "🔼";
}