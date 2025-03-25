document.addEventListener("DOMContentLoaded", () => {
    const videoList = document.getElementById("video-list");
    const videoForm = document.getElementById("video-form");

    const backendURL = "http://localhost:3000/api";

    let editingVideoId = null; // 🟢 Variable para saber si estamos editando

    // 🛠 Función para convertir cualquier URL de YouTube al formato embed
    const convertToEmbedURL = (url) => {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
        const match = url.match(regex);
        if (match) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
        return url; // Si no es una URL válida de YouTube, se mantiene igual
    };

    // 🔄 Función para cargar videos correctamente
    const loadVideos = async () => {
        try {
            const response = await fetch(`${backendURL}/videos`);
            const videos = await response.json();

            videoList.innerHTML = ""; // ✅ LIMPIA la lista antes de renderizar

            videos.forEach(video => {
                let videoUrl = convertToEmbedURL(video.url); // 🔄 Asegurar que se muestra en embed

                const videoCard = `
                    <div class="col-md-4 video-card" data-id="${video._id}">
                        <div class="card mb-3">
                            <iframe class="card-img-top" width="560" height="315" src="${videoUrl}" title="YouTube video player" frameborder="0" allowfullscreen loading="lazy"></iframe>
                            <div class="card-body">
                                <h5 class="card-title">${video.name}</h5>
                                <p class="card-text">${video.description}</p>
                                <button class="btn btn-primary" onclick="editVideo('${video._id}')">Editar</button>
                                <button class="btn btn-danger" onclick="deleteVideo('${video._id}')">Eliminar</button>
                            </div>
                        </div>
                    </div>
                `;
                videoList.innerHTML += videoCard;
            });
        } catch (error) {
            console.error("Error cargando videos:", error);
        }
    };

    // 🔄 Función para manejar la creación/edición de videos
    videoForm.onsubmit = async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        let url = document.getElementById("url").value;
        const description = document.getElementById("description").value;

        url = convertToEmbedURL(url); // 🔄 Convertir la URL antes de enviarla

        if (editingVideoId) {
            // 🟢 MODO EDICIÓN (Actualizar un video existente)
            try {
                const response = await fetch(`${backendURL}/videos/${editingVideoId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, url, description })
                });

                if (response.ok) {
                    alert("✅ Video actualizado con éxito");
                    resetForm(); // 🔄 Restaurar el formulario
                    loadVideos(); // 🔄 Recargar lista
                } else {
                    const errorData = await response.json();
                    alert(`❌ Error: ${errorData.error}`);
                }
            } catch (error) {
                console.error("Error al actualizar video:", error);
            }
        } else {
            // 🆕 MODO CREACIÓN (Agregar nuevo video)
            try {
                const response = await fetch(`${backendURL}/videos`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, url, description })
                });

                if (response.ok) {
                    alert("✅ Video agregado con éxito");
                    resetForm();
                    loadVideos();
                } else {
                    const errorData = await response.json();
                    alert(`❌ Error: ${errorData.error}`);
                }
            } catch (error) {
                console.error("Error al agregar video:", error);
            }
        }
    };

    // 🛑 Función para iniciar la edición de un video
    window.editVideo = async (id) => {
        try {
            const response = await fetch(`${backendURL}/videos/${id}`);
            const video = await response.json();

            // Llenar el formulario con los datos del video a editar
            document.getElementById("name").value = video.name;
            document.getElementById("url").value = convertToEmbedURL(video.url); // 🔄 Convertir al formato embed
            document.getElementById("description").value = video.description;

            editingVideoId = id; // 🟢 Activar modo edición
        } catch (error) {
            console.error("Error al cargar video para editar:", error);
        }
    };

    // 🗑 Función para eliminar un video
    window.deleteVideo = async (id) => {
        try {
            const response = await fetch(`${backendURL}/videos/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                alert("✅ Video eliminado con éxito");
                loadVideos();
            } else {
                const errorData = await response.json();
                alert(`❌ Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error al eliminar video:", error);
        }
    };

    // 🔄 Función para restaurar el formulario después de editar
    const resetForm = () => {
        videoForm.reset();
        editingVideoId = null; // 🛑 Desactivar modo edición
    };

    loadVideos(); // Cargar videos al inicio
});
