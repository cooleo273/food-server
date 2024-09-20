const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
});

// Create a new order

// Update order status
router.put('/:id/delivered', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await Order.findByIdAndUpdate(req.params.id, { delivered: true });

        res.json({ message: 'Order marked as delivered' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error while updating order status' });
    }
});


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
