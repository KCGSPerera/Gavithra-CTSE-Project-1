const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getItemById,
  getItemByName,
  getItemByProductId,
  createItem,
  updateItemByName,
  updateItemByProductId,
  deleteItemByName,
  deleteItemByProductId
} = require('../controllers/inventoryController');

// Root CRUD
router.route('/').get(getAllItems).post(createItem);

// Get by Mongo _id
router.route('/id/:id').get(getItemById);

// Get/Update/Delete by name
router.route('/name/:name')
  .get(getItemByName)
  .put(updateItemByName)
  .delete(deleteItemByName);

// Get/Update/Delete by productId
router.route('/product/:productId')
  .get(getItemByProductId)
  .put(updateItemByProductId)
  .delete(deleteItemByProductId);

module.exports = router;
