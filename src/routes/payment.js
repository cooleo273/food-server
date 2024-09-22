const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config(); // Load Chapa secret key from .env
const Order = require('../models/Order');

// Initialize Payment Route
// Initialize Payment Route
router.post('/pay', async (req, res) => {  
  console.log('Payment request received:', req.body); // Log the request body
  try {
    const { amount, currency, first_name, tx_ref, callback_url, customization, phoneNumber, cafeName, itemOrdered, returnUrl } = req.body;

    if (!amount || !currency || !first_name || !tx_ref || !customization || !phoneNumber || !cafeName || !itemOrdered || !returnUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const chapaApiUrl = 'https://api.chapa.co/v1/transaction/initialize';
    const chapaSecretKey = process.env.CHAPA_SECRET_KEY;

    const options = {
      method: 'POST',
      url: chapaApiUrl,
      headers: {
        Authorization: `Bearer ${chapaSecretKey}`,
        'Content-Type': 'application/json',
      },
      data: {
        amount,
        currency,
        first_name,
        tx_ref,
        callback_url,
        return_url: returnUrl, // Make sure this is properly set
        customization,
        phoneNumber,
        cafeName,
        itemOrdered,
        meta: { hide_receipt: true },
      },
    };

    const response = await axios(options);
    console.log('Chapa Response:', response.data);

    if (response.data && response.data.data && response.data.data.checkout_url) {
      const newOrder = await Order.create({
        customerName: first_name,
        customerPhone: phoneNumber,
        items: itemOrdered,
        cafeName: cafeName,
        tx_ref,
        paymentStatus: 'pending',
        delivered: false,
        payment_url: response.data.data.checkout_url,
      });

      res.json({ payment_url: response.data.data.checkout_url, txRef: tx_ref });
    } else {
      throw new Error('Failed to get payment URL');
    }
  } catch (error) {
    console.error('Payment initialization error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});


// Callback Route
router.post('/callback', async (req, res) => {
  console.log('Callback received:', req.body); // Log the callback request body
  try {
    const { tx_ref, status } = req.body;

    if (!tx_ref || !status) {
      return res.status(400).json({ error: 'Missing transaction reference or status' });
    }

    const order = await Order.findOne({ tx_ref });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const response = await axios(options);
    if (response.status === 'success') {
      order.paymentStatus = 'paid';
      await order.save();
      res.status(200).json({ message: 'Order marked as paid' });
    } else {
      res.status(400).json({ message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Callback error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to process callback' });
  }
});

// Verify Payment Route
router.get('/verify', async (req, res) => {
  console.log('Verification request received:', req.query); // Log the request query parameters
  const { tx_ref } = req.query;

  if (!tx_ref) {
    return res.status(400).json({ error: 'Missing transaction reference' });
  }

  try {
    const chapaVerifyUrl = `https://api.chapa.co/v1/transaction/verify/${tx_ref}`;
    const chapaSecretKey = process.env.CHAPA_SECRET_KEY;

    const response = await axios.get(chapaVerifyUrl, {
      headers: { Authorization: `Bearer ${chapaSecretKey}` },
    });

    console.log('Verification Response:', response.data);

    if (response.data.status === 'success') {
      const order = await Order.findOne({ tx_ref });
      if (order) {
        order.paymentStatus = 'paid';
        await order.save();
        return res.status(200).json({ message: 'Payment verified and order updated' });
      }
    }
    return res.status(400).json({ error: 'Payment verification failed' });
  } catch (error) {
    console.error('Payment verification error:', error.response ? error.response.data : error.message);
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
});

module.exports = router;
