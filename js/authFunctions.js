// authFunctions.js - Lógica de login, registro y validación de PINs

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const backendURL = "http://localhost:3000/api";

    // 👉 Reutilizable: fetch con token
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

    // 📝 REGISTRO
    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData);

            const response = await fetch(`${backendURL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            alert(result.message || result.error);
        });
    }

    // 🔐 LOGIN + código SMS vía modal
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData);

            const response = await fetch(`${backendURL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                window.smsUserId = result.userId;
                window.smsUserName = result.user.firstName;

                // Mostrar modal Bootstrap para ingresar el código SMS
                new bootstrap.Modal(document.getElementById("smsModal")).show();
            } else {
                alert(result.error || "❌ Error al iniciar sesión");
            }
        });
    }

    // 🔄 Cargar usuarios (para inicio.html)
    window.loadUsers = async () => {
        const userList = document.getElementById("user-list");
        if (!userList) return;

        userList.innerHTML = "";

        const userName = localStorage.getItem("userName");
        const userId = localStorage.getItem("userId");

        // Usuario adulto logueado
        if (userName && userId) {
            const mainUserCard = `
                <div class="col-md-3 text-center">
                    <img src="https://ui-avatars.com/api/?name=${userName}" class="rounded-circle" width="100">
                    <h5>${userName}</h5>
                    <button class="btn btn-secondary mt-2" onclick="openUser('${userId}')">Ingresar</button>
                </div>
            `;
            userList.innerHTML += mainUserCard;
        }

        // Usuarios restringidos
        try {
            const response = await fetchWithToken(`${backendURL}/restricted-users?owner=${userId}`);
            if (!response.ok) throw new Error("No autorizado");
            const restrictedUsers = await response.json();

            restrictedUsers.forEach(user => {
                const userCard = `
                    <div class="col-md-3 text-center">
                        <img src="images/avatars/${user.avatar}" class="rounded-circle" width="100">
                        <h5>${user.name}</h5>
                        <button class="btn btn-secondary mt-2" onclick="openRestrictedUser('${user._id}')">Ingresar</button>
                    </div>
                `;
                userList.innerHTML += userCard;
            });
        } catch (error) {
            console.error("❌ Error cargando usuarios restringidos:", error);
            userList.innerHTML += `<p class="text-muted text-center">⚠️ No se pudieron cargar los perfiles.</p>`;
        }
    };

    // 🔐 PIN de usuario administrador
    window.openUser = (userId) => {
        selectedUser = userId;
        new bootstrap.Modal(document.getElementById('pinModal')).show();
    };

    window.validatePIN = async () => {
        const pin = document.getElementById("pinInput").value;
        try {
            const response = await fetch(`${backendURL}/validate-pin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: selectedUser, pin })
            });
            const result = await response.json();
            if (response.ok) {
                window.location.href = `playlist.html?restrictedUser=${selectedUser}`;
            } else {
                alert("❌ PIN incorrecto");
            }
        } catch (error) {
            console.error("Error validando PIN:", error);
        }
    };

    // ✅ VALIDAR ADMIN
    window.validateAdminPIN = async () => {
        const pin = document.getElementById("adminPinInput").value;
        const targetPage = localStorage.getItem("adminTarget");

        try {
            const response = await fetch(`${backendURL}/validate-admin-pin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin })
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                if (targetPage === "users") {
                    window.location.href = "adminUsers.html";
                } else if (targetPage === "playlists") {
                    window.location.href = "adminPlaylists.html";
                }
            } else {
                alert(result.error || "PIN incorrecto.");
            }
        } catch (error) {
            console.error("Error validando PIN de admin:", error);
        }
    };

    // 🔐 PIN para perfil restringido
    let selectedRestrictedUser = null;

    window.openRestrictedUser = (userId) => {
        selectedRestrictedUser = userId;
        new bootstrap.Modal(document.getElementById('pinRestrictedModal')).show();
    };

    window.validateRestrictedPIN = async () => {
        const pin = document.getElementById("restrictedPinInput").value;

        try {
            const response = await fetch(`${backendURL}/validate-restricted-pin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: selectedRestrictedUser, pin })
            });

            const result = await response.json();
            if (response.ok) {
                window.location.href = `playlist.html?restrictedUser=${selectedRestrictedUser}`;
            } else {
                alert(result.error || "❌ PIN incorrecto");
            }
        } catch (error) {
            console.error("Error validando PIN:", error);
            alert("❌ Error al validar PIN");
        }
    };
});

// ✅ FUNCIÓN GLOBAL para verificar código SMS desde modal
window.verifySMSCode = async () => {
    const code = document.getElementById("smsCodeInput").value.trim();
    if (!code || code.length !== 6) {
        alert("⚠️ El código debe tener 6 dígitos.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/verify-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: window.smsUserId, code })
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem("token", result.token);
            localStorage.setItem("userId", window.smsUserId);
            localStorage.setItem("userName", window.smsUserName);
            alert("🎉 Login exitoso");
            window.location.href = "inicio.html";
        } else {
            alert(result.error || "❌ Código incorrecto");
        }
    } catch (error) {
        console.error("Error verificando código SMS:", error);
        alert("❌ Error interno al verificar código");
    }
};