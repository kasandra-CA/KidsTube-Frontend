document.addEventListener("DOMContentLoaded", () => {
    const videoList = document.getElementById("video-list");
    const videoForm = document.getElementById("video-form");

    const backendURL = "http://localhost:3000/api"; // Asegúrate de que el backend esté corriendo en este puerto

    // Cargar videos al inicio
    const loadVideos = async () => {
        try {
            const response = await fetch(`${backendURL}/videos`);
            const videos = await response.json();

            videoList.innerHTML = "";
            videos.forEach(video => {
                const videoCard = `
                    <div class="col-md-4">
                        <div class="card mb-3">
                            <iframe class="card-img-top" src="${video.url}" frameborder="0" allowfullscreen></iframe>
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

    // Función para agregar un nuevo video
    const addVideo = async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const url = document.getElementById("url").value;
        const description = document.getElementById("description").value;

        try {
            const response = await fetch(`${backendURL}/videos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, url, description })
            });

            if (response.ok) {
                alert("✅ Video agregado con éxito");
                videoForm.reset();
                loadVideos(); // Recargar la lista de videos
            } else {
                const errorData = await response.json();
                alert(`❌ Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error al agregar video:", error);
        }
    };

    // Asignar la función addVideo al evento submit del formulario
    videoForm.addEventListener("submit", addVideo);

    // Función para eliminar un video
    window.deleteVideo = async (id) => {
        try {
            const response = await fetch(`${backendURL}/videos/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                alert("✅ Video eliminado con éxito");
                loadVideos(); // Recargar la lista de videos
            } else {
                const errorData = await response.json();
                alert(`❌ Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error al eliminar video:", error);
        }
    };

    // Función para editar un video
    window.editVideo = async (id) => {
        try {
            const response = await fetch(`${backendURL}/videos/${id}`);
            const video = await response.json();

            document.getElementById("name").value = video.name;
            document.getElementById("url").value = video.url;
            document.getElementById("description").value = video.description;

            // Cambiar el comportamiento del formulario para actualizar el video
            videoForm.onsubmit = async (event) => {
                event.preventDefault();

                const updatedName = document.getElementById("name").value;
                const updatedUrl = document.getElementById("url").value;
                const updatedDescription = document.getElementById("description").value;

                try {
                    const response = await fetch(`${backendURL}/videos/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ name: updatedName, url: updatedUrl, description: updatedDescription })
                    });

                    if (response.ok) {
                        alert("✅ Video actualizado con éxito");
                        videoForm.reset();
                        loadVideos(); // Recargar la lista de videos

                        // Restaurar el comportamiento original del formulario
                        videoForm.onsubmit = addVideo;
                    } else {
                        const errorData = await response.json();
                        alert(`❌ Error: ${errorData.error}`);
                    }
                } catch (error) {
                    console.error("Error al actualizar video:", error);
                }
            };
        } catch (error) {
            console.error("Error al cargar video para editar:", error);
        }
    };

    loadVideos();
});