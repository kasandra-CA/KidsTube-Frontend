// authFunctions.js - Lógica de login, registro y validación de PINs

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const backendURL = "http://localhost:3000/api";
    const userList = document.getElementById("user-list");

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
            if (result.token) {
                localStorage.setItem("token", result.token);
                localStorage.setItem("userId", result.user._id);
                localStorage.setItem("userName", result.user.firstName);
                alert("Login exitoso");
                window.location.href = "inicio.html";
            } else {
                alert(result.error);
            }
        });
    }

    // ✅ Cargar solo el usuario logueado y sus usuarios restringidos
    window.loadUsers = async () => {
        const userList = document.getElementById("user-list");
        if (!userList) return;

        userList.innerHTML = "";

        const userName = localStorage.getItem("userName");
        const userId = localStorage.getItem("userId");

        // Mostrar usuario adulto logueado
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

        // Mostrar usuarios restringidos asociados a ese adulto
        try {
            const response = await fetch(`${backendURL}/restricted-users?owner=${userId}`);
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
            console.error("Error cargando usuarios restringidos:", error);
        }
    };

    // Abrir modal de PIN al seleccionar usuario adulto
    window.openUser = (userId) => {
        selectedUser = userId;
        new bootstrap.Modal(document.getElementById('pinModal')).show();
    };

    // Ingresar directamente como usuario restringido
    window.openRestrictedUser = (userId) => {
        window.location.href = `playlist.html?restrictedUser=${userId}`;
    };

    // Validar PIN de usuario restringido
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
                alert("✅ Acceso permitido");
                window.location.href = `playlist.html?user=${selectedUser}`;
            } else {
                alert("❌ PIN incorrecto");
            }
        } catch (error) {
            console.error("Error validando PIN:", error);
        }
    };

    // Validar PIN de administrador
    window.validateAdminPIN = async () => {
        const pin = document.getElementById("adminPinInput").value;
        console.log("PIN que se está enviando:", pin);

        try {
            const response = await fetch("http://localhost:3000/api/validate-admin-pin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin })
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                window.location.href = "adminUsers.html";
            } else {
                alert(result.error || "PIN incorrecto.");
            }
        } catch (error) {
            console.error("Error validando PIN de admin:", error);
        }
    };
});
