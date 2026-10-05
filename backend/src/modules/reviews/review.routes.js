const { Router } = require('express');
const reviewController = require('./review.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

const router = Router();

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/product/:productId', verifyToken, reviewController.createReview);
router.put('/:id', verifyToken, reviewController.updateReview);
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
