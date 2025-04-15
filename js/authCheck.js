document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
        localStorage.clear(); // por si quedó algo
        alert("⚠️ Tu sesión ha expirado o no has iniciado sesión.");
        window.location.href = "auth.html";
    }
});

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000); // tiempo actual en segundos
        return payload.exp < currentTime;
    } catch (e) {
        return true; // si algo falla, mejor bloquear
    }
}
