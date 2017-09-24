const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const httpRequest = require('https');
var querystring = require('querystring');
var mongoose = require('mongoose');
var fs = require('fs');
var util = require('util');

const transaction = require('../models/Transaction.js');
const stock = require('../models/Stock.js');

/**
 * POST /transactions
 * Create a new transaction
 */
exports.simpleTest = (req, res, next) => {

    var codeSource = "ABCA";

    transaction.find({ 'code': codeSource, 'nature': 'Acquisition' }, function (err, transactions) {

    });
    
};