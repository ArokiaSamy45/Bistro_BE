var express = require('express');
var router = express.Router();
var Razorpay = require('razorpay');
var crypto = require('crypto');

var KEY_ID = 'rzp_test_74zya6whmuzlxs';
var KEY_SECRET = 'AhNUubRKcR3yv5wpLFcD4KfX';

// Create a Razorpay instance
var instance = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

// Route for creating a Razorpay order
router.post('/order', async (req, res) => {
  try {
    var options = {
      amount: req.body.amount * 100, // Convert amount to the smallest currency unit
      currency: 'INR',
    };

    instance.orders.create(options, function (err, order) {
      if (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Server error' });
      } else {
        res.status(200).json({
          message: 'Order created successfully',
          order,
        });
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route for verifying Razorpay order details
router.post('/verify', (req, res) => {
  try {
    const body =
      req.body.response.razorpay_order_id +
      '|' +
      req.body.response.razorpay_payment_id;

    var expectedSignature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === req.body.response.razorpay_signature) {
      res.status(200).json({ message: 'Signature Valid' });
    } else {
      res.status(400).json({ message: 'Signature Invalid' });
    }
  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
