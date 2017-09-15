const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    isin: String,
    company: String,
    manager: String,
    date: Date,
    nature: String,
    instrument: String,
    price: Number,
    quantity: Number,
    total: Number,
    capital_share: Number,
    currency: String
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
