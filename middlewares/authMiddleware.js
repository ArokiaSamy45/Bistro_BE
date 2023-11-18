
const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  try {
    //get the token from headers
  
    const token = req.header("authorization").split(" ")[1];
    const decryptedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decryptedToken._id;
    next();
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
};
