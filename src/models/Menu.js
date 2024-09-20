// models/menu.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  photo: { type: String }, // Path to image
  description: { type: String } // Description of the item
});

const menuSchema = new mongoose.Schema({
  cafe: { type: String, required: true },
  items: [menuItemSchema]
});

module.exports = mongoose.model('Menu', menuSchema);
