# 🎬 KidsTube

KidsTube es una plataforma web educativa que permite a padres, docentes o cuidadores gestionar videos de YouTube organizados en playlists, asignadas a usuarios restringidos (niños/as), con funciones de autenticación segura, control de acceso y búsqueda de contenido.

---

## 🚀 Funcionalidades principales

- 🔐 Registro de usuarios con verificación por correo y código SMS
- 👦 Gestión de usuarios restringidos con PIN y avatar
- 🎥 Subida de videos desde URL o búsqueda en YouTube (API integrada)
- 📂 Creación de playlists y asignación de videos
- 👁️ Visualización segura por perfil
- 🧠 Autenticación con Google (Sign-In)
- ✅ Protección de rutas con JWT
- 📧 Envío de correos con Brevo (antes Sendinblue)
- 📱 Verificación 2FA con Vonage (SMS)

---

## 🧩 Tecnologías utilizadas

### 🖥️ Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5
- Google Sign-In
- YouTube Data API v3

### 🛠️ Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (JSON Web Tokens)
- Google OAuth2
- Brevo API (envío de correos)
- Vonage API (verificación SMS)

---

## 📂 Estructura del proyecto

### 📁 `ProyectKidsTube-Frontend/`
- `auth.html`, `inicio.html`, `playlist.html`, etc.
- `js/` (archivos funcionales separados por módulo)
- `images/` (avatares u otros recursos)

### 📁 `ProyectKidsTube-Backend/`
- `controllers/` (auth, videos, playlists, usuarios restringidos)
- `models/` (schemas Mongoose)
- `middleware/` (verificación de token)
- `utils/` (envío de correo y SMS)
- `index.js` (punto de entrada del servidor)

---

## 📷 Capturas de pantalla

| Pantalla | Descripción |
|---------|-------------|
| ![auth](./screenshots/auth.png) | Registro con Google o email |
| ![inicio](./screenshots/inicio.png) | Selección de usuario y acceso admin |
| ![admin](./screenshots/admin.png) | CRUD de usuarios restringidos y playlists |

> 📁 Nota: crea una carpeta `screenshots/` si vas a incluir imágenes

---

## 🔧 Instalación y ejecución

1. Clonar el repositorio:

```bash
git clone https://github.com/tuusuario/kidstube.git
```

2. Instalar dependencias en frontend y backend:

```bash
cd ProyectKidsTube-Backend
npm install

cd ../ProyectKidsTube-Frontend
# (Usar Live Server o servidor local para ver `auth.html`)
```

3. Crear archivo `.env` en el backend con tus claves:

```env
PORT=3000
MONGO_URI=mongodb+srv://...
BREVO_API_KEY=...
VONAGE_API_KEY=...
VONAGE_API_SECRET=...
GOOGLE_CLIENT_ID=...
```

4. Ejecutar el backend:

```bash
npm start
```

5. Abrir el frontend en `http://127.0.0.1:5500/auth.html` con Live Server.

---

## 📌 Consideraciones

- Se requiere conexión a internet para que funcione el inicio de sesión con Google y la búsqueda en YouTube.
- Los usuarios restringidos acceden solo con PIN y ven solo sus playlists.
- La plataforma es segura y cumple con buenas prácticas de autenticación y protección de rutas.

---

## 👩‍💻 Autor

Desarrollado por **Kasandra Cruz A.** e **Irella León Vargas**  
📚 Proyecto académico - Universidad Técnica Nacional (UTN)

---

## 📄 Licencia

Este proyecto es de uso académico y educativo. Todos los derechos reservados © 2025.