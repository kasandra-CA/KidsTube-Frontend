async function loadRestrictedUsers() {
    try {
        const response = await fetch("/api/restricted-users");
        const users = await response.json();
        const userList = document.getElementById("restricted-users-list");
        userList.innerHTML = "";

        users.forEach(user => {
            const userCard = document.createElement("div");
            userCard.classList.add("col-md-3", "text-center");
            userCard.innerHTML = `
                <div class="card p-2">
                    <img src="images/avatars/${user.avatar}" class="img-fluid rounded-circle" width="80">
                    <p>${user.name}</p>
                    <button class="btn btn-warning" onclick="editUser('${user._id}')">✏️ Editar</button>
                    <button class="btn btn-danger" onclick="deleteUser('${user._id}')">🗑️ Eliminar</button>
                </div>
            `;
            userList.appendChild(userCard);
        });
    } catch (error) {
        console.error("Error cargando usuarios restringidos:", error);
    }
}

function openAddUserPanel() {
    document.getElementById("userPanel").classList.remove("d-none");
    document.getElementById("userId").value = "";
    document.getElementById("userName").value = "";
    document.getElementById("userPin").value = "";
    document.getElementById("avatarContainer").innerHTML = "";
    
    const avatars = ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg", "avatar4.jpg"];
    avatars.forEach(avatar => {
        const avatarOption = document.createElement("img");
        avatarOption.src = `images/avatars/${avatar}`;
        avatarOption.classList.add("avatar-option", "img-thumbnail");
        avatarOption.onclick = () => selectAvatar(avatar);
        document.getElementById("avatarContainer").appendChild(avatarOption);
    });
}

function selectAvatar(avatar) {
    document.getElementById("selectedAvatar").value = avatar;
}

async function saveUser() {
    const userId = document.getElementById("userId").value;
    const name = document.getElementById("userName").value;
    const pin = document.getElementById("userPin").value;
    const avatar = document.getElementById("selectedAvatar").value;

    if (!name || !pin || pin.length !== 6 || !avatar) {
        alert("Por favor, completa todos los campos correctamente.");
        return;
    }

    const payload = { name, pin, avatar };
    const method = userId ? "PUT" : "POST";
    const endpoint = userId ? `/api/restricted-users/${userId}` : "/api/restricted-users";

    try {
        const response = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            loadRestrictedUsers();
            document.getElementById("userPanel").classList.add("d-none");
        } else {
            alert("Error al guardar usuario.");
        }
    } catch (error) {
        console.error("Error guardando usuario:", error);
    }
}