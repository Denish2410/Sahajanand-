const { Router } = require('express');
const settingsService = require('./settings.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const router = Router();

// Public: store name, contact details, pricing rules, payment methods
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const settings = await settingsService.getPublicSettings();
    return ApiResponse(res, 200, 'Settings fetched', { settings });
  })
);

module.exports = router;
