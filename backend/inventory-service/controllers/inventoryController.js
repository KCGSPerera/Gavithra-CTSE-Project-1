const Inventory = require('../models/Inventory');

// GET all inventory items
exports.getAllItems = async (req, res) => {
  const items = await Inventory.find();
  res.json(items);
};

// GET by MongoDB _id
exports.getItemById = async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found by ID' });
  res.json(item);
};

// GET by name
exports.getItemByName = async (req, res) => {
  const item = await Inventory.findOne({ name: req.params.name });
  if (!item) return res.status(404).json({ message: 'Item not found by name' });
  res.json(item);
};

// GET by productId
exports.getItemByProductId = async (req, res) => {
  const item = await Inventory.findOne({ productId: req.params.productId });
  if (!item) return res.status(404).json({ message: 'Item not found by productId' });
  res.json(item);
};

// CREATE new inventory item
exports.createItem = async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE by name
exports.updateItemByName = async (req, res) => {
  const updated = await Inventory.findOneAndUpdate({ name: req.params.name }, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Item not found to update (by name)' });
  res.json(updated);
};

// UPDATE by productId
exports.updateItemByProductId = async (req, res) => {
  const updated = await Inventory.findOneAndUpdate({ productId: req.params.productId }, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Item not found to update (by productId)' });
  res.json(updated);
};

// DELETE by name
exports.deleteItemByName = async (req, res) => {
  const deleted = await Inventory.findOneAndDelete({ name: req.params.name });
  if (!deleted) return res.status(404).json({ message: 'Item not found to delete (by name)' });
  res.json({ message: 'Item deleted by name' });
};

// DELETE by productId
exports.deleteItemByProductId = async (req, res) => {
  const deleted = await Inventory.findOneAndDelete({ productId: req.params.productId });
  if (!deleted) return res.status(404).json({ message: 'Item not found to delete (by productId)' });
  res.json({ message: 'Item deleted by productId' });
};
