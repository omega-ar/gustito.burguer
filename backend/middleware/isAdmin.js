const { db } = require('../firebaseAdmin');

module.exports = async (req, res, next) => {
  try {
    const userDoc = await db.collection('usuarios').doc(req.user.uid).get();
    
    if (!userDoc.exists || userDoc.data().rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al verificar permisos.' });
  }
};