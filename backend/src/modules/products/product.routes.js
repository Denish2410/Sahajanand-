const { Router } = require('express');
const productController = require('./product.controller');

const router = Router();

// Public routes — order matters: static paths before :slug
router.get('/featured', productController.getFeatured);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/brands', productController.getBrands);
router.get('/', productController.getProducts);
router.get('/:id/related', productController.getRelatedProducts);
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
