const { Setting } = require('../../models');
const config = require('../../config/env');

const KEY = 'store';
const CACHE_MS = config.isTest ? 0 : 30 * 1000;

let cache = null;
let cachedAt = 0;

/**
 * Get the store settings document, creating it from the environment
 * defaults on first use.
 * @returns {Promise<object>} plain settings object
 */
async function getSettings() {
  if (cache && Date.now() - cachedAt < CACHE_MS) return cache;

  let doc = await Setting.findOne({ key: KEY });
  if (!doc) {
    try {
      doc = await Setting.create({
        key: KEY,
        gstInclusive: config.business.gstInclusive,
        gstPercent: config.business.gstPercent,
        deliveryCharge: config.business.deliveryCharge,
        freeDeliveryAbove: config.business.freeDeliveryAbove,
        enableCod: config.business.enableCod,
      });
    } catch (err) {
      // Two first requests raced: the other one created it
      if (err.code !== 11000) throw err;
      doc = await Setting.findOne({ key: KEY });
    }
  }

  cache = doc.toJSON();
  cachedAt = Date.now();
  return cache;
}

/**
 * Settings as the storefront sees them, plus which payment methods can
 * actually be used right now.
 */
async function getPublicSettings() {
  const settings = await getSettings();
  return {
    ...settings,
    paymentMethods: {
      cod: settings.enableCod,
      razorpay: config.razorpay.enabled,
    },
  };
}

/**
 * Update store settings (super admin).
 * @param {object} data - validated partial settings
 */
async function updateSettings(data) {
  await getSettings();
  const doc = await Setting.findOne({ key: KEY });
  Object.assign(doc, data);
  await doc.save();
  cache = null;
  return getPublicSettings();
}

module.exports = { getSettings, getPublicSettings, updateSettings };
