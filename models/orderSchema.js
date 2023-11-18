const mongoose = require('mongoose');
const validator = require('validator');

const CartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

const OrderSchema = new mongoose.Schema({
    items: [CartItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, { versionKey: false, collection: 'orders' });

const OrderModel = mongoose.model('orders', OrderSchema);
module.exports = { OrderModel, OrderSchema };
