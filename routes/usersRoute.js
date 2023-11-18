const router = require("express").Router();
const express = require("express");
const User = require("../models/userModel");
const { passwordEmail } = require('../service/passwordEmail')
const bcrypt = require("bcryptjs");
const { hashPassword, hashCompare, createToken, decodeToken, validate, roleAdmin, forgetPasswordToken, decodePasswordToken } = require('../config/auth');


router.use(express.urlencoded({extended: false}));
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
const authMiddleware = require("../middlewares/authMiddleware");

//frontend url
let frontUrl = "http://localhost:3000"

//New User Registration
router.post("/register", async (req, res) => {
  try {
    //Check if the user is already registered
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      throw new Error("Already registered");
    }
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashPassword;
      // save user
      const newUser = new User(req.body);
      await newUser.save();
      res.send({
        success: true,
        message: "User created successfully",
      });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
});

//UserLogin
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).send({
        error: "User not found",
      });
    }

    if (user.status !== "active") {
      return res.status(400).send({
        error: "User account is blocked. Please contact the admin.",
      });
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if (!validPassword) {
      return res.status(400).send({
        error: "Invalid password",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.send({
      message: "User logged in successfully",
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({
      error: "An error occurred during login.",
    });
  }
});

//send email
router.post("/send-email", async (req, res) => {

  try {
    let user = await User.findOne({ email: req.body.email });

    if (user) {

      let firstName = user.firstName
      let email = user.email

      // creating token       
      let token = jwt.sign({ firstName, email }, process.env.SECRETE_KEY_RESET, {
        expiresIn: process.env.FORGOT_EXPIRES
      });

      const setUserToken = await User.findByIdAndUpdate({ _id: user._id }, { token: token });


      await passwordEmail({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        message: `${frontUrl}/reset-password/${user._id}/${setUserToken.token}`
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


//verify token for reset password
router.get("/reset-password/:id/:token", async (req, res) => {
  try {
      const token = req.params.token;
      // console.log("Token from Request:", token); // Add this line
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
router.post("/change-password/:id/:token", async (req, res) => {
  try {
    let token = req.params.token;
    const _id = req.params.id;
    var password = req.body.password

    var changePass = await hashPassword(password);

    const updatePassword = await User.updateOne({ _id: _id }, { $set: { password: changePass } });

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