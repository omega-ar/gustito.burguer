const { db } = require('../firebaseAdmin');
const jwt = require('jsonwebtoken');

const FIREBASE_API_KEY = 'AIzaSyDCO8gvHEVgiu9SWj1j3Fmoqrj9sWWmPdE';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas', error: data.error.message });
    }

    const userDoc = await db.collection('usuarios').doc(data.localId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado en el sistema.' });
    }

    const userData = userDoc.data();
    
    if (!userData.activo) {
      return res.status(401).json({ mensaje: 'Usuario desactivado.' });
    }

    const token = jwt.sign(
      { uid: data.localId, email: data.email, rol: userData.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        uid: data.localId,
        nombre: userData.nombre,
        email: data.email,
        rol: userData.rol
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  const { email, password, nombre, telefono, rol } = req.body;

  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: data.error.message });
    }

    await db.collection('usuarios').doc(data.localId).set({
      nombre,
      email,
      telefono,
      rol: rol || 'cajero',
      activo: true,
      createdAt: new Date()
    });

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      uid: data.localId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userDoc = await db.collection('usuarios').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    res.json({
      uid: req.user.uid,
      ...userDoc.data()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};