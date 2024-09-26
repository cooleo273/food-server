const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config(); // Load Chapa secret key from .env
const Order = require('../models/Order');

// Initialize Payment Route
router.post('/pay', async (req, res) => {
  console.log('Payment request received:', req.body);

  try {
    const {
      amount,
      currency,
      first_name,
      tx_ref,
      callback_url,
      customization,
      phoneNumber,
      cafeName,
      itemOrdered,
      returnUrl,
      orderDate // Accept orderDate from frontend
    } = req.body;

    if (!amount || !currency || !first_name || !tx_ref || !customization || !phoneNumber || !cafeName || !itemOrdered || !returnUrl || !orderDate) {
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
        // Do not set return_url here, handle it after successful payment
        customization,
        phoneNumber,
        cafeName,
        itemOrdered,
        meta: { hide_receipt: true },
      },
    };

    const response = await axios(options);
    console.log('Chapa Response:', response.data);

    if (response.data && response.data.payment_url) {
      return res.json({ payment_url: response.data.payment_url });
    } else {
      return res.status(500).json({ error: 'Failed to initiate payment' });
    }
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

// Payment Callback Route
router.post('/payment-callback', async (req, res) => {
  console.log('Payment callback received:', req.body);

  const { status, tx_ref } = req.body;

  if (status === 'completed') {
    // Update order status in the database
    try {
      await Order.updateOne({ tx_ref }, { $set: { status: 'Paid' } });
      console.log(`Order with tx_ref ${tx_ref} updated to Paid`);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  }

  res.status(200).send('Callback received');
});

module.exports = router;
