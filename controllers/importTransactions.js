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
exports.importTransactions = (req, res, next) => {

    var http = new XMLHttpRequest();
    
    //importISIN();
    //importFromCSV();

    function importISIN(callback) {
        var lineList = fs.readFileSync('../Euronext_Equities_EU.csv').toString().split('\n');
        lineList.shift();

        var schemaKeyList = ['isin', 'code'];
        
        function createDocRecurse(err) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            if (lineList.length) {
                var line = lineList.shift();
                var doc = new stock();
                doc['id'] = mongoose.Types.ObjectId();
                line.split(';').forEach(function (entry, i) {
                    doc[schemaKeyList[i - 1]] = entry;
                });
                console.log(doc['code']);
                doc.save(createDocRecurse);
            }
            //callback(null);
        }

        createDocRecurse(null);
    }

    function importFromCSV() {
        var lineList = fs.readFileSync('../data.csv').toString().split('\n');
        lineList.shift();

        var schemaKeyList = ['isin', 'company', 'manager', 'date', 'nature', 'instrument',
            'price', 'quantity', 'total', 'capital_share', 'currency'];

        // Recursively go through list adding documents.
        // (This will overload the stack when lots of entries
        // are inserted.  In practice I make heavy use the NodeJS 
        // "async" module to avoid such situations.)
        function createDocRecurse(err) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            if (lineList.length) {
                var line = lineList.shift();
                var doc = new transaction();
                doc['id'] = mongoose.Types.ObjectId();
                line.split(';').forEach(function (entry, i) {
                    doc[schemaKeyList[i]] = entry;
                });
                if (doc.instrument.includes('Action')) {
                    if (doc.nature.includes('Cession')) {
                        updateStock(doc.isin, doc.total, false);
                    } else if (doc.nature.includes('Acquisition')) {
                        updateStock(doc.isin, doc.total, true);
                    }
                }
                doc.save(createDocRecurse);
            }
        }

        createDocRecurse(null);
    }
    
    function updateStock(isinSource, total, isBought) {
        stock.findOne({ 'isin': isinSource }, function (err, stockFound) {
            if (err) return handleError(err);
            if (stockFound != null) {
                console.log("Mouvement : " + stockFound.code);
                if (isBought) {
                    stockFound.total_bought = stockFound.total_bought + total;
                } else {
                    console.log(stockFound.total_sold);
                    stockFound.total_sold = stockFound.total_sold + total;
                }
                stockFound.save();
            }
        })
    }

};