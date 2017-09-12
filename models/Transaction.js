const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  isin: { type: String, unique: true },
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

const User = mongoose.model('User', transactionSchema);

module.exports = User;
