// functions.js - Agregar lógica de login y registro en el frontend
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const backendURL = "http://localhost:3000/api";

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
                alert("Login exitoso");
                window.location.href = "home.html";
            } else {
                alert(result.error);
            }
        });
    }

     // Cargar usuarios restringidos
     const loadUsers = async () => {
        try {
            const response = await fetch(`${backendURL}/users`);
            const users = await response.json();

            userList.innerHTML = ""; // Limpiar antes de renderizar
            users.forEach(user => {
                const userCard = `
                    <div class="col-md-3 text-center">
                        <img src="https://ui-avatars.com/api/?name=${user.firstName}" class="rounded-circle" width="100">
                        <h5>${user.firstName}</h5>
                        <button class="btn btn-secondary mt-2" onclick="openUser('${user._id}')">Ingresar</button>
                    </div>
                `;
                userList.innerHTML += userCard;
            });
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        }
    };

    // Abrir modal de PIN al seleccionar usuario
    window.openUser = (userId) => {
        selectedUser = userId;
        new bootstrap.Modal(document.getElementById('pinModal')).show();
    };

    // Validar PIN
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

    loadUsers();
});