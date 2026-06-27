const express = require('express');
const auth = require('../middleware/auth');
const { abrirCaja, cerrarCaja, getEstadoCaja } = require('../controllers/cashController');

const router = express.Router();

router.post('/abrir', auth, abrirCaja);
router.post('/cerrar', auth, cerrarCaja);
router.get('/estado', auth, getEstadoCaja);

module.exports = router;