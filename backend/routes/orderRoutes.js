const express = require('express');
const auth = require('../middleware/auth');
const { 
  createOrder, 
  getPendingOrders, 
  updateOrderStatus,
  marcarListo,
  getOrdersByDate,
  createPublicOrder,
  getPublicOrderById,
  getStoreStatus,
  createCajaOrder,
  getPedidosListos,
  getHistorialCaja
} = require('../controllers/orderController');

const router = express.Router();

router.post('/public', createPublicOrder);
router.get('/public/:id', getPublicOrderById);
router.get('/store-status', getStoreStatus);

router.post('/', auth, createOrder);
router.post('/caja', auth, createCajaOrder);
router.get('/pending', auth, getPendingOrders);
router.get('/listos', auth, getPedidosListos);
router.get('/historial', auth, getHistorialCaja);
router.put('/:id/status', auth, updateOrderStatus);
router.put('/:id/listo', auth, marcarListo);
router.get('/date/:fecha', auth, getOrdersByDate);

module.exports = router;