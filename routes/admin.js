var express = require('express');
var router = express.Router();
const { UserModel } = require('../models/userModel')
const {AdminModel} = require('../models/adminSchema')
const { OrderModel } = require('../models/orderSchema')
const { ProductModel } = require('../models/productSchema')
const {adminEmailService} = require('../service/adminEmailService')
const { hashPassword, hashCompare, createToken, decodeToken, validate, roleAdmin, forgetPasswordToken, decodePasswordToken } = require('../config/auth');
const jwt = require("jsonwebtoken");

//frontend url
let frontUrl = "https://seaview-bistro.netlify.app/"

// admin login
router.post("/adminLogin", async (req, res) => {
    try {
        let user = await AdminModel.findOne({ email: req.body.email });

        if (user) {
            if (user.role === "admin") {
                if (await hashCompare(req.body.password, user.password)) {
                    let token = await createToken({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                    });

                    res.status(200).send({
                        message:"Admin login successfully",
                        token,
                        role: user.role,
                        user
                    });
                } else {
                    res.status(400).send({
                        message: "Invalid Credential",
                    });
                }
            } else {
                res.status(400).send({
                    message: "Admin can only access",
                });
            }
        } else {
            res.status(400).send({
                message: "Admin can only access",
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


//Creating admin
router.post('/adminSignUp', async (req, res) => {
    try {

      let user = await AdminModel.findOne({ email: req.body.email });
  
      if (!user) {
        req.body.password = await hashPassword(req.body.password);
        let doc = new AdminModel(req.body);
        await doc.save();
        res.status(201).send({
          message: "Admin added successfully",
        });
      } else {
        res.status(400).send({
          message: "Email already exists",
        });
      }

    console.log(user);

    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "internal server error",
        error,
      });
    }
  });


//get order details
router.get('/getOrder', validate,roleAdmin, async (req, res) => {
    try {
        let products = await OrderModel.find()

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


//get all products
router.get('/getProducts', validate,roleAdmin, async (req, res) => {
    try {
        let values = await ProductModel.find()

        res.status(200).send({
            values
        });


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal server error",
            error,
        });
    }
});


//create product
router.post('/create-product', async (req, res) => {
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

//change status pending to delivery
router.post('/order-Status', async (req, res) => {
    try {
        let products = await OrderModel.findByIdAndUpdate({ _id: req.body.OrderId }, { status: req.body.Status });

        res.status(200).send({
            message: "Status changed successfully"
        });


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal server error",
            error,
        });
    }
});


//get all products
router.post('/getSingleProduct', async (req, res) => {
    try {
        let values = await ProductModel.findOne({ _id: req.body.id });

        res.status(200).send({
            values
        });


    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "internal server error",
            error,
        });
    }
});


//update products
router.put('/updateProduct/:id', async (req, res) => {
    try {
        let values = await ProductModel.findOne({ _id: req.params.id });

        if (values) {
            let doc = await ProductModel.updateOne(
                { _id: req.params.id },
                { $set: req.body.values },
            );

            res.status(201).send({
                message: "product updated successfully",
                doc
            });
        } else {
            res.status(400).send({
                message: "Invalid Id",
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

//delete product 
router.delete("/deleteProduct/:id", validate, roleAdmin, async (req, res) => {
    try {

        let product = await ProductModel.findOne({ _id: req.params.id });

        if (product) {
            let doc = await ProductModel.deleteOne({ _id: req.params.id });

            res.status(201).send({
                message: "Product Deleted successfully",
            });
        } else {
            res.status(400).send({
                message: "Invalid Id",
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



//admin-send email
router.post("/send-email", async (req, res) => {

    try {
      let user = await AdminModel.findOne({ email: req.body.email });

      console.log(user);
  
      if (user) {
      
        let firstName = user.firstName
        let email = user.email
  
        // creating token       
        let token = jwt.sign({ firstName, email }, process.env.ADMIN_SECRETE_KEY_RESET, {
          expiresIn: process.env.ADMIN_FORGOT_EXPIRES
        });
  

        const setUserToken = await AdminModel.findByIdAndUpdate({ _id: user._id }, { token: token });
  
  
        await adminEmailService({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          message: `${frontUrl}/admin-reset-password/${user._id}/${token}`
        })
  
    
        res.status(200).send({
          message: "Email send successfully",
        });
  
      } else {
        res.status(400).send({
          message: "Email does not exists",
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
  
  
  //admin verify token for reset password
  router.get("/admin-reset-password/:id/:token", async (req, res) => {
    try {
      const token = req.params.token;
  
      const data = await decodePasswordToken(token);
      // ...
  } catch (error) {
      console.log(error);
      res.status(500).send({
          message: "internal server error",
          error,
      });
  }
  
  });
  
  
  
  //change password
  router.post("/admin-change-password/:id/:token", async (req, res) => {
    try {
      let token = req.params.token;
      var password = req.body.password

      var changePass = await hashPassword(password);
   
      const updatePassword = await AdminModel.findByIdAndUpdate({ _id: req.params.id }, { password: changePass });

      res.status(200).send({
        message: 'Password updated successfully'
      })
  
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "internal server error",
        error,
      });
    }
  });


module.exports = router;