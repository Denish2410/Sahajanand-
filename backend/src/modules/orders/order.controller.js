const orderService = require('./order.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const checkout = asyncHandler(async (req, res) => {
  const result = await orderService.checkout(req.user._id, req.body);
  return ApiResponse(res, 201, 'Order placed successfully', result);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const { orders, meta } = await orderService.getMyOrders(req.user._id, req.query);
  return ApiResponse(res, 200, 'Orders fetched', { orders }, meta);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user._id,
    req.user.role === 'admin'
  );
  return ApiResponse(res, 200, 'Order fetched', { order });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(
    req.params.id,
    req.user._id,
    req.body.reason
  );
  return ApiResponse(res, 200, 'Order cancelled', { order });
});

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await orderService.getInvoice(
    req.params.id,
    req.user._id,
    req.user.role === 'admin'
  );
  return ApiResponse(res, 200, 'Invoice fetched', { invoice });
});

module.exports = { checkout, getMyOrders, getOrderById, cancelOrder, getInvoice };
