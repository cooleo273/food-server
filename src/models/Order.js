const mongoose = require('mongoose'); // Import mongoose

// Define the order schema
const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true }, // Customer's name
  customerPhone: { type: String, required: true }, // Customer's phone number
  items: [{ type: String, required: true }], // Array of items ordered
  cafeName: { type: String, required: true }, // Name of the cafe where the order was placed
  delivered: { type: Boolean, default: false }, // Delivery status of the order
  tx_ref: { type: String, required: true, unique: true }, // Transaction reference from payment
  paymentStatus: { type: String, default: 'pending' }, // Payment status: 'pending', 'paid', 'failed'
}, { timestamps: true });  // Adds createdAt and updatedAt timestamps

// Create the Order model from the schema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
