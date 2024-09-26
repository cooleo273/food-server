const mongoose = require('mongoose'); // Import mongoose

// Define the order schema
const orderSchema = new mongoose.Schema({
  orderDate: { type: Date, required: true },
  customerName: { type: String, required: true }, // Customer's name
  customerPhone: { type: String, required: true }, // Customer's phone number
  items: [{ 
    name: String, 
    quantity: Number // Add quantity field for each item
  }], // Array of items ordered
  cafeName: { type: String, required: true }, // Name of the cafe where the order was placed 
  tx_ref: { type: String, required: true, unique: true }, // Transaction reference from payment
  paymentStatus: { type: String, default: 'pending' }, // Payment status: 'pending', 'paid', 'failed',
  orderStatus: { 
    type: String, 
    enum: ['pending', 'being made', 'ready for pickup', 'out for delivery', 'delivered', 'cancelled', 'failed', 'completed'], // Enum for order statuses
    default: 'pending' 
  }, // Order status 
}, { timestamps: true });  // Adds createdAt and updatedAt timestamps

// Create the Order model from the schema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
