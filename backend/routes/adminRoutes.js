const express = require('express');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { 
  getStockActual, 
  actualizarStock, 
  registrarCompra, 
  getAlertasStockBajo, 
  getHistorialMovimientos,
  getReporteDiario
} = require('../controllers/adminController');

const router = express.Router();

router.use(auth, isAdmin);

router.get('/stock', getStockActual);
router.put('/stock/:id', actualizarStock);
router.post('/stock/compra', registrarCompra);
router.get('/stock/alertas', getAlertasStockBajo);
router.get('/stock/historial', getHistorialMovimientos);
router.get('/reportes/diario', getReporteDiario);

module.exports = router;