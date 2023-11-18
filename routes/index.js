var express = require('express');
var router = express.Router();
const { ProductModel } = require('../models/productSchema');
const mongoose = require('mongoose');
const { dbUrl } = require('../config/dbConfig');
const { roleAdmin, validate } = require('../config/auth');




//Get product details
router.get('/product-details', async (req, res) => {
  try {
    let product = await ProductModel.find()

    res.status(200).send({
      product
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
})


//create product
router.post('/create-product', validate, roleAdmin, async (req, res) => {
  try {

    let product = await ProductModel.findOne({ name: req.body.name });

    if (!product) {

      let doc = new ProductModel(req.body);
      await doc.save();
      res.status(201).send({
        message: "Product Added successfully",
      });
    } else {
      res.status(400).send({
        message: "Product already exists",
      });
    }

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});


// Add a new route to handle adding items to the cart
router.post('/add-to-cart', async (req, res) => {
  try {
      const { productId, quantity } = req.body; // assuming you send productId and quantity in the request body
      const product = await ProductModel.findById(productId);
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }

      // Calculate total amount
      const totalAmount = product.price * quantity;

      const newCartItem = {
          product: productId,
          quantity: quantity
      };

      const order = new OrderModel({
          items: [newCartItem],
          totalAmount: totalAmount
      });

      await order.save();

      res.status(201).json({ message: "Item added to cart", order });
  } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;

