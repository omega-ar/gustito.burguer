const API_URL = window.API_URL || 'http://localhost:8080/api';

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMsg');
  
  errorMsg.style.display = 'none';
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      
      if (data.usuario.rol === 'admin') {
        window.location.href = 'admin.html';
      } else if (data.usuario.rol === 'cajero') {
        window.location.href = 'caja.html';
      } else {
        window.location.href = 'caja.html';
      }
    } else {
      errorMsg.textContent = data.mensaje || 'Credenciales incorrectas';
      errorMsg.style.display = 'block';
    }
  } catch (error) {
    errorMsg.textContent = 'Error de conexión con el servidor';
    errorMsg.style.display = 'block';
  }
});