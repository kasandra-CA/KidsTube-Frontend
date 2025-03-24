// ✅ Este archivo reemplaza adminFunctions.js con lo necesario para crear, ver, editar y eliminar usuarios restringidos

const backendURL = "http://localhost:3000/api";
let currentUserId = null;

async function loadRestrictedUsers() {
    try {
        const response = await fetch(`${backendURL}/restricted-users`);
        const users = await response.json();
        const userList = document.getElementById("restricted-users-list");
        userList.innerHTML = "";

        users.forEach(user => {
            const userCard = document.createElement("div");
            userCard.classList.add("col-md-3", "text-center", "mb-3");
            userCard.innerHTML = `
                <div class="card p-2">
                    <img src="images/avatars/${user.avatar}" class="img-fluid rounded-circle" width="80">
                    <p class="mt-2">${user.name}</p>
                    <button class="btn btn-warning btn-sm" onclick="editUser('${user._id}', '${user.name}', '${user.pin}', '${user.avatar}')">✏️ Editar</button>
                    <button class="btn btn-danger btn-sm mt-1" onclick="deleteUser('${user._id}')">🗑️ Eliminar</button>
                </div>
            `;
            userList.appendChild(userCard);
        });
    } catch (error) {
        console.error("Error cargando usuarios restringidos:", error);
    }
}

function openAddUserModal() {
    currentUserId = null;
    document.getElementById("modalTitle").innerText = "Agregar Usuario";
    document.getElementById("userId").value = "";
    document.getElementById("userName").value = "";
    document.getElementById("userPin").value = "";

    const defaultAvatar = "avatar1.png";
    document.getElementById("userAvatar").value = defaultAvatar;
    renderAvatarSelector(defaultAvatar);

    new bootstrap.Modal(document.getElementById("userModal")).show();
}

function editUser(id, name, pin, avatar) {
    currentUserId = id;
    document.getElementById("modalTitle").innerText = "Editar Usuario";
    document.getElementById("userId").value = id;
    document.getElementById("userName").value = name;
    document.getElementById("userPin").value = pin;
    document.getElementById("userAvatar").value = avatar;
    renderAvatarSelector(avatar);
    new bootstrap.Modal(document.getElementById("userModal")).show();
}

function renderAvatarSelector(selected = "avatar1.png") {
    const avatarSelector = document.getElementById("avatarSelector");
    avatarSelector.innerHTML = "";

    for (let i = 1; i <= 4; i++) {
        const avatarName = `avatar${i}.png`;
        const avatarImg = document.createElement("img");
        avatarImg.src = `images/avatars/${avatarName}`;
        avatarImg.classList.add("rounded-circle", "m-2", "border", "border-2");
        avatarImg.style.width = "70px";
        avatarImg.style.cursor = "pointer";
        avatarImg.dataset.avatar = avatarName;

        if (avatarName === selected) {
            avatarImg.classList.add("border-primary");
        } else {
            avatarImg.classList.add("border-light");
        }

        avatarImg.onclick = () => {
            document.getElementById("userAvatar").value = avatarName;
            renderAvatarSelector(avatarName);
        };

        avatarSelector.appendChild(avatarImg);
    }
}

async function saveUser() {
    const name = document.getElementById("userName").value.trim();
    const pin = document.getElementById("userPin").value.trim();
    const avatar = document.getElementById("userAvatar").value;

    if (!name || !pin || pin.length !== 6 || isNaN(pin) || !avatar) {
        alert("⚠️ Todos los campos son obligatorios y el PIN debe tener 6 dígitos numéricos.");
        return;
    }

    const payload = { name, pin, avatar };
    const method = currentUserId ? "PUT" : "POST";
    const url = currentUserId ? `${backendURL}/restricted-users/${currentUserId}` : `${backendURL}/restricted-users`;

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            bootstrap.Modal.getInstance(document.getElementById("userModal")).hide();
            loadRestrictedUsers();
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error("Error al guardar usuario:", error);
        alert("Error inesperado al guardar el usuario.");
    }
}

async function deleteUser(id) {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
        const response = await fetch(`${backendURL}/restricted-users/${id}`, {
            method: "DELETE"
        });
        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            loadRestrictedUsers();
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error("Error eliminando usuario:", error);
    }
}

// Cargar usuarios al iniciar
loadRestrictedUsers();