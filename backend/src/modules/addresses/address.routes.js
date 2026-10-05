const { Router } = require('express');
const addressController = require('./address.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

const router = Router();

router.use(verifyToken);

router.get('/', addressController.getAddresses);
router.post('/', addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefault);

module.exports = router;
