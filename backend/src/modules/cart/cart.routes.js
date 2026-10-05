const { Router } = require('express');
const cartController = require('./cart.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

const router = Router();

router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:productId', cartController.updateItem);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);
router.post('/merge', cartController.mergeCart);

module.exports = router;
