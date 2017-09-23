const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    isin: String,
    code: String,
    close: [[String, String]],
    total_bought: { type: Number, default: 0 },
    total_sold: { type: Number, default: 0 }
});

const Stock = mongoose.model('Isin', stockSchema);

module.exports = Stock;
