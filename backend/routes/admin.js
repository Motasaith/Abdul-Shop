const express = require('express');
const {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminUsers,
  updateUserStatus,
  deleteUser,
  getAdminOrders,
  updateOrderStatus,
  getVendorRequests,
  approveVendor,
  rejectVendor
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

const router = express.Router();

// Dashboard
router.get('/dashboard', auth, admin, getDashboardStats);

// Products
router.get('/products', auth, admin, getAdminProducts);
router.post('/products', auth, admin, upload, createProduct);
router.post('/products/simple', auth, admin, createProduct); // Fallback without upload
router.put('/products/:id', auth, admin, updateProduct);
router.delete('/products/:id', auth, admin, deleteProduct);

// Users
router.get('/users', auth, admin, getAdminUsers);
router.put('/users/:id/status', auth, admin, updateUserStatus);
router.delete('/users/:id', auth, admin, deleteUser);

router.get('/orders', auth, admin, getAdminOrders);
router.put('/orders/:id/status', auth, admin, updateOrderStatus);

// Vendors
router.get('/vendors/requests', auth, admin, getVendorRequests);
router.put('/vendors/:id/approve', auth, admin, approveVendor);
router.put('/vendors/:id/reject', auth, admin, rejectVendor);

module.exports = router;
