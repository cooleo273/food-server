const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

const dayjs = require('dayjs');

// Get all orders (this is already in your `routes/order.js`)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find();  // Fetch orders from the database
        
        // Optional: Format `createdAt` field
        const formattedOrders = orders.map(order => ({
            ...order.toObject(), 
            orderDate: dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss'),  // Format date
        }));
        
        res.json(formattedOrders);  // Send the orders with formatted `createdAt` back to the admin
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
});


// Update order status
router.put('/:id/status', async (req, res) => {
  try {
      const { status } = req.body;
      if (!status) {
          return res.status(400).json({ message: 'Status is required' });
      }

      const order = await Order.findById(req.params.id);
      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      order.orderStatus = status; // Update order status
      await order.save();

      res.json({ message: `Order status updated to ${status}` });
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Server error' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).send({ message: 'Order not found' });
    }
    res.status(200).send({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Server error', error });
  }
});


// Mark order as delivered
router.put('/:id/delivered', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await Order.findByIdAndUpdate(req.params.id, { delivered: true, orderStatus: 'delivered' });

        res.json({ message: 'Order marked as delivered' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error while updating order status' });
    }
});

// Update payment status
router.put('/:id/payment', async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        if (paymentStatus === undefined) {
            return res.status(400).json({ message: 'Please provide payment status' });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await Order.findByIdAndUpdate(req.params.id, { paymentStatus });

        res.json({ message: 'Payment status updated' });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Server error while updating payment status' });
    }
});

module.exports = router;
