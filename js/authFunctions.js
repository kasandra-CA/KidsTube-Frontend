document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const backendURL = "http://localhost:3000/api";

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

            try {
                const formData = new FormData(loginForm);
                const data = Object.fromEntries(formData);

                const response = await fetch(`${backendURL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const result = await response.json().catch(() => ({}));

                if (result?.userId && result?.user?.firstName) {
                    window.smsUserId = result.userId;
                    window.smsUserName = result.user.firstName;

                    const modalElement = document.getElementById("smsModal");
                    const modalInstance = new bootstrap.Modal(modalElement);
                    modalInstance.show();
                } else {
                    alert(result.error || "❌ Credenciales inválidas");
                }
            } catch (error) {
                console.error("❌ Error inesperado durante el login:", error);
                alert("❌ Error de red o de servidor.");
            }
        });
    }

    window.verifySMSCode = async () => {
        const code = document.getElementById("smsCodeInput").value.trim();
        if (!code || code.length !== 6) {
            alert("⚠️ El código debe tener 6 dígitos.");
            return;
        }

        try {
            const response = await fetch(`${backendURL}/verify-sms`, {
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

    window.loadUsers = async () => {
        const userList = document.getElementById("user-list");
        if (!userList) return;

        userList.innerHTML = "";

        const userName = localStorage.getItem("userName");
        const userId = localStorage.getItem("userId");

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

    //Sesion con Google
    window.handleGoogleCredentialResponse = async function (response) {
        const idToken = response.credential;

        // Enviar al backend
        const res = await fetch("http://localhost:3000/api/google-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken })
        });

        const result = await res.json();

        if (res.ok && result.token && result.userId) {
            localStorage.setItem("token", result.token);
            localStorage.setItem("userId", result.userId);
            localStorage.setItem("userName", result.name || "Usuario");

            // Verificar si le faltan datos
            if (result.needExtraData) {
                window.location.href = "completar-registro.html"; // esta página la creas tú
            } else {
                window.location.href = "inicio.html";
            }
        } else {
            alert(result.error || "❌ Error de autenticación con Google.");
        }
    };
});
