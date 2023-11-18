const mongoose = require('mongoose');
const validator = require('validator')


const AdminSchema = new mongoose.Schema({

    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    email: {
        type: String, require: true,
    },
    mobile:{
        type: Number, require: true,
    },
    password: {
        type: String, require: true,
    },
    role: {
        type: String, default: "admin"
    },
    token: {
        type: String, default: ""
    },
    status: {
        type: String, default: "y"
    },
    createdAt: {
        type: Date, default: Date.now()
    }

}, { versionKey: false, collection: 'admin_user' })

const AdminModel = mongoose.model('admin_user', AdminSchema)//
module.exports = { AdminModel }