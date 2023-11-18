const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config()


//to hide password using hash
const hashPassword = async (password) => {

    // //based on document of bcrypt
    let salt = await bcrypt.genSalt(10);
;
    let hash = await bcrypt.hash(password, salt);

    return hash;
};


//compare both passwords
const hashCompare = (password, hash) => {
    return bcrypt.compare(password, hash);
};

//jwt(json web token) use to create token for authentication and session time
const createToken = ({ firstName, lastName, email, role }) => {
    let token = jwt.sign({ firstName, lastName, email, role }, process.env.SECRETE_KEY, {
        expiresIn: process.env.EXPIRES 
    });
    return token;
};

//forget password validation token
const forgetPasswordToken = ({ firstName, email }) => {
    let token = jwt.sign({ firstName, email }, process.env.SECRETE_KEY_RESET, {
        expiresIn: process.env.FORGOT_EXPIRES 
    });
    return token;
};

//decode token
const decodeToken = (token) => {
    let data = jwt.decode(token);
    return data;
};

//decode forget password token
const decodePasswordToken = (token) => {
    // console.log("Received Token:", token); // Add this line
    try {
        let data = jwt.decode(token);
        // ...
    } catch (error) {
        console.error("Token decoding error:", error.message);
        throw error;
    }
};





//validation
const validate = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(" ")[1]
            let data = decodeToken(token)

            if ((Math.floor(Date.now() / 1000) <= data.exp)) {
                next()
            } else {
                res.status(401).send({
                    message: "Token Expired"
                })
            }
        } else {
            res.status(401).send({
                message: "Token Not Found"
            })
        }
    } catch (error) {
        console.log(error);
    }

    console.log(req.body); // Move this line outside of the try-catch block
}



//admin validation
const roleAdmin = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(" ")[1]
            let data = decodeToken(token)
         
            if ((data.role === 'admin')) {
                next()
            } else {
                res.status(401).send({
                    message: "Token Expired"
                })
            }

        } else {
            res.status(401).send({
                message: "Token Not Found"
            })
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = { hashPassword, hashCompare, createToken, decodeToken, validate, roleAdmin, forgetPasswordToken, decodePasswordToken}
