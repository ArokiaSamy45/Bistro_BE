const express = require('express');
const router = express.Router();
const { OrderModel } = require('../models/orderSchema')
const { dbUrl } = require('../config/dbConfig')
const mongoose = require('mongoose');
const { validate } = require('../config/auth');

//connect to db
mongoose.connect(dbUrl)

//save order 
router.post('/saveOrder', async (req, res) => {
  try {
    let doc = new OrderModel(req.body);
    await doc.save();
    res.status(201).send({
      message: "Order saved successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//get all orders
router.post('/getOrder', async (req, res) => {
  try {
    let products = await OrderModel.find({ email: req.body.email })
   
    res.status(200).send({
      products
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});



module.exports = router;