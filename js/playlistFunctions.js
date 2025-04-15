const backendURL = "http://localhost:3000/api";
const restrictedUserId = new URLSearchParams(window.location.search).get("restrictedUser");
const ownerId = localStorage.getItem("userId");

function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem("token");
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    if (!restrictedUserId || !ownerId) {
        alert("Faltan datos para cargar las playlists.");
        return;
    }

    try {
        const response = await fetchWithToken(`${backendURL}/playlists?owner=${ownerId}`);
        const playlists = await response.json();

        const filtered = playlists.filter(p =>
            p.profiles.some(pr => String(pr._id) === String(restrictedUserId))
        );

        renderPlaylists(filtered);

        const searchInput = document.getElementById("searchInput");
        searchInput.addEventListener("input", () => {
            const term = searchInput.value.trim().toLowerCase();
            if (term === "") {
                renderPlaylists(filtered);
            } else {
                searchResults(filtered, term);
            }
        });
    } catch (error) {
        console.error("Error cargando playlists:", error);
    }
});

function renderPlaylists(playlists) {
    const container = document.getElementById("playlists-container");
    const searchMsg = document.getElementById("searchMessage");
    container.innerHTML = "";
    searchMsg.classList.add("d-none");

    playlists.forEach(playlist => {
        const section = document.createElement("div");
        section.className = "col-12 mb-4";

        const playlistId = `playlist-${playlist._id}`;
        const toggleId = `toggle-${playlist._id}`;

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

        section.innerHTML = `
            <h4 class="text-primary mb-2" style="cursor:pointer;" onclick="toggleVideos('${playlistId}', '${toggleId}')">
                📂 ${playlist.name}
                <small class="text-muted">(${playlist.videos.length} videos)</small>
                <span id="${toggleId}" style="font-size: 1rem;">🔽</span>
            </h4>
            <div id="${playlistId}" class="row mb-3" style="display: block;">
                ${videosHTML}
            </div>
            <hr>
        `;

        container.appendChild(section);
    });
}

function searchResults(playlists, term) {
    const container = document.getElementById("playlists-container");
    const searchMsg = document.getElementById("searchMessage");
    container.innerHTML = "";
    searchMsg.classList.remove("d-none");

    let results = [];

    playlists.forEach(playlist => {
        playlist.videos.forEach(video => {
            const embedUrl = convertToEmbedURL(video.url);
            if (!embedUrl) return;

            const nameMatch = video.name.toLowerCase().includes(term);
            const descMatch = (video.description || "").toLowerCase().includes(term);

            if (nameMatch || descMatch) {
                results.push({ video, embedUrl });
            }
        });
    });

    if (results.length === 0) {
        container.innerHTML = `<p class='text-center text-muted'>❌ No se encontraron resultados para "<strong>${term}</strong>"</p>`;
        return;
    }

    results.forEach(({ video, embedUrl }) => {
        const col = document.createElement("div");
        col.className = "col-md-4 mb-3";
        col.innerHTML = `
            <div class="card h-100">
                <iframe class="card-img-top" src="${embedUrl}" frameborder="0" allowfullscreen loading="lazy"></iframe>
                <div class="card-body">
                    <h5 class="card-title">${video.name}</h5>
                    <p class="card-text">${video.description || ''}</p>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

function convertToEmbedURL(url) {
    if (!url) return null;
    if (url.includes("youtube.com/embed/")) return url;
    
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