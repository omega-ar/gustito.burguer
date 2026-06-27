window.API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8080/api'
  : 'https://mi-backend-gustito.vercel.app/api'; // Reemplazar con la URL real del backend cuando se despliegue
