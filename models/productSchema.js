const mongoose = require('mongoose');


const ProductSchema = new mongoose.Schema({
    category:{
        type: String, require: true
    },
    imgurl:{
        type: String, require: true
    },
    name: {
        type: String, require: true
    },
    description: {
        type: String, require: true
    },
    price: {
        type: Number, require: true,
    },
    createdAt: {
        type: Date, default: Date.now()
    }
}, { versionKey: false, collection: 'products' })

const ProductModel = mongoose.model('products', ProductSchema)//
module.exports = { ProductModel }

