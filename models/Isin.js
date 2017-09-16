const mongoose = require('mongoose');

const isinSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    isin: String,
    code: String,
    close: [[Date], [Number]]
});

const Isin = mongoose.model('Isin', isinSchema);

module.exports = Isin;
